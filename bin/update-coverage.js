#!/usr/bin/env node
'use strict'

/*
 * Writes the coverage badges from coverage/coverage-summary.json:
 *
 *   whole project -> coverage/coverage.svg   -> README.md
 *   each package  -> coverage/<pkg>.svg      -> packages/<pkg>/README.md
 *
 * Per-package numbers are aggregated from the per-file entries of the single
 * whole-project nyc run -- the json-summary reporter emits one entry per file,
 * so no extra test runs are required. Raw counts are summed before the ratio is
 * taken; percentages are never averaged.
 *
 * The badge is published to the gh-pages branch and hotlinked from the Pages
 * URL, so one asset per package serves README, npm and any other site.
 * `npm run coverage:publish` pushes them.
 */

const fs = require('fs')
const path = require('path')
const { linkerFile } = require('generic-text-linker')

const projectRoot = path.join(__dirname, '../')
const coverageDir = path.join(projectRoot, 'coverage')
const packagesDir = path.join(projectRoot, 'packages')
const summaryPath = path.join(coverageDir, 'coverage-summary.json')

const pagesUrl = 'https://dsl-toolkit.github.io/dsl-toolkit'
const wholeProjectBadge = `${pagesUrl}/coverage.svg`

const beginning = '<!--- coverage begin -->'
const closing = '<!--- coverage end -->'

const METRICS = ['statements', 'branches', 'functions', 'lines']

if (!fs.existsSync(summaryPath)) {
  console.error(`No coverage summary at ${summaryPath}`)
  console.error('Run "npm test" first, then re-run this.')
  process.exit(1)
}

const summary = JSON.parse(fs.readFileSync(summaryPath, { encoding: 'utf8' }))

/** Aggregate raw counts into one summary. Never average percentages. */
function aggregate (entries) {
  const out = {}
  METRICS.forEach(function (metric) {
    out[metric] = { total: 0, covered: 0 }
  })
  entries.forEach(function (entry) {
    if (!entry) return
    METRICS.forEach(function (metric) {
      if (!entry[metric]) return
      out[metric].total += entry[metric].total || 0
      out[metric].covered += entry[metric].covered || 0
    })
  })
  METRICS.forEach(function (metric) {
    out[metric].pct = out[metric].total === 0
      ? 100
      : Math.round((out[metric].covered / out[metric].total) * 1000) / 10
  })
  return out
}

/** Shield colour bands -- green >= 80, amber >= 50, red below. */
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
function badge (label, val, fill, desc) {
  const charWidth = 6.5
  const labelWidth = Math.round(label.length * charWidth) + 10
  const valueWidth = Math.round(val.length * charWidth) + 10
  const width = labelWidth + valueWidth
  const labelX = labelWidth / 2
  const valueX = labelWidth + valueWidth / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${label}: ${val}">
  <title>${desc}</title>
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

function description (subject, agg) {
  return `${subject} coverage - statements ${agg.statements.pct}%, ` +
    `branches ${agg.branches.pct}%, functions ${agg.functions.pct}%, ` +
    `lines ${agg.lines.pct}%.`
}

/**
 * Write one badge file and return the percentage value it shows.
 * `label` is what the shield reads, `subject` names it in the <title>/<desc>.
 */
function writeBadge (file, label, subject, agg) {
  const value = `${agg.lines.pct.toFixed(1)}%`
  fs.writeFileSync(path.join(coverageDir, file),
    badge(label, value, color(agg.lines.pct), description(subject, agg)),
    { encoding: 'utf8' })
  return value
}

function applyBadge (readme, value, url, what) {
  if (!fs.existsSync(readme)) {
    console.log(`${'missing'.padEnd(22)} ${path.relative(projectRoot, readme)}`)
    return
  }
  const markdown = `![coverage: ${value} lines](${url})`
  const result = linkerFile(readme, beginning, closing, markdown)
  // status is only 'write' when both markers were actually found; content that
  // already matches still counts as a write with no whitespace change.
  const state = result.meta.changed.status !== 'write'
    ? 'no markers, skipped'
    : (result.meta.changed.withoutWhiteSpaces ? 'updated' : 'unchanged')
  console.log(`${state.padEnd(22)} ${path.relative(projectRoot, readme)} ${what}`)
}

// ---------------------------------------------------------------- whole project
const total = aggregate([summary.total])
const totalValue = writeBadge('coverage.svg', 'coverage', 'whole project', total)
console.log(`coverage.svg           lines ${total.lines.pct}% ` +
  `(stmts ${total.statements.pct}%, branch ${total.branches.pct}%, funcs ${total.functions.pct}%)`)

// ------------------------------------------------------------------- per package
const packageNames = fs.readdirSync(packagesDir).filter(function (name) {
  return fs.existsSync(path.join(packagesDir, name, 'package.json'))
})

const entriesByPackage = new Map(packageNames.map(function (name) { return [name, []] }))

Object.keys(summary).forEach(function (key) {
  if (key === 'total') return
  const match = key.replace(/\\/g, '/').match(/\/packages\/([^/]+)\//)
  if (match && entriesByPackage.has(match[1])) {
    entriesByPackage.get(match[1]).push(summary[key])
  }
})

const perPackage = new Map()
packageNames.forEach(function (name) {
  const entries = entriesByPackage.get(name)
  const agg = aggregate(entries)
  const value = writeBadge(`${name}.svg`, name, name, agg)
  perPackage.set(name, { agg, value, files: entries.length })
  console.log(`${(name + '.svg').padEnd(34)} lines ${value.padEnd(7)} ` +
    `from ${entries.length} file(s)`)
})

// ----------------------------------------------------------------------- readmes
console.log('')
applyBadge(path.join(projectRoot, 'README.md'), totalValue, wholeProjectBadge, '(whole project)')

packageNames.forEach(function (name) {
  const { value, files } = perPackage.get(name)
  if (files === 0) {
    console.log(`${'no coverage data'.padEnd(22)} packages/${name} -- skipped`)
    return
  }
  applyBadge(
    path.join(packagesDir, name, 'README.md'),
    value,
    `${pagesUrl}/${name}.svg`,
    `(${name})`
  )
})
