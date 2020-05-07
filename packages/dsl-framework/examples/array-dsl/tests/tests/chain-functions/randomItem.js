// [require-a-lot] testIncludes begin
const {
  arrayDsl // *alias* of src |
}
// [require-a-lot] testIncludes end
  // eslint-disable-next-line operator-linebreak
  = require('../../requires')

describe('arrayFindIndexs tests', () => {
  it('checks "randomItem" ', function () {
    const item = arrayDsl([1, 2]).randomItem()
    if (!(item === 1 || item === 2)) {
      // eslint-disable-next-line no-throw-literal
      throw `something bad happened ${item}`
    }
  })
})
