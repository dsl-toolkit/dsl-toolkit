// [require-a-lot] testIncludes begin
const {
  arrayDsl, // *alias* of src |
  assert // *node module*: assert | https://nodejs.org/api/assert.html |
}
// [require-a-lot] testIncludes end
  // eslint-disable-next-line operator-linebreak
  = require('../../requires')

describe('xor tests', () => {
  it('checks "xor" with no arguments', function () {
    assert.deepEqual(arrayDsl([1, 2, 3, 4, 5]).xor(), [1, 2, 3, 4, 5])
  })
  it('checks "xor" with arguments', function () {
    assert.deepEqual(arrayDsl([1, 2, 3, 4, 5]).xor([1, 6])(), [2, 3, 4, 5, 6])
  })
  it('checks "xor" with the same data', function () {
    assert.deepEqual(arrayDsl([1, 2, 3, 4, 5]).xor([1, 6]).xor([1, 6]).sort(), [1, 2, 3, 4, 5])
  })
})
