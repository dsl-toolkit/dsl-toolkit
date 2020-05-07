// [require-a-lot] testIncludes begin
const {
  arrayDsl // *alias* of src |
} =
// [require-a-lot] testIncludes end
  require('../../requires')

describe('arrayFindIndexs tests', () => {
  it('checks "uniqueRandomArray" ', function () {
    const items = arrayDsl([1, 2]).uniqueRandomArray()
    for (let i = 0; i <= 3; i++) {
      const item = items()
      if (!(item === 1 || item === 2)) {
        throw new Error(`something bad happened ${item}`)
      }
    }
  })
})
