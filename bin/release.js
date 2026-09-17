#!/usr/bin/env node
'use strict'

/*
 * Smart release for the dsl-toolkit monorepo.
 *
 * Pipeline (tests first, so a failure changes nothing):
 *   0. preflight + sync      clean tree, then fetch/ff origin BEFORE publishing,
 *                            because `git push` is the last step: releasing while
 *                            behind origin would publish to npm and then fail the push
 *   1. tests + coverage      -- `npm test` is the coverage run: one nyc pass
 *                               produces both the result and coverage-summary.json
 *   2. refresh badges        -- bin/update-coverage.js writes coverage/*.svg and
 *                               the per-package badge into each README
 *   3. publish badges        -- bin/publish-badge.js force-pushes gh-pages, so the
 *                               READMEs that npm is about to pack have live images
 *   4. commit badge refresh  -- leaves a clean tree for lerna version
 *   5. reconcile + publish   -- verify npm auth BEFORE versioning, then publish
 *   6. push commits + tags
 *   7. verify on the registry
 *
 * Steps 1-3 GATE the release: if any fails, nothing is published.
 *
 * WHY npm PUBLISHES AND LERNA DOES NOT:
 * Lerna ships its own bundled registry client (libnpmpublish 11.1.2 /
 * npm-registry-fetch 19.1.0 in BOTH lerna 9 and lerna 10). That client cannot
 * perform npm's current 2FA handshake; the registry answers it with
 *   "EOTP You must provide a one-time pass. Upgrade your client to npm@latest
 *    in order to use 2FA."
 * and the publish dies. Upgrading Lerna does not change those pins. So Lerna is
 * used for discovery + versioning + tagging, and the registry write is delegated
 * to the npm CLI on PATH, which supports the WebAuthn browser flow.
 *
 * Reconcile modes, chosen automatically:
 *   1. STRANDED     local version is not on npm yet   -> publish as-is, NO bump
 *   2. IN SYNC      every package matches npm         -> lerna version, then publish
 *   3. REGISTRY AHEAD  npm has a version we lack      -> hard error, stops
 *
 * Idempotent: npm reports success before the version is readable from the
 * registry, so every lookup retries, and "cannot publish over the previously
 * published versions" (or "... over a previously staged version") is treated as
 * "already published", not as a failure.
 *
 * DOCS-ONLY RELEASES:
 * Markdown is excluded from lerna's change detection because step 2 rewrites the
 * coverage badge inside every package README, and one badge digit changing must
 * not version every package. Excluding *all* markdown, though, would make
 * authored documentation invisible to the release forever. So a package whose
 * markdown changed outside the generated coverage block is added back with
 * `lerna version --force-publish`. Badge-only changes are still ignored.
 *
 * The exclusion has to stay path-based (not "did badges change this run"):
 * a badge commit from an earlier release is still inside the tag..HEAD range,
 * so it would resurface as a change on every later run.
 *
 * Usage:
 *   npm run release                 full pipeline
 *   npm run release:check           read-only report, runs nothing
 *   node bin/release.js --skip-tests        packages only (no tests/badges)
 *   node bin/release.js --skip-badge        tests + badges, no gh-pages push
 *   node bin/release.js --no-sync           do not fetch/reconcile with origin
 *   node bin/release.js --otp=123456
 *   node bin/release.js --bump=minor
 */

const cp = require('child_process')
const path = require('path')
const fs = require('fs')

const ROOT = path.join(__dirname, '..')
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const CHECK_ONLY = process.argv.includes('--check')
const SKIP_TESTS = process.argv.includes('--skip-tests')
const SKIP_BADGE = process.argv.includes('--skip-badge')
const SKIP_SYNC = process.argv.includes('--no-sync')
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

/** Run a gating pipeline step, streaming its output. Throws on failure. */
function runStep (label, cmd, args) {
  console.log(`\n===== ${label} =====`)
  const res = cp.spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit' })
  if (res.error) throw res.error
  if (res.status !== 0) {
    throw new Error(`${label} failed (exit ${res.status}) -- nothing was published`)
  }
}

