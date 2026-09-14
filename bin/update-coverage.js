#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { linkerFile } = require('generic-text-linker')

const projectRoot = path.join(__dirname, '../')
const summaryPath = path.join(projectRoot, 'coverage/coverage-summary.json')

const beginning = '<!--- coverage begin -->'
const closing = '<!--- coverage end -->'

if (!fs.existsSync(summaryPath)) {
  console.error(`No coverage summary at ${summaryPath}`)
  console.error('Run "npm test" first, then re-run this.')
  process.exit(1)
}

const { total } = JSON.parse(fs.readFileSync(summaryPath, { encoding: 'utf8' }))
const value = `Whole-project coverage: ${total.statements.pct}% stmts · ` +
  `${total.branches.pct}% branch · ${total.functions.pct}% funcs · ${total.lines.pct}% lines`

const readmes = [
  path.join(projectRoot, 'README.md'),
  ...fs.readdirSync(path.join(projectRoot, 'packages'))
    .map((pkg) => path.join(projectRoot, 'packages', pkg, 'README.md'))
].filter((file) => fs.existsSync(file))

readmes.forEach(function (file) {
  const result = linkerFile(file, beginning, closing, value)
  const state = result.meta.changed.all ? 'updated' : 'no markers, skipped'
  console.log(`${state.padEnd(20)} ${path.relative(projectRoot, file)}`)
})

console.log(value)
