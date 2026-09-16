const assert = require('assert')
const demeterDi = require('../src/index.js')

describe('DslFrameworkFactory', function () {
  it('returns a dsl-framework chain bound to the given callback', function () {
    const chain = demeterDi.DslFrameworkFactory((e, program) => program.data.returnArrayChunks)
    assert.deepEqual(chain.define('a', 1)(), [['define', 'a', 1]])
  })
})
