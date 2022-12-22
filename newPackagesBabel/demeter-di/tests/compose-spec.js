const assert = require('assert')

const containerFactory = () =>require('dsl-framework')()((e, parameters) => require('../src/index.js')(parameters))

describe('compose', ()=>{

  it('gets the parameter names form an array as third parameter',()=>{
    const data = containerFactory()
    .define('bbb', 'ccc')
    .compose('faa', (bbb) => bbb, ['bbb'])()

    console.log(data.faa);
  })

  it('tests compose and defines together',()=>{
    const data = containerFactory()
    .compose({
      fuu: () => 'faa',
      faa: (bbb) => bbb,
      faaa: bbb => bbb,
    })
    .compose('faaaa', bbb=>{
      return bbb
    })
    .compose('faaaaa', function(bbb,ccc
        // test
      ){
      return bbb+ccc
    })
    .define('bbb', 'ccc')
    .define('ccc', 'ddd')
    ()
  const {fuu, faa,faaa, asy, faaaa,faaaaa} = data
  console.log({fuu, faa});
  assert(fuu==='faa')

    // todo: fix this. Constanst cannot be reached from services and factories.
    assert(faa==='ccc')
    assert(faaa==='ccc')
    assert(faaaa==='ccc')
    assert(faaaaa==='cccddd')
  // assert(asy==='ccc')

  console.log({asy})

})})