function nodeScript (name) {
  return [process.execPath, [path.join(ROOT, 'bin', name)]]
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
          /cannot publish over previously staged version/i.test(stderr) ||
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

/**
 * Stage + commit just the badge-bearing READMEs, so lerna version sees a clean
 * tree. Returns true when a commit was actually made.
 */
function commitBadgeRefresh () {
  const readmes = [
    'README.md',
    ...fs.readdirSync(path.join(ROOT, 'packages'))
      .map((pkg) => path.join('packages', pkg, 'README.md'))
      .filter((rel) => fs.existsSync(path.join(ROOT, rel)))
  ]
  const add = sh('git', ['add', '--', ...readmes])
  if (add.status !== 0) throw new Error('git add of READMEs failed')
  const staged = sh('git', ['diff', '--cached', '--quiet'])
  if (staged.status === 0) {
    console.log('badges unchanged, nothing to commit')
    return false
  }
  console.log('\n===== commit badge refresh =====')
  const commit = sh('git', ['commit', '--quiet', '-m', 'chore(coverage): refresh badges'], { stdio: 'inherit' })
  if (commit.status !== 0) throw new Error('git commit of badge refresh failed')
  console.log('committed badge refresh')
  return true
}

/**
 * Remove a marker-delimited generated block (markers included). Content before
 * and after is kept; an unterminated block is left alone.
 */
function stripBlock (text, begin, end) {
  let out = ''
  let rest = text
  while (rest.length) {
    const i = rest.indexOf(begin)
    if (i < 0) break
    out += rest.slice(0, i)
    const j = rest.indexOf(end, i + begin.length)
    if (j < 0) {
      rest = rest.slice(i)
      break
    }
    rest = rest.slice(j + end.length)
  }
  return out + rest
}

/**
 * Blank out the blocks the release pipeline generates, so a badge refresh is
 * not mistaken for an authored documentation change. The coverage badge is the
 * only generated markdown; update-coverage.js rewrites exactly this block.
 */
function stripGeneratedBlocks (text) {
  return stripBlock(text, '<!--- coverage begin -->', '<!--- coverage end -->')
}

/** Markdown files tracked under a package directory at a given ref. */
function markdownFilesAt (ref, pkgRel) {
  const res = sh('git', ['ls-tree', '-r', '--name-only', ref, '--', pkgRel])
  if (res.status !== 0) return []
  return (res.stdout || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((file) => /\.md$/i.test(file))
}

/** File content at a ref, or '' when the path does not exist there. */
function fileAt (ref, file) {
  const res = sh('git', ['show', `${ref}:${file}`])
  return res.status === 0 ? (res.stdout || '') : ''
}

/**
 * The package's last release tag. Versioning is independent, so tags are
 * named `<package>@<version>`.
 */
function lastTagFor (name) {
  const res = sh('git', ['describe', '--tags', '--abbrev=0', '--match', `${name}@*`, 'HEAD'])
  return res.status === 0 ? (res.stdout || '').trim() : null
}

/**
 * True when a package's markdown changed since its last release tag outside the
 * generated coverage block -- i.e. somebody edited the docs. Badge refreshes are
 * stripped, so they never count. Packages without a release tag are left to
 * lerna's normal new-package handling.
 */
function hasAuthoredDocsChange (pkg) {
  const tag = lastTagFor(pkg.name)
  if (!tag) return false
  const pkgRel = path.relative(ROOT, pkg.location).split(path.sep).join('/')
  const files = new Set([
    ...markdownFilesAt(tag, pkgRel),
    ...markdownFilesAt('HEAD', pkgRel)
  ])
  for (const file of files) {
    if (stripGeneratedBlocks(fileAt(tag, file)) !== stripGeneratedBlocks(fileAt('HEAD', file))) {
      return true
    }
  }
  return false
}

/**
 * Packages lerna considers changed once generated markdown is excluded. This is
 * the same predicate `lerna version` uses below, so the read-only report and a
 * real release agree. `lerna changed` exits 1 with empty stdout when there is
 * nothing to report, which is not an error here.
 */
function codeChangedPackages () {
  const res = sh(lernaBin(), lernaArgs(['changed', '--json', '--ignore-changes', '**/*.md']))
  const out = res.stdout || ''
  const start = out.indexOf('[')
  if (start < 0) return []
  try {
    return JSON.parse(out.slice(start))
  } catch (e) {
    return []
  }
}

/** Push commits + tags unless --no-push was given. */
function pushCommitsAndTags () {
  if (NO_PUSH) {
    console.log('\n>>> push skipped (--no-push)')
    return
  }
  console.log('\n>>> pushing commits and tags')
  const push = sh('git', ['push', '--follow-tags'], { stdio: 'inherit' })
  if (push.status !== 0) {
    console.error('git push failed')
    process.exit(1)
  }
}

/**
 * Lerna refuses to version a dirty tree (EUNCOMMIT) and its change detection
 * cannot see uncommitted work, so a release has to start from a clean tree.
 */
function assertCleanTree () {
  const res = sh('git', ['status', '--porcelain'])
  if (res.status !== 0) throw new Error('git status failed')
  const dirty = (res.stdout || '').trim()
  if (!dirty) return
  console.error('\nERROR: the working tree has uncommitted changes:\n')
  dirty.split('\n').forEach((line) => console.error(`  ${line}`))
  console.error(
    '\nCommit or stash them first. Lerna will not version a dirty tree, and its\n' +
    'change detection cannot see uncommitted work, so nothing would be released.'
  )
  process.exit(2)
}

/**
 * Fetch and reconcile with the upstream branch before anything is published.
 *
 * This has to happen BEFORE the npm publish: `git push` is the very last step,
 * so releasing while behind origin would publish packages to npm and then fail
 * the push, leaving the registry and the repository disagreeing.
 *
 *   behind only  -> fast-forward (safe, no local commits to lose)
 *   ahead only   -> fine, these are the commits being released
 *   diverged     -> stop and let a human merge
 */
function syncWithRemote ({ dryRun = false } = {}) {
  const branch = (sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']).stdout || '').trim()
  if (!branch || branch === 'HEAD') {
    throw new Error('detached HEAD -- check out a branch before releasing')
  }

  console.log(`\n===== sync with origin (${branch}) =====`)
  const fetch = sh('git', ['fetch', '--prune', 'origin'], { stdio: 'inherit' })
  if (fetch.status !== 0) throw new Error('git fetch failed')

  const upstreamRes = sh('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'])
  const upstream = upstreamRes.status === 0 && upstreamRes.stdout.trim()
    ? upstreamRes.stdout.trim()
    : `origin/${branch}`

  const counts = sh('git', ['rev-list', '--left-right', '--count', `${upstream}...HEAD`])
  if (counts.status !== 0) throw new Error(`cannot compare with ${upstream}`)
  const [behind, ahead] = counts.stdout.trim().split(/\s+/).map(Number)

  if (behind === 0) {
    console.log(`up to date with ${upstream} (${ahead} local commit(s) ahead, to be released)`)
    return
  }

  if (ahead > 0) {
    console.error(
      `\nERROR: ${upstream} has ${behind} commit(s) you do not have, and you have ` +
      `${ahead} local commit(s).`
    )
    console.error('The branch has diverged. Merge or rebase it yourself, then re-run:')
    console.error(`  git merge ${upstream}`)
    process.exit(2)
  }

  if (dryRun) {
    console.log(`[check only] ${behind} commit(s) behind ${upstream}; would fast-forward`)
    return
  }

  console.log(`${upstream} is ${behind} commit(s) ahead; fast-forwarding`)
  const merge = sh('git', ['merge', '--ff-only', upstream], { stdio: 'inherit' })
  if (merge.status !== 0) throw new Error('fast-forward merge failed')
}

/**
 * `lerna version` commits before the first `npm publish` runs, so an
 * unauthenticated release used to leave a bumped-but-unpublished commit and tag
 * behind and only then fail. Checking credentials first keeps that from
 * happening: it is the one gate that has to run before anything is written.
 */
function assertNpmAuth () {
  const res = sh(NPM, ['whoami'], { stdio: ['ignore', 'pipe', 'pipe'] })
  const who = (res.stdout || '').trim()
  if (res.status !== 0 || !who) {
    console.error('\nERROR: npm is not authenticated, so nothing can be published.')
    console.error('Run `npm login` (or set NPM_TOKEN), then re-run.')
    console.error('Nothing was versioned or published.')
    process.exit(2)
  }
  console.log(`\nnpm authenticated as ${who}`)
}

async function main () {
  if (CHECK_ONLY) {
    // still worth knowing whether origin has moved, but never merge while checking
    if (!SKIP_SYNC) syncWithRemote({ dryRun: true })
  } else {
    assertCleanTree()
    if (SKIP_SYNC) {
      console.log('\n===== sync with origin ===== skipped (--no-sync)')
    } else {
      syncWithRemote()
    }
  }

  // ---- gating stages: tests -> coverage -> badges -> commit -----------------
  let badgesRefreshed = false
  if (!CHECK_ONLY && !SKIP_TESTS) {
    runStep('tests + coverage', NPM, ['test'])

    runStep('refresh coverage badges', ...nodeScript('update-coverage.js'))

    if (SKIP_BADGE) {
      console.log('\n===== publish badges ===== skipped (--skip-badge)')
    } else {
      runStep('publish badges to gh-pages', ...nodeScript('publish-badge.js'))
    }

    badgesRefreshed = commitBadgeRefresh()
  }

  // ---- reconcile ------------------------------------------------------------
  console.log('\n--- Reconciling workspace packages against npm ---')
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
    // Mirror what a real release would detect, so "would BUMP and publish" is
    // never printed when lerna would actually find no changed packages.
    const codeChanged = codeChangedPackages().map((p) => p.name)
    const docsChanged = publishable.filter((p) => hasAuthoredDocsChange(p)).map((p) => p.name)
    const wouldBump = [...new Set([...codeChanged, ...docsChanged])]

    console.log('\n--- Changed since the last release ---')
    console.log(`  code: ${codeChanged.length ? codeChanged.join(', ') : '(none)'}`)
    console.log(`  docs: ${docsChanged.length ? docsChanged.join(', ') : '(none)'} (markdown outside the coverage badge)`)

    if (stranded.length) {
      console.log(
        `\n[check only] would PUBLISH AS-IS (no bump): ${stranded.map((r) => `${r.name}@${r.version}`).join(', ')}`
      )
    } else if (wouldBump.length) {
      console.log(`\n[check only] everything in sync -> would BUMP and publish: ${wouldBump.join(', ')}`)
    } else {
      console.log('\n[check only] no changed packages -> a real release would publish nothing.')
    }
    return
  }

  assertNpmAuth()

  // ---- publish --------------------------------------------------------------
  const otp = OTP_ARG ? [OTP_ARG] : []
  const ordered = topological(publishable)
  const failures = []
  let attempted = []

  if (stranded.length) {
    console.log(`\nFound ${stranded.length} package(s) already bumped but not published. Publishing as-is.`)
    attempted = ordered.filter((p) => stranded.some((s) => s.name === p.name))
  } else {
    console.log(`\nAll local packages match npm. Bumping (${BUMP}) and publishing.`)
    // Markdown is excluded from change detection: the badge refresh that just
    // ran touches every package README, and that must not version every package.
    //
    // Dependent propagation is disabled in lerna.json
    // (command.version.excludeDependents). Lerna's project graph includes
    // *devDependency* edges, so a real change in generic-text-linker would
    // otherwise drag in cowlog, whose only link to it is a devDependency --
    // publishing a release whose shipped code is identical. Note this is a
    // lerna.json key, NOT a CLI flag: `lerna version --exclude-dependents` is
    // rejected as an unknown argument (only exec/list/run/clean register it).
    const versionArgs = [
      'version', BUMP, '--yes', '--no-push', '--ignore-changes', '**/*.md'
    ]

    // Authored markdown was ignored above along with the badges, so put those
    // packages back explicitly. Only markdown outside the generated coverage
    // block counts, so a badge refresh can never land here.
    const docsChanged = publishable.filter((p) => hasAuthoredDocsChange(p)).map((p) => p.name)
    if (docsChanged.length) {
      versionArgs.push('--force-publish', docsChanged.join(','))
      console.log(`  docs changed -> force-publishing: ${docsChanged.join(', ')}`)
    }

    const res = sh(lernaBin(), lernaArgs(versionArgs), { stdio: ['inherit', 'pipe', 'pipe'] })
    const versionOutput = `${res.stdout || ''}${res.stderr || ''}`
    process.stdout.write(res.stdout || '')
    process.stderr.write(res.stderr || '')
    if (res.status !== 0) {
      if (/no changed packages/i.test(versionOutput)) {
        console.log('\nNo changed packages to version -- nothing to release.')
        // The badge refresh commit exists but has no release to ride along with;
        // gh-pages was already updated, so push it to keep the READMEs in step.
        if (badgesRefreshed) pushCommitsAndTags()
        return
      }
      throw new Error('lerna version failed')
    }

    const bumped = listPackages().filter((p) => !p.private)
    const changed = bumped.filter((p) => npmVersion(`${p.name}@${p.version}`) !== p.version)
    attempted = topological(changed)
    if (!attempted.length) {
      console.log('Nothing to publish after the bump.')
      // lerna version already committed and tagged locally; push so the repo
      // does not silently drift from the version numbers it just wrote.
      pushCommitsAndTags()
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
    // The registry write already happened, so the version commits and tags must
    // go out now; leaving them local is how the repo drifts behind npm.
    pushCommitsAndTags()
    return
  }

  pushCommitsAndTags()

  console.log('\nRelease complete.')
}

main().catch((err) => {
  console.error(`\n${err.message}`)
  process.exit(1)
})
