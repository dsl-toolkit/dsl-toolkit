const assert = require('assert')

 const containerFactory = require('dsl-framework')()((e, parameters) => require('../../../../src/index.js')(parameters))

 describe('compose', ()=>{
    it('tests compose and defines together',()=>{
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

    // todo: fix this. Constanst cannot be reached from services and factories.
    // assert(faa==='bbb')

    })})

