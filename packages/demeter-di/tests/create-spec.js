const assert = require('assert')

const containerFactory = require('dsl-framework')()((e, parameters) => require('../src/index.js')(parameters))

let counter = 0

describe('create', function () {
  it('tests', function () {
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
    .create('fua', () => {
      counter++
      return 'faaa'
    })
    .define('bbb', 'bbb')
    ()
    const {fuu, faa, fua} = data

    assert(fua === 'faaa', 'Service fuu is defined and returend correctly.')
    assert(faa === 'bbb')
    assert(fuu === 'faa')
    assert(counter === 3)
  })

  describe('{name}Factory companion key', function () {
    it('provides a Factory getter that returns a factory result', function () {
      let callCount = 0
      const data = containerFactory
      .create('widget', function () {
        callCount++
        return { id: callCount }
      })()
      assert(data.widgetFactory)
      const r1 = data.widgetFactory()
      const r2 = data.widgetFactory()
      assert.equal(r1.id, 1)
      assert.equal(r2.id, 2)
    })
  })

  describe('module-require feature', function () {
    it('treats a string second argument as a module path to require', function () {
      const demeterDi = require('../src/index.js')
      const dslFramework = require('dsl-framework')()
      const data = dslFramework(function (e, parameters) {
        return demeterDi(parameters, {}, require)
      }).create('underscoreModule', 'underscore', [])()
      assert(data.underscoreModule !== undefined)
      assert.notEqual(data.underscoreModule, null)
    })
  })
})

