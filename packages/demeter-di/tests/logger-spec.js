const assert = require('assert')
const demeterDi = require('../src/index.js')
const containerFactoryFactory = demeterDi.containerFactoryFactory

describe('logger support', function () {
  it('logs through console while no logger is defined', function () {
    const logged = []
    const original = console.log
    console.log = (...args) => logged.push(args)
    try {
      const container = containerFactoryFactory()
        .logger({ logsTillLoggerDefined: true })
        .define('a', 'AAA')
        .compose('b', (a) => a)
        ()
      assert.strictEqual(container.b, 'AAA')
    } finally {
      console.log = original
    }
    assert(logged.length > 0)
  })

  it('forwards to a provided logger function', function () {
    const logged = []
    const container = containerFactoryFactory()
      .logger({ logger: (...args) => logged.push(args) })
      .define('a', 'AAA')
      .compose('b', (a) => a)
      ()
    assert.strictEqual(container.b, 'AAA')
    assert(logged.length > 0)
    assert.strictEqual(logged[0][0], '|demeter-di|')
  })
})
