/* eslint-env mocha */
const expect = require('chai').expect
const dslFramework = require('../../../src/index.js')

const returningCallback = (e, program) => program

describe('Real-time calls', function () {
  describe('minting', function () {
    it('returns a fresh factory, with its own registry, per registration chain', function () {
      const first = dslFramework.registerRealTimeCall('a', { run () {} })()
      const second = dslFramework.registerRealTimeCall('b', { run () {} })()

      expect(first).to.be.a('function')
      expect(second).to.be.a('function')
      expect(first).to.not.equal(second)
      expect(first.realTime).to.have.property('a')
      expect(first.realTime).to.not.have.property('b')
      expect(second.realTime).to.have.property('b')
    })

    it('still mints a working factory when nothing is registered', function () {
      const factory = dslFramework()
      const app = factory(returningCallback)

      expect(typeof factory.realTimePlugin).to.equal('function')

      const result = app.plain(1, 2)()
      expect(result.steps).to.deep.equal([{ command: 'plain', arguments: [1, 2] }])
      expect(result.effects).to.deep.equal([])
      expect(result.data.returnArray()).to.deep.equal(['plain', 1, 2])
    })
  })

  describe('resolve and run', function () {
    it('runs resolve before run, both at the terminal, in written order', function () {
      const calls = []
      const factory = dslFramework.registerRealTimeCall('image', {
        parameters: ['source'],
        resolve (payload) {
          calls.push(['resolve', payload.name, payload.arguments[0]])
          return [payload.arguments[0].toUpperCase()]
        },
        run (payload) {
          calls.push(['run', payload.name, payload.arguments[0]])
          return payload.arguments[0]
        }
      })()
      const app = factory(returningCallback)

      const result = app.image('x.png')()

      expect(calls).to.deep.equal([
        ['resolve', 'image', 'x.png'],
        ['run', 'image', 'X.PNG']
      ])
      expect(result.steps).to.deep.equal([{ command: 'image', arguments: ['X.PNG'] }])
      expect(result.effects).to.deep.equal(['X.PNG'])
    })

    it('hands run the resolved arguments and the whole program', function () {
      const seen = []
      const factory = dslFramework.registerRealTimeCall('image', {
        resolve (payload) {
          return ['resolved:' + payload.arguments[0]]
        },
        run (payload) {
          seen.push([
            payload.arguments[0],
            payload.program.arguments('destination', 'firstArgument'),
            payload.program.command.has('destination')
          ])
          return null
        }
      })()
      const app = factory(returningCallback)

      app.image('./x.png').destination('out')()

      expect(seen).to.deep.equal([['resolved:./x.png', 'out', true]])
    })

    it('allows a registration with only resolve', function () {
      const factory = dslFramework.registerRealTimeCall('a', {
        resolve () {
          return ['only-resolve']
        }
      })()
      const app = factory(returningCallback)

      const result = app.a('raw')()
      expect(result.steps).to.deep.equal([{ command: 'a', arguments: ['only-resolve'] }])
      expect(result.effects).to.deep.equal([])
    })

    it('throws when resolve does not return an array', function () {
      const factory = dslFramework.registerRealTimeCall('a', {
        resolve () {
          return 'not-an-array'
        }
      })()
      const app = factory(returningCallback)

      expect(function () { app.a('x')() }).to.throw('must return the argument array')
    })

    it('propagates errors thrown by run', function () {
      const factory = dslFramework.registerRealTimeCall('a', {
        run () {
          throw new Error('boom')
        }
      })()
      const app = factory(returningCallback)

      expect(function () { app.a() }).to.throw('boom')
    })
  })

  describe('add and replace', function () {
    it('treats registerRealTimeCallAdd as an alias for registerRealTimeCall', function () {
      const order = []
      const factory = dslFramework
        .registerRealTimeCall('a', { run () { order.push(1) } })
        .registerRealTimeCallAdd('a', { run () { order.push(2) } })()
      const app = factory(returningCallback)

      app.a()
      expect(order).to.deep.equal([1, 2])
    })

    it('feeds each added registration the previous one output', function () {
      const factory = dslFramework
        .registerRealTimeCall('a', {
          resolve (payload) { return [payload.arguments[0] + '1'] }
        })
        .registerRealTimeCallAdd('a', {
          resolve (payload) { return [payload.arguments[0] + '2'] }
        })()
      const app = factory(returningCallback)

      const result = app.a('x')()
      expect(result.steps).to.deep.equal([{ command: 'a', arguments: ['x12'] }])
    })

    it('clears the whole stack for a name on replace', function () {
      const order = []
      const factory = dslFramework
        .registerRealTimeCall('a', { run () { order.push(1) } })
        .registerRealTimeCall('a', { run () { order.push(2) } })
        .registerRealTimeCallReplace('a', { run () { order.push(3) } })()
      const app = factory(returningCallback)

      app.a()
      expect(order).to.deep.equal([3])
    })
  })

  describe('for-all aspects', function () {
    const aspect = (name, seen) => ({
      name,
      wrap (payload, next) {
        seen.push(`>${name}`)
        const result = next()
        seen.push(`<${name}`)
        return result
      }
    })

    it('wraps every command, including specifically registered ones', function () {
      const seen = []
      const factory = dslFramework
        .registerRealTimeCall('image', { run () { seen.push('image-run') } })
        .registerRealTimeCallForAll(aspect('logger', seen))()
      const app = factory(returningCallback)

      app.image('x').caption('y')()

      expect(seen).to.deep.equal([
        '>logger', 'image-run', '<logger',
        '>logger', '<logger'
      ])
    })

    it('treats registerRealTimeCallForAllAdd as an alias and nests first-registered outermost', function () {
      const seen = []
      const factory = dslFramework
        .registerRealTimeCallForAll(aspect('outer', seen))
        .registerRealTimeCallForAllAdd(aspect('inner', seen))()
      const app = factory(returningCallback)

      app.x()
      expect(seen).to.deep.equal(['>outer', '>inner', '<inner', '<outer'])
    })

    it('replaces all aspects on registerRealTimeCallForAllReplace', function () {
      const seen = []
      const factory = dslFramework
        .registerRealTimeCallForAll(aspect('one', seen))
        .registerRealTimeCallForAllReplace(aspect('two', seen))()
      const app = factory(returningCallback)

      app.x()
      expect(seen).to.deep.equal(['>two', '<two'])
    })

    it('lets an aspect suppress the specific handler by not calling next', function () {
      const seen = []
      const factory = dslFramework
        .registerRealTimeCall('a', { run () { seen.push('run') } })
        .registerRealTimeCallForAll({
          wrap () { seen.push('skip') }
        })()
      const app = factory(returningCallback)

      const result = app.a('x')()
      expect(seen).to.deep.equal(['skip'])
      expect(result.steps).to.deep.equal([{ command: 'a', arguments: ['x'] }])
      expect(result.effects).to.deep.equal([])
    })
  })

  describe('registration errors surface at the first ()', function () {
    it('rejects a missing command name', function () {
      expect(function () {
        dslFramework.registerRealTimeCall('', { run () {} })()
      }).to.throw('non-empty command name')
    })

    it('rejects a non-string command name', function () {
      expect(function () {
        dslFramework.registerRealTimeCall(1, { run () {} })()
      }).to.throw('non-empty command name')
    })

    it('rejects a spec that is not an object', function () {
      expect(function () {
        dslFramework.registerRealTimeCall('a')()
      }).to.throw('needs a spec object')
      expect(function () {
        dslFramework.registerRealTimeCall('a', 'nope')()
      }).to.throw('needs a spec object')
      expect(function () {
        dslFramework.registerRealTimeCall('a', [])()
      }).to.throw('needs a spec object')
    })

    it('rejects an unknown spec key', function () {
      expect(function () {
        dslFramework.registerRealTimeCall('a', { nope: 1 })()
      }).to.throw('unknown key: nope')
    })

    it('rejects parameters that are not an array of non-empty strings', function () {
      expect(function () {
        dslFramework.registerRealTimeCall('a', { parameters: 'x' })()
      }).to.throw('parameters must be an array')
      expect(function () {
        dslFramework.registerRealTimeCall('a', { parameters: [1] })()
      }).to.throw('parameters must be an array')
      expect(function () {
        dslFramework.registerRealTimeCall('a', { parameters: [''] })()
      }).to.throw('parameters must be an array')
    })

    it('rejects a non-function resolve', function () {
      expect(function () {
        dslFramework.registerRealTimeCall('a', { resolve: 1 })()
      }).to.throw('resolve must be a function')
    })

    it('rejects a non-function run', function () {
      expect(function () {
        dslFramework.registerRealTimeCall('a', { run: 1 })()
      }).to.throw('run must be a function')
    })

    it('rejects a for-all spec that is not an object', function () {
      expect(function () {
        dslFramework.registerRealTimeCallForAll(null)()
      }).to.throw('needs a spec object')
      expect(function () {
        dslFramework.registerRealTimeCallForAll('nope')()
      }).to.throw('needs a spec object')
      expect(function () {
        dslFramework.registerRealTimeCallForAll([])()
      }).to.throw('needs a spec object')
    })

    it('rejects an unknown for-all key', function () {
      expect(function () {
        dslFramework.registerRealTimeCallForAll({ wrap () {}, nope: 1 })()
      }).to.throw('unknown key: nope')
    })

    it('rejects a for-all spec without wrap', function () {
      expect(function () {
        dslFramework.registerRealTimeCallForAll({ name: 'x' })()
      }).to.throw('needs a wrap function')
    })
  })

  describe('fold', function () {
    const programOf = (command, args) => ({
      commandSequence: function * () {
        yield { command, arguments: args }
      }
    })

    it('folds a program with no aspects when the aspect list is omitted', function () {
      const { fold } = require('../../../src/real-time/index.js')
      const result = fold(programOf('a', ['x']), { a: [{ run () { return 'ran' } }] })

      expect(result.steps).to.deep.equal([{ command: 'a', arguments: ['x'] }])
      expect(result.effects).to.deep.equal(['ran'])
    })

    it('leaves commands without a registration untouched', function () {
      const { fold } = require('../../../src/real-time/index.js')
      const result = fold(programOf('plain', [1, 2]), {})

      expect(result.steps).to.deep.equal([{ command: 'plain', arguments: [1, 2] }])
      expect(result.effects).to.deep.equal([])
    })
  })
})
