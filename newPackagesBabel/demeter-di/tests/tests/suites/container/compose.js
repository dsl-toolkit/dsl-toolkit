const assert = require('assert')

 const containerFactory = require('dsl-framework')()((e, parameters) => require('../../../../src/index.js')(parameters))

const basicInstance = containerFactory
  .define('a', 'AAA')
  .compose('b', (a) => `${a}BBB`)
  .create('c', (b, a) => ({ b, a }))()

  describe('define', ()=>{
    it('tests',()=>{
      const data = containerFactory
      .define({'fuu':'faa','faa':'fuu'})
      .define('bbb', 'ccc')
      ()
    const {bbb, fuu, faa} = data
    assert(fuu==='faa' && faa==='fuu' && bbb === 'ccc')
    })})

