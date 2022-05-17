const assert = require('assert')

 const containerFactory = require('dsl-framework')()((e, parameters) => require('../../../../src')(parameters))

const basicInstance = containerFactory
  .define('a', 'AAA')
  .compose('b', (a) => `${a}BBB`)
  .create('c', (b, a) => ({ b, a }))()

describe('checking services', ()=>{
  it('tests if defined services are in therir place', ()=>{
    assert(basicInstance.b === 'AAABBB')
  })
  it('.', ()=>{
    let calculated=0
    const container = containerFactory
    .define('a', 'AAA')
    .compose('b', (a) => {
      calculated+=1;
      // console.log({calculated}); 
      return `${a}BBBCCC`
    })()

    container.b
    container.b
    container.b
    container.b
    container.b
    assert(calculated)
    container.b
    // assert(calculated===2)
  })

  it('makes sure that a serice is evaluated only once.', ()=>{
    let calculated=0
    const container = containerFactory
    .define('a', 'AAA')
    .create('b', (a) => {
      calculated+=1;
      // console.log({calculated});
      return `${a}BBBCCC`
    })()

    container.b
    // assert(calculated)
    container.b
    // console.log(calculated);
    assert(calculated===2)
  })
})

describe('checking constants', ()=>{
  it('tests if defined constants are reachable',()=>{
    assert(basicInstance.a === 'AAA')
  })

  it('tests if NOT defined constants/services... are undefined',()=>{
    assert(basicInstance.A === undefined)
  })

  it('tests if an undefined constant cannot be created',()=>{
    basicInstance.A = 'a'
    assert(basicInstance.A === undefined)
  })
  
  it('tests if an defined constant cannot be overwritten',()=>{
    basicInstance.a = 'aaa'
    assert(basicInstance.a === 'AAA')
  })
  
})

// describe('container tests', () => {
  // it('tests .create .compose .define combo', () => {

  //   const template = requireALot(require)('assert', 'chai')
  //     .from('chai', ['expect'])
  //     .define('one', 1)
  //     // .define('composedStuff',2)
  //     .compose('composedStuff', (assert, expect, one) => ({ a: assert, e: expect, one }), ['assert', 'expect', 'one'])
  //     .create('castLogicalFalse', (assert, one, composedStuff) => {
  //       const randomValue = Math.floor(Math.random() * Math.floor(100))
  //       return (someBoolean) => {
  //         try {
  //           assert(someBoolean)
  //           // l({randomValue,one,composedStuff}).die()
  //           return { randomValue, someBoolean, one, composedStuff }
  //         } catch (e) {
  //           return false
  //         }
  //       }
  //     }, ['assert', 'one', 'composedStuff'])
  //     ()
  //   assert(template.castLogicalFalse(true).one === 1)
  //   assert(template.castLogicalFalse(true).composedStuff.one === 1)
  //   const checkIfNotZero = (
  //     (template.castLogicalFalse(true).randomValue - template.castLogicalFalse(true).randomValue) +
  //     (template.castLogicalFalse(true).randomValue - template.castLogicalFalse(true).randomValue) +
  //     (template.castLogicalFalse(true).randomValue - template.castLogicalFalse(true).randomValue) +
  //     (template.castLogicalFalse(true).randomValue - template.castLogicalFalse(true).randomValue))
  //   assert(
  //     checkIfNotZero !== 0
  //   )
  // })

//   it('container existence test', () => {
//     assert(basicInstance().a === 'AAA')
//   })

//   describe('container hidden variables', () => {
//     it('_define', () => {
//       const ff = basicInstance()
//       assert(ff._define.a)
//       assert(ff._define.a.kind === 'parameter')
//     })
//     it('_compose', () => {
//       const ff = basicInstance()
//       assert(ff._compose.b)
//       assert(ff._compose.b.kind === 'service')
//     })
//     it('_create', () => {
//       const ff = basicInstance()
//       assert(ff._create.c)
//       assert(ff._create.c.kind === 'factory')
//     })
//     it('_allKeys', () => {
//       const ff = basicInstance()
//       assert(Array.isArray(ff._allKeys))
//       assert(ff._allKeys.length > 0)
//       assert.deepEqual(ff._allKeys, ['a', 'b', 'c'])
//     })
//     describe('_duplicateKeys', () => {
//       it('no duplicates', () => {
//         const ff = basicInstance()
//         assert(Array.isArray(ff._duplicateKeys))
//         assert(ff._duplicateKeys.length === 0)
//       })
//       it('duplicates', () => {
//         const ff = basicInstance()
//         const duplicateContentInThisContainer = require('../../../../src/app-container-factory')()
//           .define('a', 'AAA')
//           .compose('b', (a) => a)
//           .create('c', (b, a) => ({ b, a }))
//           .create('a', (b) => ({ b }))()

//         assert(Array.isArray(duplicateContentInThisContainer._duplicateKeys))
//         assert(duplicateContentInThisContainer._duplicateKeys.length === 1)
//         assert(duplicateContentInThisContainer._duplicateKeys.length === 1)
//       })
//     })
//     describe('_unused', () => {
//       it('case1', () => {
//         const ff = basicInstance()
//         assert(Array.isArray(ff._unused))
//         assert(ff._unused.length > 0)
//         assert.deepEqual(ff._unused, ['a', 'b', 'c'])
//         ff.c
//         assert.deepEqual(ff._unused, ['a', 'b'])
//         ff.c
//         assert.deepEqual(ff._unused, ['a', 'b'])
//         ff.b
//         assert.deepEqual(ff._unused, ['a'])
//         ff.a
//         assert.deepEqual(ff._unused, [])
//       })
//       it('case2', () => {
//         const ff = basicInstance()
//         assert(Array.isArray(ff._unused))
//         assert(ff._unused.length > 0)
//         assert.deepEqual(ff._unused, ['a', 'b', 'c'])
//         ff.b
//         assert.deepEqual(ff._unused, ['a', 'c'])
//         ff.a
//         assert.deepEqual(ff._unused, ['c'])
//         ff.c
//         assert.deepEqual(ff._unused, [])
//       })
//     })
//     describe('_undefined', () => {
//       it('case1', () => {
//         const ff = basicInstance()
//         assert(Array.isArray(ff._undefined))
//         assert(ff._undefined.length === 0)
//         assert.deepEqual(ff._undefined, [])
//         ff.c
//         assert.deepEqual(ff._undefined, [])
//         ff.cc
//         assert.deepEqual(ff._undefined, ['cc'])
//         ff.fff
//         assert.deepEqual(ff._undefined, ['cc', 'fff'])
//       })
//     })
//   })
// })
