#!/usr/bin/env node
//
// Publish the generated badges to the `gh-pages` branch, where GitHub Pages
// serves them so they can be hotlinked from the READMEs, npm and anywhere else.
//
// One badge per package plus the whole-project one, all written by
// `bin/update-coverage.js` into coverage/*.svg.
//
// The branch is rebuilt from scratch on every publish (orphan commit,
// force-pushed), so it stays exactly one commit deep no matter how often the
// numbers move. Nothing here touches the working tree.
//
// Auth: uses $GITHUB_TOKEN when set (via a throwaway askpass helper, so the
// token never reaches argv or a file); otherwise falls back to whatever
// credential helper git already has.
//
'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const cp = require('child_process')

const projectRoot = path.join(__dirname, '../')
const coverageDir = path.join(projectRoot, 'coverage')
const pagesBranch = 'gh-pages'
const DRY_RUN = process.argv.includes('--dry-run')

const WHOLE_PROJECT = 'coverage.svg'

function git (args, opts = {}) {
  return cp.execFileSync('git', args, {
    cwd: opts.cwd,
    env: opts.env || process.env,
    encoding: 'utf8',
    stdio: opts.stdio || ['ignore', 'pipe', 'pipe']
  })
}

/** owner/repo from the origin remote, however it is spelled. */
function repoSlug () {
  const url = git(['remote', 'get-url', 'origin'], { cwd: projectRoot }).trim()
  const match = url.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/)
  if (!match) throw new Error(`cannot parse owner/repo from remote: ${url}`)
  return { owner: match[1], repo: match[2], url }
}

function identity () {
  const get = (key, fallback) => {
    try { return git(['config', '--get', key], { cwd: projectRoot }).trim() || fallback } catch (e) { return fallback }
  }
  return {
    name: get('user.name', 'dsl-toolkit badge'),
    email: get('user.email', 'badge@localhost')
  }
}

/** Every coverage/*.svg, whole-project first, then packages alphabetically. */
function badgeFiles () {
  const all = fs.readdirSync(coverageDir).filter((name) => name.endsWith('.svg')).sort()
  return [
    ...all.filter((name) => name === WHOLE_PROJECT),
    ...all.filter((name) => name !== WHOLE_PROJECT)
  ]
}

function labelFor (file) {
  return file === WHOLE_PROJECT ? 'whole project' : path.basename(file, '.svg')
}

function indexHtml (owner, repo, files) {
  const rows = files.map((file) =>
    `  <tr><td>${labelFor(file)}</td>` +
    `<td><img src="${file}" alt="${labelFor(file)} coverage"></td>` +
    `<td><code>${file}</code></td></tr>`
  ).join('\n')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${owner}/${repo} — coverage</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; margin: 3rem; color: #1a1917; }
  table { border-collapse: collapse; }
  td { padding: .3rem 1.2rem .3rem 0; }
  img { height: 20px; vertical-align: middle; }
  code { color: #555; }
</style>
</head>
<body>
<h1>${owner}/${repo} — coverage</h1>
<table>
${rows}
</table>
<p><a href="https://github.com/${owner}/${repo}">Repository</a></p>
</body>
</html>
`
}

const files = fs.existsSync(coverageDir) ? badgeFiles() : []

if (!files.length) {
  console.error(`No badges in ${coverageDir}`)
  console.error('Run "npm run coverage" first, then re-run this.')
  process.exit(1)
}

const { owner, repo, url: pushUrl } = repoSlug()
const who = identity()

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsl-badge-'))
let askpass = null

try {
  files.forEach((file) => {
    fs.copyFileSync(path.join(coverageDir, file), path.join(tmp, file))
  })
  fs.writeFileSync(path.join(tmp, '.nojekyll'), '', { encoding: 'utf8' })
  fs.writeFileSync(path.join(tmp, 'index.html'), indexHtml(owner, repo, files), { encoding: 'utf8' })

  git(['init', '--quiet'], { cwd: tmp })
  git(['add', '--all'], { cwd: tmp })
  git(['-c', `user.name=${who.name}`, '-c', `user.email=${who.email}`,
    'commit', '--quiet', '-m', 'coverage badges'], { cwd: tmp })

  if (DRY_RUN) {
    console.log(`--- dry run: ${owner}/${repo}:${pagesBranch} would contain ---`)
    fs.readdirSync(tmp).sort().forEach((name) => {
      const size = fs.statSync(path.join(tmp, name)).size
      console.log(`  ${name.padEnd(34)} ${String(size).padStart(7)} bytes`)
    })
  } else {
    const env = { ...process.env, GIT_TERMINAL_PROMPT: '0' }
    // An https remote needs credentials; an ssh remote uses the agent as-is.
    if (process.env.GITHUB_TOKEN && /^https?:/i.test(pushUrl)) {
      askpass = path.join(tmp, 'askpass.sh')
      fs.writeFileSync(askpass,
        '#!/bin/sh\n' +
        'case "$1" in\n' +
        '  *Username*) echo x-access-token ;;\n' +
        "  *) printf '%s' \"$GITHUB_TOKEN\" ;;\n" +
        'esac\n', { encoding: 'utf8', mode: 0o700 })
      env.GIT_ASKPASS = askpass
    }

    git(['push', '--quiet', '--force', pushUrl, `HEAD:refs/heads/${pagesBranch}`],
      { cwd: tmp, env, stdio: ['ignore', 'inherit', 'inherit'] })
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true })
}

if (DRY_RUN) {
  console.log(`\n${files.length} badge(s) staged via ${pushUrl}, nothing pushed.`)
} else {
  console.log(`published ${files.length} badge(s) -> ${owner}/${repo}:${pagesBranch}`)
  files.forEach((file) => {
    console.log(`  ${labelFor(file).padEnd(28)} https://${owner}.github.io/${repo}/${file}`)
  })
  console.log(`  ${'site'.padEnd(28)} https://${owner}.github.io/${repo}/`)
}
