const assert = require('assert')

 const containerFactory = require('dsl-framework')()((e, parameters) => require('../../../../src/index.js')(parameters))

 describe('compose', ()=>{
    it('tests',()=>{
      const data = containerFactory
      .compose({
        fuu: () => 'faa',
        faa: (bbb) => bbb,
      })
      .define('bbb', 'ccc')
      ()
    const {fuu, faa} = data
    console.log({fuu, faa});
    assert(fuu==='faa')
    assert(faa==='bbb')
    })})

