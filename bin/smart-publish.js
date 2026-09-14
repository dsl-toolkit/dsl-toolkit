#!/usr/bin/env node
'use strict'

const cp = require('child_process')
const fs = require('fs')
const path = require('path')

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
  const projectRoot = path.join(__dirname, '..')
  const npmToken = process.env.NPM_TOKEN || process.env.NODE_AUTH_TOKEN
  const env = { ...process.env }

  const localNpmrc = path.join(projectRoot, '.npmrc')
  let createdNpmrc = false

  if (npmToken && !fs.existsSync(localNpmrc)) {
    fs.writeFileSync(localNpmrc, `//registry.npmjs.org/:_authToken=${npmToken}\n`, 'utf8')
    createdNpmrc = true
    console.log('✓ Configured registry token in temporary .npmrc')
  }

  try {
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

    // Single concurrency prevents burning the OTP across multiple parallel requests
    const baseArgs = [
      'publish',
      '--concurrency=1',
      '--no-git-reset',
      '--yes'
    ]

    // If an OTP is passed in CLI or env, pass it along
    const otpArg = process.argv.find(arg => arg.startsWith('--otp='))
    const otp = process.env.NPM_OTP || (otpArg ? otpArg.split('=')[1] : null)
    if (otp) {
      baseArgs.push(`--otp=${otp}`)
    }

    if (stranded.length > 0) {
      console.log(`\nFound ${stranded.length} package(s) with local version ahead of npm:`)
      stranded.forEach(p => console.log(`  * ${p.name}@${p.local}`))
      console.log('\nRunning: lerna publish from-package --concurrency=1 ...\n')

      run('npx', ['lerna', ...baseArgs, 'from-package'], { env })
    } else {
      console.log('\nAll local packages match npm. Running regular release...\n')

      run('npx', ['lerna', ...baseArgs], { env })
    }

    console.log('\nPublish completed successfully.')
  } finally {
    if (createdNpmrc && fs.existsSync(localNpmrc)) {
      fs.unlinkSync(localNpmrc)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
