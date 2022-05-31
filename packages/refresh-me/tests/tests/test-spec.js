/* eslint-env mocha */
const shell = require('shelljs')
const dfp = require('directory-fixture-provider')
const path = require('path')
const assert = require('assert')
const makeRealSemver = require('../../src/lib/make-real-semver')
const getCurrentBranch = require('../../src/lib/get-current-branch')
const semver = require('semver')
const fixtureDirectoryProvider = dfp(path.join(__dirname, '../assets'))()

describe('Basic Test Suite', function () {
  this.timeout(500000);
  describe('happy flow', () => {
    it('.happy flow only devDependencies specified in tha package.json', function () {
      const { originalPackageJson, testPackageJson } = boilerplate('only-dev-dependencies')
      assert(semver.lt(
        makeRealSemver(originalPackageJson.devDependencies.cowlog),
        makeRealSemver(testPackageJson.devDependencies.cowlog)))})
    it('.happy flow no devDependencies specified in tha package.json', function () {
      const { originalPackageJson, testPackageJson } = boilerplate('only-dependencies')
      assert(semver.lt(
        makeRealSemver(originalPackageJson.dependencies.cowlog),
        makeRealSemver(testPackageJson.dependencies.cowlog)))})
    it('no updates', function () {
      const { originalPackageJson, testPackageJson } = boilerplate('no-updates')
      assert(originalPackageJson.devDependencies.cowlog === testPackageJson.devDependencies.cowlog)
      assert(originalPackageJson.dependencies['directory-fixture-provider'] === testPackageJson.dependencies['directory-fixture-provider'])})})})

function boilerplate(pathPart) {
  const assetRelativePath = `javascript/${pathPart}/`
  const fixtureDataPath = fixtureDirectoryProvider.get(assetRelativePath).dir;
  shell.cd(fixtureDataPath);
  shell.exec(`git init && git add . && git commit -m"just for the test && npm install"`);
  console.log({fixtureDataPath});
  assert(!shell.exec(`${path.join(__dirname, '../../', 'src/index.js')} `).code);
  const currentBranch = getCurrentBranch()
  assert(currentBranch === 'master', `getCurrentBranch() = '${currentBranch}'`, `${currentBranch}`);
  const originalPackageJson = require(path.join(__dirname, '../', `assets/${assetRelativePath}/package.json`));
  const testPackageJson = require(path.join(fixtureDataPath, '/package.json'));
  return { originalPackageJson, testPackageJson }}

