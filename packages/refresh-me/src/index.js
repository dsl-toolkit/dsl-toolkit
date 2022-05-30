#!/usr/bin/env node
const diff = require('diff')
const objectPath = require('object-path')
const path = require('path')
const shell = require('shelljs')
const semver = require('semver')
const cwd = process.cwd()
const makeRealSemver = require('./lib/make-real-semver')
const debug = require('debug')
const { getCommandSequence } = require("./lib/getCommandSequence")
const log = debug('refresh-me')

const extracted = (allFine, testBranch, updateLog, name, version) => ({
  allFine, testBranch, updateLog, packageInfo: { name, version }})
const relativePath = objectPath.get(diff.diffChars(shell.exec('git rev-parse --show-toplevel')
  .trim(), cwd), '1.value', false)

const update = async (dependencies) => {
  if (dependencies) {
    const currentBranch = require('./lib/get-current-branch')()
    const dependencyNames = Object.keys(dependencies)
    let allFine = true
    const updateLog = []
    let testBranch = ''
    for (let i = 0; dependencyNames.length > i; i++) {
      const dependencyName = dependencyNames[i]
      const versionString = dependencies[dependencyName]
      console.log({versionString}, versionString.startsWith('^'));
      const fixedVersion = !versionString.startsWith('^')
      if(fixedVersion) {testBranch=''}
      if(!fixedVersion){
        const actualVersion = makeRealSemver(versionString)
        const versions = JSON.parse(shell.exec(`npm view ${dependencyName} versions --json`))
          .filter(programVersion=>semver.gte(programVersion,actualVersion))
        const latestVersion = versions[versions.length-1]
        testBranch = `RM#-based-${currentBranch}-${dependencyName}@${actualVersion}-to-${latestVersion}`
        const update = semver.gt(latestVersion, actualVersion)
        const { name, version } = require(path.join(cwd, 'package.json'))
        const commandSequence = getCommandSequence()
          (relativePath, name, dependencyName, actualVersion, latestVersion, testBranch)
        if (update) {
          commandSequence.map((command) => {
            allFine && log(`-= ${command} =-`)
            allFine || log(updateLog.join('\n'))
            return allFine
              ? (() => {
                updateLog.push(command)
                return !shell.exec(command).code})()
                ? allFine
                : (() => {
                  allFine = false
                  log(`chain broke at: ${command}`)
                  return extracted(allFine, testBranch, updateLog, name, version)})()
              : (() => extracted(allFine, testBranch, updateLog, name, version))()})}
        if (!allFine) {break}}}
    return extracted(allFine, testBranch, updateLog, '', '')}
  return extracted(true, '', [], '', '')}

const printMessage = (result) => { log(result.updateLog.join('\n'))
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
    log('-= Great success! =-')}
  if (!(results.allFine && results.allFine)){
    log('-= You have something to fix! =-')}})()
