const assert = require('assert')

 const containerFactory = require('dsl-framework')()((e, parameters) => require('../src/index.js')(parameters))

  describe('define', ()=>{
    it('tests',()=>{
      const data = containerFactory
      .define({'fuu':'faa','faa':'fuu'})
      .define('bbb', 'bbb')
      ()
    const {bbb, fuu, faa} = data
    assert(fuu==='faa' && faa==='fuu' && bbb === 'bbb')
    })})
