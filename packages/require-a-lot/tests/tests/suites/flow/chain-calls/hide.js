// [require-a-lot] testRequires begin
const {
  assert, // *node module*: assert | https://nodejs.org/api/assert.html |
  consoleCapture, // undefined
  requireALot // *alias* of ../../src | The main library itself. |
}
// [require-a-lot] testRequires end
  = require('../../../../lib/requires')

describe('.hide', () => {
  it('tests .hide()', () => {
    const template = requireALot(require)('chai').from('chai', ['expect']).hide('chai')
    const tst = template()
    assert(!tst.chai)
    assert(tst.expect)
  })

  xit('tests .hide() with .log()', () => {
    const template = requireALot(require)('chai').from('chai', ['expect']).hide('chai')('log')
    let result = null
    const output = consoleCapture(() => {result = template()})
    assert(!output.includes('chai'))
    assert(output.includes('expec'))
    assert(result.expect)
  })
})
