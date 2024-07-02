/* eslint-env mocha */
// require('cowlog')()
const expect = require('chai').expect
const dslFrameworkFactory = require('../../library/dsl-framework-factory.js')

const { dslFrameworkDefaultInstance, dslFramework } = dslFrameworkFactory
const enviromentSupportsPromises = require('semver').satisfies(process.version, '>6.x')

// const abcTester = function(abcData){
//   expect(abcData.data.returnArray().join('')).to.be.equal('abc')
// }

describe('Basic Test Suite', function () {
  const { curryObject, curryCallbackObject } = require('../../library/curry-factory.js')

  it('basic test without callback', function () {
    expect(dslFrameworkDefaultInstance).to.be.an('function')
    expect(curryObject).to.be.an('object').that.have.all.keys('data', 'getFrom', 'command', 'arguments', 'commandSequence')
  })

  it('tests a', function () {
    expect(curryCallbackObject).to.be.a('function')
  })

  require('./basic-suite/01-return-tests-no-callback.js')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance)
  require('./basic-suite/02-callback-tests.js')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance)
  require('./basic-suite/03-return-data-consistency.js')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance)

  describe('More Dsl related functionalities.', function () {
    require('./basic-suite/04-DSL-chaining.js')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance)
    require('./basic-suite/05-.js')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance)
    require('./basic-suite/06-command-sequence.js')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance)
    // require('./basic-suite/07-command-parser.js')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance)
    require('./basic-suite/08-arguments-parser.js')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance)
  })

  require('./basic-suite/09-dsl-framework-parameters.js')(curryCallbackObject, expect)
  require('./basic-suite/10-DSL-of-the-framework-initialization.js')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance)
  require('./basic-suite/11-repeate-me.js')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance)
  require('./basic-suite/12-factory.js')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance, dslFramework)
  // require('./basic-suite/12-factory-delta')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance, dslFramework)
})
