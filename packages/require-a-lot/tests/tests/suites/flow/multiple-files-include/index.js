
describe('included ', () => {
  it('default behaviour', () => {

    const {
      assert,
      isNyc
    } = require('../../../../lib/requires')

    const {
      anotherTestData
    } = require('../../../../lib/requires')

    assert(typeof isNyc === 'boolean')
    assert(anotherTestData === 'test')

  })
})
