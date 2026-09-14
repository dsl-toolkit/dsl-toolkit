#!/usr/bin/env node
'use strict'

/*
 * Smart release for the dsl-toolkit monorepo.
 *
 * WHY THIS EXISTS (and why it does not just call `lerna publish`):
 * Lerna ships its own bundled registry client (libnpmpublish 11.1.2 /
 * npm-registry-fetch 19.1.0 in BOTH lerna 9 and lerna 10). That client cannot
 * perform npm's current 2FA handshake; the registry answers it with
 *   "EOTP You must provide a one-time pass. Upgrade your client to npm@latest
 *    in order to use 2FA."
 * and the publish dies. Upgrading Lerna does not change those pins.
 *
 * So: Lerna does what it is good at (package discovery + version bumping and
 * tagging), and the actual registry write is delegated to the npm CLI on PATH,
 * which does support the current 2FA flow (WebAuthn browser flow or classic OTP).
 *
 * Modes, chosen automatically:
 *   1. STRANDED     local version is not on npm yet   -> publish as-is, NO bump
 *   2. IN SYNC      every package matches npm         -> lerna version, then publish
 *   3. REGISTRY AHEAD  npm has a version we lack      -> hard error, stops
 *
 * Idempotent: npm reports success before the version is readable from the
 * registry, so every lookup retries, and "cannot publish over the previously
 * published versions" is treated as "already published", not as a failure.
 * Re-running is safe.
 *
 * Usage:
 *   npm run release              reconcile, then publish (or bump + publish)
 *   npm run release:check        dry report only, publishes nothing
 *   node bin/release.js --otp=123456
 *   node bin/release.js --bump=minor
 */

const cp = require('child_process')
const path = require('path')
const fs = require('fs')

const ROOT = path.join(__dirname, '..')
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const CHECK_ONLY = process.argv.includes('--check')
const OTP_ARG = process.argv.find((a) => a.startsWith('--otp='))
const BUMP = (process.argv.find((a) => a.startsWith('--bump=')) || '--bump=patch').split('=')[1]
const NO_PUSH = process.argv.includes('--no-push')

// how long to keep re-checking the registry for propagation
const VERIFY_TIMEOUT_MS = Number(process.env.RELEASE_VERIFY_TIMEOUT_MS || 180000)
const VERIFY_INTERVAL_MS = 5000

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

function sh (cmd, args, opts = {}) {
  return cp.spawnSync(cmd, args, { encoding: 'utf8', cwd: ROOT, ...opts })
}

/** Lerna's own resolver, preferring the locally installed copy. */
function lernaBin () {
  const local = path.join(ROOT, 'node_modules', '.bin', 'lerna')
  return fs.existsSync(local) ? local : 'npx'
}

function lernaArgs (args) {
  return lernaBin() === 'npx' ? ['lerna', ...args] : args
}

function listPackages () {
  const res = sh(lernaBin(), lernaArgs(['list', '--json', '--all']))
  if (res.status !== 0) {
    console.error(res.stderr || res.stdout)
    throw new Error('lerna list failed')
  }
  // lerna prints notices before the JSON payload
  const start = res.stdout.indexOf('[')
  if (start < 0) throw new Error('could not parse lerna list output')
  return JSON.parse(res.stdout.slice(start))
}

function readPkgJson (location) {
  return JSON.parse(fs.readFileSync(path.join(location, 'package.json'), 'utf8'))
}

/** Publish order: dependencies before dependents, restricted to our own packages. */
function topological (pkgs) {
  const byName = new Map(pkgs.map((p) => [p.name, p]))
  const done = new Set()
  const out = []
  const visit = (pkg, stack) => {
    if (done.has(pkg.name) || stack.has(pkg.name)) return
    stack.add(pkg.name)
    const json = readPkgJson(pkg.location)
    const deps = {
      ...(json.dependencies || {}),
      ...(json.optionalDependencies || {}),
      ...(json.peerDependencies || {})
    }
    for (const name of Object.keys(deps)) {
      const dep = byName.get(name)
      if (dep) visit(dep, stack)
    }
    stack.delete(pkg.name)
    done.add(pkg.name)
    out.push(pkg)
  }
  for (const pkg of pkgs) visit(pkg, new Set())
  return out
}

