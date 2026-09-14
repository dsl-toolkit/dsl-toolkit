#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { linkerFile } = require('generic-text-linker')

const projectRoot = path.join(__dirname, '../')
const summaryPath = path.join(projectRoot, 'coverage/coverage-summary.json')
const badgePath = path.join(projectRoot, 'coverage.svg')

const beginning = '<!--- coverage begin -->'
const closing = '<!--- coverage end -->'

if (!fs.existsSync(summaryPath)) {
  console.error(`No coverage summary at ${summaryPath}`)
  console.error('Run "npm test" first, then re-run this.')
  process.exit(1)
}

const { total } = JSON.parse(fs.readFileSync(summaryPath, { encoding: 'utf8' }))

// One number only: whole-project line coverage, one decimal.
const pct = total.lines.pct.toFixed(1)
const value = `${pct}%`

/** Shield colour bands — green >= 80, amber >= 50, red below. */
function color (numericPct) {
  if (numericPct >= 80) return '#4c1'
  if (numericPct >= 50) return '#dfb317'
  return '#e05d44'
}

/**
 * A flat badge drawn with real <text> nodes, so the numbers stay readable in
 * a plain-text diff (unlike a vector-outline badge). The full breakdown rides
 * along in <title>/<desc>.
 */
function badge (label, val, fill) {
  const charWidth = 6.5
  const labelWidth = Math.round(label.length * charWidth) + 10
  const valueWidth = Math.round(val.length * charWidth) + 10
  const width = labelWidth + valueWidth
  const labelX = labelWidth / 2
  const valueX = labelWidth + valueWidth / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${label}: ${val}">
  <title>coverage: ${val} lines (whole project)</title>
  <desc>Whole-project coverage — statements ${total.statements.pct}%, branches ${total.branches.pct}%, functions ${total.functions.pct}%, lines ${total.lines.pct}%.</desc>
  <linearGradient id="g" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".08"/>
    <stop offset="1" stop-opacity=".08"/>
  </linearGradient>
  <clipPath id="r"><rect width="${width}" height="20" rx="3"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${fill}"/>
    <rect width="${width}" height="20" fill="url(#g)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelX}" y="14">${label}</text>
    <text x="${valueX}" y="14">${val}</text>
  </g>
</svg>
`
}

fs.writeFileSync(badgePath, badge('coverage', value, color(total.lines.pct)), { encoding: 'utf8' })

// The README shows the badge (relative path: served from the repo, never
// cached or proxied, so it can't lag behind what was just committed).
const readmeValue = `![coverage: ${pct}% lines](./coverage.svg)`

const readmes = [
  path.join(projectRoot, 'README.md'),
  ...fs.readdirSync(path.join(projectRoot, 'packages'))
    .map((pkg) => path.join(projectRoot, 'packages', pkg, 'README.md'))
].filter((file) => fs.existsSync(file))

readmes.forEach(function (file) {
  const result = linkerFile(file, beginning, closing, readmeValue)
  const state = result.meta.changed.all ? 'updated' : 'no markers, skipped'
  console.log(`${state.padEnd(20)} ${path.relative(projectRoot, file)}`)
})

console.log(`coverage.svg         lines ${pct}% ` +
  `(stmts ${total.statements.pct}%, branch ${total.branches.pct}%, funcs ${total.functions.pct}%)`)
