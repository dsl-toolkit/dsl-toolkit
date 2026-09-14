#!/usr/bin/env node
'use strict'

/*
 * Per-piece upkeep: normalise every npm manifest in the repo -- the root plus
 * every workspace package -- with `npm pkg fix`, then prove nothing broke by
 * running each package's test suite.
 *
 * `npm pkg fix` is exactly what npm asks for on every publish:
 *   "npm auto-corrected some errors in your package.json when publishing.
 *    Please run "npm pkg fix" to address these errors."
 * It normalises repository.url to git+https:// and strips node_modules/.bin/
 * prefixes from scripts. It never touches package-lock.json.
 *
 * If every piece passes its tests this prints one clean summary; any failing
 * piece is named explicitly and the command exits non-zero.
 *
 * Usage:
 *   npm run update:packages                 fix manifests, then test every piece
 *   npm run update:packages -- --dry-run    show what would change, write nothing
 *   npm run update:packages -- --no-test    manifests only
 */

const cp = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const DRY_RUN = process.argv.includes('--dry-run')
const NO_TEST = process.argv.includes('--no-test')

function sh (cmd, args, opts = {}) {
  return cp.spawnSync(cmd, args, { encoding: 'utf8', cwd: ROOT, ...opts })
}

/** The root manifest plus one entry per workspace package. */
function pieces () {
  const list = [{ name: '(root)', label: 'root', dir: ROOT }]
  const packagesDir = path.join(ROOT, 'packages')
  fs.readdirSync(packagesDir).forEach((entry) => {
    const dir = path.join(packagesDir, entry)
    const manifest = path.join(dir, 'package.json')
    if (!fs.existsSync(manifest)) return
    list.push({
      name: JSON.parse(fs.readFileSync(manifest, 'utf8')).name || entry,
      label: entry,
      dir
    })
  })
  return list
}

function hasScript (dir, script) {
  try {
    const json = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
    return Boolean(json.scripts && json.scripts[script])
  } catch (e) {
    return false
  }
}

/** Dotted paths of every value that differs between two parsed manifests. */
function changedPaths (a, b, prefix = '') {
  const out = []
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})])
  for (const key of keys) {
    const va = (a || {})[key]
    const vb = (b || {})[key]
    const at = prefix ? `${prefix}.${key}` : key
    const bothPlainObjects = va && vb &&
      typeof va === 'object' && typeof vb === 'object' &&
      !Array.isArray(va) && !Array.isArray(vb)
    if (bothPlainObjects) {
      out.push(...changedPaths(va, vb, at))
    } else if (JSON.stringify(va) !== JSON.stringify(vb)) {
      out.push(at)
    }
  }
  return out
}

/**
 * `npm pkg fix` has no --dry-run, so for the preview we fix a throwaway copy
 * and diff that instead of touching the real manifest.
 */
function fixManifest (piece) {
  const manifest = path.join(piece.dir, 'package.json')
  const before = JSON.parse(fs.readFileSync(manifest, 'utf8'))

  if (DRY_RUN) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pkg-fix-'))
    try {
      fs.copyFileSync(manifest, path.join(tmp, 'package.json'))
      const res = sh(NPM, ['pkg', 'fix'], { cwd: tmp })
      if (res.status !== 0) return { error: (res.stderr || res.stdout || '').trim() }
      const after = JSON.parse(fs.readFileSync(path.join(tmp, 'package.json'), 'utf8'))
      return { changed: changedPaths(before, after) }
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  }

  const res = sh(NPM, ['pkg', 'fix'], { cwd: piece.dir })
  if (res.status !== 0) return { error: (res.stderr || res.stdout || '').trim() }
  const after = JSON.parse(fs.readFileSync(manifest, 'utf8'))
  return { changed: changedPaths(before, after) }
}

function testPiece (piece) {
  const started = Date.now()
  const res = sh(NPM, ['run', 'test-common'], { cwd: piece.dir })
  const seconds = ((Date.now() - started) / 1000).toFixed(1)
  const output = `${res.stdout || ''}${res.stderr || ''}`
  return { ok: res.status === 0, status: res.status, seconds, output }
}

function main () {
  const all = pieces()
  console.log(`--- npm manifests (${DRY_RUN ? 'dry run' : 'fixing'}) ---`)

  const manifestResults = all.map((piece) => {
    const result = fixManifest(piece)
    let text
    if (result.error) {
      text = `ERROR: ${result.error.split('\n')[0]}`
    } else if (!result.changed.length) {
      text = 'already clean'
    } else {
      text = `fixed ${result.changed.join(', ')}`
    }
    console.log(`  ${piece.name.padEnd(30)} ${text}`)
    return { piece, ...result }
  })

  const broken = manifestResults.filter((r) => r.error)

  if (DRY_RUN) {
    const touched = manifestResults.filter((r) => r.changed && r.changed.length).length
    console.log(`\n[dry run] ${touched} of ${all.length} manifest(s) would change; nothing written.`)
    process.exit(broken.length ? 1 : 0)
  }

  const summary = []
  if (!NO_TEST) {
    console.log('\n--- tests ---')
    const withTests = all.filter((piece) => hasScript(piece.dir, 'test-common'))
    const withoutTests = all.filter((piece) => !hasScript(piece.dir, 'test-common'))

    for (const piece of withTests) {
      const result = testPiece(piece)
      console.log(`  ${result.ok ? 'PASS' : 'FAIL'}  ${piece.name.padEnd(30)} ${result.seconds}s`)
      if (!result.ok) {
        const tail = result.output.trim().split('\n').slice(-12).join('\n')
        console.log(tail.replace(/^/gm, '        '))
      }
      summary.push({ piece, ...result })
    }
    for (const piece of withoutTests) {
      console.log(`  SKIP  ${piece.name.padEnd(30)} no test-common script`)
    }
  }

  const failed = summary.filter((r) => !r.ok)
  const fixed = manifestResults.filter((r) => r.changed && r.changed.length)

  console.log('\n--- summary ---')
  console.log(`  manifests checked : ${all.length}`)
  console.log(`  manifests fixed   : ${fixed.length}`)
  if (NO_TEST) {
    console.log('  tests             : skipped (--no-test)')
  } else {
    console.log(`  tests passed      : ${summary.filter((r) => r.ok).length}/${summary.length}`)
  }

  if (broken.length) {
    console.error(`  manifest errors   : ${broken.map((r) => r.piece.name).join(', ')}`)
    process.exit(1)
  }
  if (failed.length) {
    console.error(`\nFAILED: ${failed.map((r) => r.piece.name).join(', ')}`)
    process.exit(1)
  }
  console.log(NO_TEST ? '\nManifests are normalised.' : '\nAll pieces are fine.')
}

main()