/**
 * Exact-version lookup. Returns the version string when the registry has it,
 * else null. npm answers from the packument, which lags behind a fresh publish,
 * so this retries.
 */
function npmVersion (spec, { retries = 0, delayMs = 4000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = sh(NPM, ['view', spec, 'version', '--json'], { cwd: ROOT })
    if (res.status === 0) {
      const out = (res.stdout || '').trim()
      if (out) {
        try {
          const parsed = JSON.parse(out)
          if (typeof parsed === 'string') return parsed
        } catch (e) {
          return out.replace(/"/g, '')
        }
      }
    }
    if (attempt >= retries) return null
    sleep(delayMs)
  }
}

function cmpVersion (a, b) {
  const pa = String(a).split('-')[0].split('.').map(Number)
  const pb = String(b).split('-')[0].split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0)
    if (d) return d > 0 ? 1 : -1
  }
  return 0
}

/**
 * Publish one package with the npm CLI.
 * stdin/stdout stay inherited so npm can run its own browser/OTP 2FA prompt;
 * stderr is tee'd and buffered so we can classify the failure.
 */
function publishOne (pkg, otp) {
  return new Promise((resolve) => {
    console.log(`\n>>> npm publish  ${pkg.name}@${pkg.version}`)
    const child = cp.spawn(NPM, ['publish', ...otp], {
      cwd: pkg.location,
      stdio: ['inherit', 'inherit', 'pipe']
    })
    let stderr = ''
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
      process.stderr.write(chunk)
    })
    child.on('error', (err) => resolve({ ok: false, why: err.message }))
    child.on('close', (code) => {
      if (code === 0) return resolve({ ok: true })
      if (/cannot publish over the previously published versions/i.test(stderr) ||
          /EPUBLISHCONFLICT/.test(stderr)) {
        return resolve({ ok: true, already: true })
      }
      resolve({ ok: false, why: `npm publish exited ${code}` })
    })
  })
}

/** Poll until every package's exact version is readable, or time out. */
function verifyAll (pkgs) {
  const deadline = Date.now() + VERIFY_TIMEOUT_MS
  const pending = pkgs.map((p) => p)
  const missing = []
  while (pending.length) {
    for (let i = pending.length - 1; i >= 0; i--) {
      const pkg = pending[i]
      if (npmVersion(`${pkg.name}@${pkg.version}`) === pkg.version) {
        console.log(`  OK   ${pkg.name}@${pkg.version}`)
        pending.splice(i, 1)
      }
    }
    if (!pending.length) break
    if (Date.now() >= deadline) break
    process.stdout.write(`  ... waiting on ${pending.map((p) => p.name).join(', ')}\n`)
    sleep(VERIFY_INTERVAL_MS)
  }
  for (const pkg of pending) {
    missing.push(pkg)
    console.log(`  PENDING ${pkg.name}@${pkg.version}`)
  }
  return missing
}

