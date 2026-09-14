#!/usr/bin/env node
//
// Publish the generated badge to the `gh-pages` branch, where GitHub Pages
// serves it so it can be hotlinked from the README, npm and anywhere else.
//
// The branch is rebuilt from scratch on every publish (orphan commit,
// force-pushed), so it stays exactly one commit deep no matter how often the
// number moves. Nothing here touches the working tree.
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
const badgeSource = path.join(projectRoot, 'coverage', 'coverage.svg')
const pagesBranch = 'gh-pages'

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

function indexHtml (owner, repo) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${owner}/${repo} — coverage</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; margin: 3rem; color: #1a1917; }
  img { height: 20px; }
</style>
</head>
<body>
<h1>${owner}/${repo} — coverage</h1>
<p><img src="coverage.svg" alt="coverage"></p>
<p><a href="https://github.com/${owner}/${repo}">Repository</a></p>
</body>
</html>
`
}

if (!fs.existsSync(badgeSource)) {
  console.error(`No badge at ${badgeSource}`)
  console.error('Run "npm run coverage" first, then re-run this.')
  process.exit(1)
}

const { owner, repo } = repoSlug()
const pushUrl = `https://github.com/${owner}/${repo}.git`
const who = identity()

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dsl-badge-'))
let askpass = null

try {
  fs.copyFileSync(badgeSource, path.join(tmp, 'coverage.svg'))
  fs.writeFileSync(path.join(tmp, '.nojekyll'), '', { encoding: 'utf8' })
  fs.writeFileSync(path.join(tmp, 'index.html'), indexHtml(owner, repo), { encoding: 'utf8' })

  git(['init', '--quiet'], { cwd: tmp })
  git(['add', '--all'], { cwd: tmp })
  git(['-c', `user.name=${who.name}`, '-c', `user.email=${who.email}`,
    'commit', '--quiet', '-m', 'coverage badge'], { cwd: tmp })

  const env = { ...process.env, GIT_TERMINAL_PROMPT: '0' }
  if (process.env.GITHUB_TOKEN) {
    askpass = path.join(tmp, 'askpass.sh')
    fs.writeFileSync(askpass,
      '#!/bin/sh\n' +
      'case "$1" in\n' +
      '  *Username*) echo x-access-token ;;\n' +
      '  *) printf \'%s\' "$GITHUB_TOKEN" ;;\n' +
      'esac\n', { encoding: 'utf8', mode: 0o700 })
    env.GIT_ASKPASS = askpass
  }

  git(['push', '--quiet', '--force', pushUrl, `HEAD:refs/heads/${pagesBranch}`],
    { cwd: tmp, env, stdio: ['ignore', 'inherit', 'inherit'] })
} finally {
  fs.rmSync(tmp, { recursive: true, force: true })
}

console.log(`published coverage.svg -> ${owner}/${repo}:${pagesBranch}`)
console.log(`badge: https://${owner}.github.io/${repo}/coverage.svg`)
console.log(`site : https://${owner}.github.io/${repo}/`)
