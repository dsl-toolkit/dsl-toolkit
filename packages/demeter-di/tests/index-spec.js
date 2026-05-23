const assert = require('assert')
const demeterDi = require('../src/index.js')
const containerFactory = demeterDi.containerFactory

const basicInstanceMaker=()=>containerFactory
.define('a', 'AAA')
.compose('b', (a) => `${a}BBB`)
.create('c', (b, a) => ({ b, a }))()

const basicInstance = basicInstanceMaker()

  describe('object parameter', ()=>{
    it('tests',()=>{
      const {bbb, fuu, faa,
        factoryA,
        factoryAA,
        serviceB,
        serviceC
      } = containerFactory
      .define({
        'fuu':'faa',
        'faa':'fuu'})
      .define('bbb', 'ccc')
      .create({
        factoryA:(fuu)=>{
          const returnThis = {a:fuu}
          console.log(returnThis)
          return returnThis
        },
        factoryAA:(fuu)=>{
          const returnThis = fuu
          console.log({returnThis},"rrrrr");
          return returnThis
        },
        factoryAAA:(fuu)=>{
          const returnThis = {a:fuu}
          console.log({returnThis});
          return returnThis
        }
      })
      .compose({
        serviceB:faa=>
          //unfortunately this format is not workting so don't return an object like this.
          // ({b:faa})

        {
          const ret= {b:faa}
          console.log({ret},"LLLL");
          return ret
        }
      })
      .compose('serviceC', (faa, fuu)=>{
        const r = {c:faa,fuu}
        console.log({r});
        return {c:faa,fuu}
      })
      ()

      assert(fuu==='faa' && faa==='fuu' && bbb === 'ccc')
      assert(fuu==='faa' && faa==='fuu' && bbb === 'ccc')

      console.log({serviceB},"LLLLLLLLLLLLL", 'NNNN')

      console.log({factoryA});
      assert(factoryA.a==='faa')
      assert(factoryAA==='faa')
      assert(serviceB.b==='fuu')
      assert(serviceC.c==='fuu')
      assert(serviceC.fuu==='faa')

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

  it('tests if an undefined constant cannot be created',()=>{
    basicInstance.A = 'a'
    assert(basicInstance.A === undefined)})

  it('tests if a defined constant cannot be overwritten',()=>{
    basicInstance.a = 'aaa'
    assert(basicInstance.a === 'AAA')})

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

    it('_create', () => {
      const ff = basicInstance
      assert(ff._create.c)
      assert(ff._create.c.kind === 'factory')
    })

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
      it('no duplicates returns empty array', function () {
        const ff = basicInstance
        assert(Array.isArray(ff._duplicateKeys))
        assert.equal(ff._duplicateKeys.length, 0)
      })

      it('detects duplicates across define and create', function () {
        const container = containerFactory
        .define('a', 'AAA')
        .compose('b', function (a) { return a })
        .create('c', function (b, a) { return { b: b, a: a } })
        .create('a', function (b) { return { b: b } })()

        assert(Array.isArray(container._duplicateKeys))
        assert.equal(container._duplicateKeys.length, 1)
        assert.deepEqual(container._duplicateKeys, ['a'])
      })

      it('detects duplicate across define and compose', function () {
        const container = containerFactory
        .define('shared', 'value')
        .compose('shared', function () { return 'overridden' })()

        assert(Array.isArray(container._duplicateKeys))
        assert.deepEqual(container._duplicateKeys, ['shared'])
      })

      it('detects duplicate across compose and create', function () {
        const container = containerFactory
        .compose('dup', function () { return 'service' })
        .create('dup', function () { return 'factory' })()
        assert(Array.isArray(container._duplicateKeys))
        assert.deepEqual(container._duplicateKeys, ['dup'])
      })

      it('detects multiple duplicated keys across kinds', function () {
        const container = containerFactory
        .define('x', 1)
        .compose('x', function () { return 2 })
        .compose('y', function () { return 3 })
        .create('y', function () { return 4 })()
        assert.deepEqual(container._duplicateKeys.sort(), ['x', 'y'])
      })
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
        assert.deepEqual(ff._undefined, ['notDefined'])
      })
    })
  // })

