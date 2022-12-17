const assert = require('assert')
const { create } = require('underscore')

 const containerFactory = require('dsl-framework')()((e, parameters) => require('../../../../src/index.js')(parameters))

 const counter = 0

 describe('create', ()=>{
    it('tests',()=>{
      const data = containerFactory
      .create({
        fuu: () => 'faa'&&counter++,
        faa: (bbb) => bbb&&counter++,
      })
      create('fua', () => 'faaa'&&counter++)
      .define('bbb', 'ccc')
      ()
    const {fuu, faa, fua} = data
    console.log({fuu, faa,fua});
    assert(fuu==='faa')
    assert(fua==='faaa')
    
    assert (counter===3)
    })})

