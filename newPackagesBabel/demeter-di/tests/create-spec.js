const assert = require('assert')
const { create } = require('underscore')

 const containerFactory = require('dsl-framework')()((e, parameters) => require('../src/index.js')(parameters))

 let counter = 0

 describe('create', ()=>{
    it('tests',()=>{
      const data = containerFactory
      .create({
        fuu: () => {
          counter++
          return 'faa'
        },
        faa: (bbb) => {
          counter++
          return bbb
        },
      })
      .create('fua', () =>{
        counter++
        return 'faaa'
      }
      )
      .define('bbb', 'bbb')
      ()
    const {fuu, faa, fua} = data

    console.log({fuu, faa,fua})
    console.log({fua}, 'LLLL')

    assert(fua==='faaa', 'Service fuu is defined and returend correctly. // fuu!="faaa" unfortunately')
    assert(faa==='bbb')
    assert(fuu==='faa')
    
    assert (counter===3)
    })})

