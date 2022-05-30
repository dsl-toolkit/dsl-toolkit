#!/usr/bin/env node
const diff = require('diff')
const objectPath = require('object-path')
const path = require('path')
const shell = require('shelljs')
const lv = require('latest-version')//in the future => npm view webpack versions --json
const semver = require('semver')
const cwd = process.cwd()
const makeRealSemver = require('./lib/make-real-semver')
const debug = require('debug')
const { getCommandSequence } = require("./lib/getCommandSequence")
const log= debug('refresh-me')

const extracted = (allFine, testBranch, updateLog, name, version) => ({
  allFine,
  testBranch,
  updateLog,
  packageInfo: { name, version }})
const relativePath = objectPath.get(diff.diffChars(shell.exec('git rev-parse --show-toplevel').trim(), cwd), '1.value', false)

const update = async (dependencies) => {
  if (dependencies) {
    const dependencyNames = Object.keys(dependencies)
    let allFine = true
    const updateLog = []
    let testBranch = ''
    for (let i = 0; dependencyNames.length > i; i++) {
      const dependencyName = dependencyNames[i]
      const versionString = dependencies[dependencyName]
      console.log({versionString}, versionString.startsWith('^'));
      if(versionString.startsWith('^')){
        const actualVersion = makeRealSemver(versionString)
        const latestVersion = await lv(dependencyName)
        testBranch = `refreshing-${dependencyName}@${actualVersion}-to-${latestVersion}`
        const update = semver.gt(latestVersion, actualVersion)
        const { name, version } = require(path.join(cwd, 'package.json'))
        const commandSequence = getCommandSequence()
          (relativePath, name, dependencyName, actualVersion, latestVersion, testBranch)
        if (update) {
          commandSequence.map((command) => {
            allFine && console.log(`-= ${command} =-`)
            allFine || console.log(updateLog.join('\n'))
            return allFine
              ? (() => {
                updateLog.push(command)
                return !shell.exec(command).code})()
                ? allFine
                : (() => {
                  allFine = false
                  console.log(`chain broke at: ${command}`)
                  return extracted(allFine, testBranch, updateLog, name, version)})()
              : (() => extracted(allFine, testBranch, updateLog, name, version))()})}
        if (!allFine) {break}}}
    return extracted(allFine, testBranch, updateLog, '', '')}
  return extracted(true, '', [], '', '')}

const printMessage = (result) => {
  console.log(result.updateLog.join('\n'))
  return result}

module.exports = (async () => {
  const packageField = require(path.join(cwd, 'package.json'))
  const results = printMessage(await update(packageField.dependencies))
  let resultsDev = false
  if (results.allFine) {
    resultsDev = printMessage(await update(packageField.devDependencies))}
  printMessage(results)
  resultsDev && printMessage(resultsDev)
  if (resultsDev && resultsDev.allFine){
    console.log('-= Great success! =-')}

  if (!(results.allFine && results.allFine)) {
    console.log('-= You have something to fix! =-')}})()
