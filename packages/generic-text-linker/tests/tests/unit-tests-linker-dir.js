/* eslint-env mocha */
// require('../../../../lib/test-common')
const path = require('path')
const cwd = require('pkg-dir').sync(__dirname)
const fixturesRoot = path.join(cwd, 'tests/directory-fixtures')

require('chai').should()

const fixtureDirectoryProvider = require('directory-fixture-provider')(fixturesRoot)()

describe('Testing', function () {
  const { linkerDir } = require('../../src/index')

  describe('@linker-dir', function () {
    it('test @linker-dir-template', function () {
      const fixtureData = fixtureDirectoryProvider.get('linker/directory')

      const fileNames = linkerDir(fixtureData.dir,
        '<!--- source qa rewrite begin -->',
        '<!--- source qa rewrite end -->', '+++***---')
      if (!Object.keys(fileNames)[0]) {
        throw String('As a result you have at least one file changed by now')
      }
    })

    // it('test @linker-dir-return', function () {
    //   const linker = require('../../src/linker-dir')
    //   const fixtureData = fixtureDirectoryProvider.get('linker/directory')
    //
    //   const results = linkerDir(fixtureData.dir,
    //     '<!--- source qa rewrite begin -->',
    //     '<!--- source qa rewrite emd -->')
    //   // expect(fixtureData.status().changed).to.equal(false)
    //   // todo: test it!
    // })
  })
})
