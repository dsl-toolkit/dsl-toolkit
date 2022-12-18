const assert = require('assert')

 const containerFactory = require('dsl-framework')()((e, parameters) => require('../src/index.js')(parameters))

const basicInstanceMaker=()=>containerFactory
.define('a', 'AAA')
.compose('b', (a) => `${a}BBB`)
.create('c', (b, a) => ({ b, a }))()

const basicInstance = basicInstanceMaker()

  describe('object parameter', ()=>{
    it('tests',()=>{
      const data = containerFactory
      .define({
        'fuu':'faa',
        'faa':'fuu'})
      .define('bbb', 'ccc')
      .create({
        factoryA:(fuu)=>({a:fuu}),
        factoryAA:(fuu)=>fuu})
      .compose({
        serviceB:(faa)=>({b:faa})})
      .compose('serviceC', (faa)=>({c:faa}))
      ()
    const {bbb, fuu, faa, factoryA, serviceB, serviceC} = data

    console.log({bbb, fuu, faa, factoryA, serviceB, serviceC});

      assert(fuu==='faa' && faa==='fuu' && bbb === 'ccc')
      assert(fuu==='faa' && faa==='fuu' && bbb === 'ccc')

      console.log({factoryA, serviceB, serviceC}, 'NNNN')

      // assert(factoryA.a==='faa')
      // assert(serviceB.b==='fuu')
      // assert(serviceC.c==='fuu')

    })})

  describe('checking services', ()=>{
  it('tests if defined services are in therir place', ()=>{
    assert(basicInstance.b === 'AAABBB')})

  it('test defining constants and compose services.', ()=>{
    const container = containerFactory
    .define('a', 'AAA')
    .compose('b', (a) => {
      return`${a}BBB`})()
    assert(container.b==='AAABBB')})

    it('makes sure that a serice is evaluated only once.', ()=>{
      let calculated=0
      const container = containerFactory
      .define('a', 'AAA')
      .compose('b', (a) => {
        calculated++;
        return `${a}BBBCCC`})()

      container.b;container.b;container.b;container.b;container.b;container.b;container.b;container.b;
      container.b;container.b;container.b;container.b;container.b;container.b;container.b;container.b;

      assert(calculated>0)
      assert(calculated===1)})

    it('makes sure that a factory is evaluated not only once.', ()=>{
      let calculated=0
      const container = containerFactory
      .define('a', 'AAA')
      .create('b', (a) => {
        calculated++;
        return `${a}BBBCCC`})()

      container.b;container.b;container.b;container.b;container.b;container.b;container.b;container.b;
      container.b;container.b;container.b;container.b;container.b;container.b;container.b;container.b;

      assert(calculated===16)})})

describe('checking constants', ()=>{
  it('tests if defined constants are reachable',()=>{
    assert(basicInstance.a === 'AAA')})

  it('tests if NOT defined constants/services... are undefined',()=>{
    assert(basicInstance.A === undefined)})

  // it('tests if an undefined constant cannot be created',()=>{
  //   basicInstance.A = 'a'
  //   console.log(basicInstance.A,'basicInstance.A');
  //   assert(basicInstance.A === undefined)})

  // it('tests if an defined constant cannot be overwritten',()=>{
  //   basicInstance.a = 'aaa'
  //   assert(basicInstance.a === 'AAA')})

  })


  describe('container hidden variables', () => {
    it('_define', () => {
      const ff = basicInstance
      assert(ff._define.a)
      assert(ff._define.a.kind === 'parameter')})
    it('_compose', () => {
      const ff = basicInstance
      assert(ff._compose.b)
      assert(ff._compose.b.kind === 'service')})

    // it('_create', () => {
    //   const ff = basicInstance()
    //   assert(ff._create.c)
    //   assert(ff._create.c.kind === 'factory')
    // })

    it('_allKeys', () => {
      const ff = basicInstance
      assert(Array.isArray(ff._allKeys))
      assert(ff._allKeys.length > 0)
      assert.deepEqual(ff._allKeys, ['a', 'b', 'c'])})

    describe ('tests giving malformed functions for compose', ()=>{
      it('test defining constants and compose services.', ()=>{
        const container = containerFactory
        .define('a', 'AAA')
        .compose('b', c => {
          return`${a}BBB`})();

        try{
          (()=>container.b)()
          assert(false)
        }
        catch(e){
          // console.log(e);
          assert(e.toString().startsWith('ReferenceError: a is not defined'))}})})})

    describe('_duplicateKeys', () => {
      it('test defining constants and compose services.', ()=>{
        const container = containerFactory
        .define('a', 'AAA')
        .define('a', 'bbb')
        .compose('b', (a)=>{
          return 'faa'+a
        })

        .compose('b', (a)=>{
          return 'fuuu'+a
        })()

        console.log(container.a,container.b,"EEEEEEEEEEEEEEEEEEE");
        // assert(container.b = 'fuubbb')
      })

      // it('no duplicates', () => {
      //   const ff = basicInstance
      //   assert(Array.isArray(ff._duplicateKeys))
      //   assert(ff._duplicateKeys.length === 0)
      // })

      // it('duplicates', () => {
      //   const ff = basicInstanceMaker()
      //   // const duplicateContentInThisContainer = require('../../../../src/app-container-factory')()
      //     ff.define('a', 'AAA')
      //     .compose('b', (a) => a)
      //     .create('c', (b, a) => ({ b, a }))
      //     .create('a', (b) => ({ b }))()

      //   assert(Array.isArray(duplicateContentInThisContainer._duplicateKeys))
      //   assert(duplicateContentInThisContainer._duplicateKeys.length === 1)
      //   assert(duplicateContentInThisContainer._duplicateKeys.length === 1)
      // })
      
    })
    describe('_unused', () => {
      it('case1', () => {
        const ff = basicInstanceMaker()
        assert(Array.isArray(ff._unused))
        assert(ff._unused.length > 0)
        assert.deepEqual(ff._unused, ['a', 'b', 'c'])
        ff.c
        assert.deepEqual(ff._unused, ['a', 'b'])
        ff.c
        assert.deepEqual(ff._unused, ['a', 'b'])
        ff.b
        assert.deepEqual(ff._unused, ['a'])
        ff.a
        assert.deepEqual(ff._unused, [])
      })
      it('case2', () => {
        const ff = basicInstanceMaker()
        assert(Array.isArray(ff._unused))
        assert(ff._unused.length > 0)
        assert.deepEqual(ff._unused, ['a', 'b', 'c'])
        ff.b
        assert.deepEqual(ff._unused, ['a', 'c'])
        ff.a
        assert.deepEqual(ff._unused, ['c'])
        ff.c
        assert.deepEqual(ff._unused, [])
      })
    })
    describe('indefined container tags, shall return indefined.', () => {
      it('case1', () => {
        const ff = basicInstanceMaker()
        console.log();
        assert(ff.notDefined === undefined)
        assert(ff._undefined, [])})})
  // })

