#!/usr/bin/env node
'use strict'

const cp = require('child_process')
const readline = require('readline')

function run(cmd, args, options = {}) {
  const res = cp.spawnSync(cmd, args, {
    stdio: options.stdio || 'inherit',
    encoding: 'utf8',
    env: { ...process.env, ...options.env }
  })
  if (res.error) throw res.error
  if (res.status !== 0 && !options.allowFailure) {
    process.exit(res.status || 1)
  }
  return res
}

function promptOtp() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question('Enter npm 2FA OTP code: ', (ans) => {
      rl.close()
      resolve(ans.trim())
    })
  })
}

function getLocalPackages() {
  const res = run('npx', ['lerna', 'list', '--json', '--all'], { stdio: ['ignore', 'pipe', 'inherit'] })
  return JSON.parse(res.stdout || '[]')
}

function getNpmVersion(pkgName) {
  const res = cp.spawnSync('npm', ['view', pkgName, 'version'], { encoding: 'utf8' })
  if (res.status !== 0 || !res.stdout) {
    return null
  }
  return res.stdout.trim()
}

async function main() {
  console.log('--- Inspecting workspace packages vs npm registry ---')
  const packages = getLocalPackages()
  const stranded = []

  for (const pkg of packages) {
    if (pkg.private) continue
    const npmVer = getNpmVersion(pkg.name)
    console.log(`- ${pkg.name}: local=${pkg.version} | npm=${npmVer || '(none)'}`)
    if (npmVer !== pkg.version) {
      stranded.push({ name: pkg.name, local: pkg.version, npm: npmVer })
    }
  }

  const otp = await promptOtp()
  if (!otp) {
    console.error('OTP code is required to publish.')
    process.exit(1)
  }

  if (stranded.length > 0) {
    console.log(`\nFound ${stranded.length} package(s) with local version ahead of npm (unreleased/stranded tags):`)
    stranded.forEach(p => console.log(`  * ${p.name}@${p.local}`))
    console.log('\nRunning: lerna publish from-package --no-verify-access ...\n')

    run('npx', [
      'lerna',
      'publish',
      'from-package',
      '--no-verify-access',
      '--yes',
      `--otp=${otp}`
    ])
  } else {
    console.log('\nAll local packages match npm. Running regular independent release bump...\n')

    run('npx', [
      'lerna',
      'publish',
      '--no-verify-access',
      '--yes',
      `--otp=${otp}`
    ])
  }

  console.log('\nPublish completed successfully.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
