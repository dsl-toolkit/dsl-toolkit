// [require-a-lot] testIncludes begin
const {
  arrayDsl, // *alias* of src |
  assert // *node module*: assert | https://nodejs.org/api/assert.html |
}
// [require-a-lot] testIncludes end
  // eslint-disable-next-line operator-linebreak
  = require('../../requires')

describe('reverse tests', () => {
  it('reverse', function () {
    const result = arrayDsl([1, 2, 3, 4, 5], true)().dsl.reverse()
    assert(result.dsl)
    delete result.dsl
    assert.deepEqual(result, [5, 4, 3, 2, 1])
  })
})
