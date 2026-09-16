const assert = require('assert')
const arrify = require('../src/container-methods/lib/arrify.js')

describe('arrify', function () {
  it('returns an empty array for null and undefined', function () {
    assert.deepEqual(arrify(null), [])
    assert.deepEqual(arrify(undefined), [])
  })

  it('returns arrays unchanged', function () {
    const value = [1, 2, 3]
    assert.strictEqual(arrify(value), value)
  })

  it('wraps a string in an array', function () {
    assert.deepEqual(arrify('dep'), ['dep'])
  })

  it('spreads iterables', function () {
    assert.deepEqual(arrify(new Set(['a', 'b'])), ['a', 'b'])
  })

  it('wraps any other value', function () {
    assert.deepEqual(arrify(42), [42])
  })
})
