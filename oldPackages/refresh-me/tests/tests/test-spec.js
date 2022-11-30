/* eslint-env mocha */
const assert = require('assert')
const makeRealSemver = require('../../src/lib/make-real-semver')
const semver = require('semver')
const { boilerplate } = require("./boilerplate")

describe('Basic Test Suite', function () {
  this.timeout(500000);
  describe('happy flow', () => {

    it('.happy flow only devDependencies specified in tha package.json', function () { const { originalPackageJson, testPackageJson } = boilerplate('only-dev-dependencies')
      assert(semver.lt(
        makeRealSemver(originalPackageJson.devDependencies.cowlog),
        makeRealSemver(testPackageJson.devDependencies.cowlog)))})

    it('.happy flow no devDependencies specified in tha package.json', function () { const { originalPackageJson, testPackageJson } = boilerplate('only-dependencies')
      assert(semver.lt(
        makeRealSemver(originalPackageJson.dependencies.cowlog),
        makeRealSemver(testPackageJson.dependencies.cowlog)))})

    it('no updates', function () { const { originalPackageJson, testPackageJson } = boilerplate('no-updates')
      assert(originalPackageJson.devDependencies.cowlog === testPackageJson.devDependencies.cowlog)
      assert(originalPackageJson.dependencies['directory-fixture-provider'] === testPackageJson.dependencies['directory-fixture-provider'])})
    })})