async function main () {
  console.log('--- Reconciling workspace packages against npm ---')
  const all = listPackages()
  const publishable = all.filter((p) => !p.private)
  const skipped = all.filter((p) => p.private)

  const report = []
  for (const pkg of publishable) {
    const npmLatest = npmVersion(pkg.name)
    const exact = npmVersion(`${pkg.name}@${pkg.version}`)
    let state
    if (exact === pkg.version) {
      state = 'synced'
    } else if (!npmLatest) {
      state = 'new'
    } else if (cmpVersion(pkg.version, npmLatest) > 0) {
      state = 'stranded'
    } else {
      state = 'registry-ahead'
    }
    report.push({ ...pkg, npmLatest, state })
  }

  const width = Math.max(...report.map((r) => r.name.length), 10)
  for (const r of report) {
    const marker = { synced: '=', stranded: '^', new: '+', 'registry-ahead': '!' }[r.state]
    console.log(
      `  ${marker} ${r.name.padEnd(width)} local=${String(r.version).padEnd(9)} npm=${String(r.npmLatest || '(none)').padEnd(9)} ${r.state}`
    )
  }
  if (skipped.length) {
    console.log(`  (skipped private: ${skipped.map((p) => p.name).join(', ')})`)
  }

  const ahead = report.filter((r) => r.state === 'registry-ahead')
  const stranded = report.filter((r) => r.state === 'stranded' || r.state === 'new')

  if (ahead.length) {
    console.error(
      '\nERROR: npm has a newer version than this checkout for: ' +
      ahead.map((r) => `${r.name} (local ${r.version} < npm ${r.npmLatest})`).join(', ')
    )
    console.error('That means a release happened without being committed. Refusing to publish on top of it.')
    console.error('Reconcile manually (pull/merge, or bump local past npm) and re-run.')
    process.exit(2)
  }

  if (CHECK_ONLY) {
    console.log(
      '\n[check only] ' +
      (stranded.length
        ? `would PUBLISH AS-IS (no bump): ${stranded.map((r) => `${r.name}@${r.version}`).join(', ')}`
        : 'everything in sync -> would BUMP and publish')
    )
    return
  }

  const otp = OTP_ARG ? [OTP_ARG] : []
  const ordered = topological(publishable)
  const failures = []
  let attempted = []

  if (stranded.length) {
    console.log(`\nFound ${stranded.length} package(s) already bumped but not published. Publishing as-is.`)
    attempted = ordered.filter((p) => stranded.some((s) => s.name === p.name))
  } else {
    console.log(`\nAll local packages match npm. Bumping (${BUMP}) and publishing.`)
    const res = sh(lernaBin(), lernaArgs(['version', BUMP, '--yes', '--no-push']), { stdio: 'inherit' })
    if (res.status !== 0) throw new Error('lerna version failed')

    const bumped = listPackages().filter((p) => !p.private)
    const changed = bumped.filter((p) => npmVersion(`${p.name}@${p.version}`) !== p.version)
    attempted = topological(changed)
    if (!attempted.length) {
      console.log('Nothing to publish after the bump.')
      return
    }
  }

  // Publish every target; one failure must not block the rest.
  for (const pkg of attempted) {
    const result = await publishOne(pkg, otp)
    if (result.already) {
      console.log(`  = ${pkg.name}@${pkg.version} was already published`)
    } else if (!result.ok) {
      console.error(`  FAILED ${pkg.name}@${pkg.version}: ${result.why}`)
      failures.push(pkg)
    }
  }

  console.log('\n--- Verifying (npm needs a moment to propagate) ---')
  const missing = verifyAll(listPackages().filter((p) => !p.private))

  if (failures.length) {
    console.error(`\n${failures.length} package(s) failed to publish: ${failures.map((p) => p.name).join(', ')}`)
    process.exit(1)
  }
  if (missing.length) {
    console.log(
      `\nAll publishes were accepted by npm; ${missing.length} version(s) are still propagating ` +
      `(${missing.map((p) => `${p.name}@${p.version}`).join(', ')}).`
    )
    console.log('This is normal registry lag. Re-run `npm run release:check` in a minute to confirm.')
    return
  }

  if (!stranded.length && !NO_PUSH) {
    console.log('\n>>> pushing commits and tags')
    const push = sh('git', ['push', '--follow-tags'], { stdio: 'inherit' })
    if (push.status !== 0) {
      console.error('git push failed')
      process.exit(1)
    }
  }

  console.log('\nRelease complete.')
}

main().catch((err) => {
  console.error(`\n${err.message}`)
  process.exit(1)
})
