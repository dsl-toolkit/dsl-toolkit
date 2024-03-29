// [require-a-lot] testRequires begin
  const {
    anotherTestData, // *di parameter* |
    assert, // *node module*: assert | https://nodejs.org/api/assert.html |
    assetDir, // *di service* | Test assets root directory |
    consoleCapture, // undefined
    cowlog, // cowlog@1.6.62 | https://github.com/dsl-toolkit/cowlog | Development time logging for NodeJs |
    diAssetDir, // *di service* | map-dir related test assets folder. |
    directoryFixtureProvider, // directory-fixture-provider@1.6.63 | https://github.com/dsl-toolkit/directory-fixture-p...
    executeIfNycIsOff, // *di service* | Executes function if nyc is not running, technically if the test-dev script is...
    fixturesPath, // *di parameter* |
    genericTextLinker, // generic-text-linker@1.6.62 | https://github.com/dsl-toolkit/generic-text-linker | Generic tex...
    isNyc, // *di parameter* | true if nyc is turned on |
    l, // *di service* | an instance of the cowlog |
    logger, // *di service* | an instance of the cowlog |
    mapDirAssetDir, // *di service* |
    path, // *node module*: path | https://nodejs.org/api/path.html |
    requireALot, // *alias* of ../../src | The main library itself. |
    requireDir, // require-dir@1.2.0 | https://github.com/aseemk/requireDir | Helper to require() directories. |
  }
// [require-a-lot] testRequires end
  = require('../../../../lib/requires')

describe('.log for ease of use', () => {
  xit('tests .log', () => {
    const consoleOut = consoleCapture(() => requireALot(require)('../../../test-spec')
      .alias('test-spec', 'cc').log())
    assert(consoleOut.split('\n').length === 1, `${consoleOut.split('\n').length} --`)
  })

  xit('tests .log (vertical)', () => {
    const consoleOut = consoleCapture(() => requireALot(require)('../../../test-spec', '../../../../../src')
      .alias('src', 'ral')
      .alias('test-spec', 'cc').log('vertical')())
    assert(consoleOut.split('\n').length === 4)
  })

  xit('tests .log with .info', () => {
    const template = requireALot(require)('cowlog', 'chai')
      .from('chai', ['expect']).log.info.alias('cowlog', 'l')
    let result = null
    const output = consoleCapture(() => {
      result = template()
    })
    assert(output.includes('chai'))
    assert(output.includes('expect'))
    // assert(output.includes('homepage'))
    assert(result.expect)
  })

  xit('tests .log .info .tag', () => {
    const template = requireALot(require)('cowlog', 'chai').from('chai', ['expect'])
      .log.info.tag('genericTestSuite').alias('cowlog', 'l')
    let result = null
    const output = consoleCapture(() => {
      result = template()
    })
    assert(output.includes('chai'))
    assert(output.includes('expect'))
    // assert(output.includes('homepage'))
    // assert(result.expect)
  })

  xit('tests .log .info .tag', () => {
    const template = requireALot(require)('cowlog', 'chai').from('chai', ['expect'])
      .log.info.tag('genericTestSuite').alias('cowlog', 'l')
    let result = null
    const output = consoleCapture(() => {
      result = template()
    })
    assert(output.includes('chai'))
    assert(output.includes('expect'))
    // assert(output.includes('homepage'))
    // assert(result.expect)
  })
  const assetDir = path.join(__dirname, '../../../../assets')
  const requireALotInstance = require(path.join(diAssetDir, 'requires'))

  // l(requireDir(assetDir, {recurse: true})).keys()

  describe('.log asset tests', () => {
    it('tests .removeUnused', () => {
      requireALotInstance()
      const {linkerDir} = genericTextLinker
      const variables = ['requireALot', 'path']
      const definedVariables = linkerDir(assetDir,
        '// [require-a-lot] testAsset001 begin',
        '// [require-a-lot] testAsset001 end').split('\n').slice(1, -1)
      assert(variables.map(variable => definedVariables.toString().includes(variable)).reduce((result = true, currentValue) => result && currentValue))
      const numberOfDefinedVariables = 6
      const realLength = definedVariables.length
      assert(definedVariables.length === 6,
        {numberOgDefinedVariables: numberOfDefinedVariables, realLength})

    })
  })

  describe('.container tests', () => {
    executeIfNycIsOff(() => {
      it('tests inline and rquired declatarions', () => {
        requireALotInstance()
        const shouldBetrue = require(path.join(diAssetDir, 'code003'))
        assert(shouldBetrue)
      })
      it('tests no dependency array declaration', () => {
        let shouldBetrue = require(path.join(diAssetDir, 'code004'))
        assert(shouldBetrue)
        shouldBetrue = require(path.join(diAssetDir, 'code005'))
        assert(shouldBetrue)
        shouldBetrue = require(path.join(diAssetDir, 'code006'))
        assert(shouldBetrue)
      })
    })

    it('tests autmatic parameter fetching form the container', () => {
      const shouldBetrue = require(path.join(diAssetDir, 'code007'))
      assert(shouldBetrue)
    })
    it('tests service having a factory as parameter', () => {
      const container = requireALotInstance()
      // it will generate a new numner all the time so the equalation sould not be equal to 0.
      assert(
        ((container.somethingComplex5 - container.somethingComplex5) +
          (container.somethingComplex5 - container.somethingComplex5) +
          (container.somethingComplex5 - container.somethingComplex5)) !== 0
      )
    })
  })
})
