module.exports = (curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance, dslFramework) => {
  describe('Detached executor and container state edge cases', function () {

    describe('detached-executor module', function () {
      var detachedExecutor = require('../../../../src/core/detached-executor.js')

      it('returns a timeout handle when given a callback', function () {
        var data = { test: true }
        var timeoutId = detachedExecutor(data, function () {})
        expect(timeoutId).to.not.equal(null)
        expect(timeoutId).to.not.equal(undefined)
        clearTimeout(timeoutId)
      })

      it('returns null when callback is not provided', function () {
        var result = detachedExecutor({ test: true })
        expect(result).to.equal(null)
      })

      it('returns null when callback is not a function', function () {
        var result = detachedExecutor({ test: true }, 'not-a-function')
        expect(result).to.equal(null)
      })

      it('calls the callback asynchronously with (2, data)', function (done) {
        var data = { key: 'value' }
        detachedExecutor(data, function (arg1, arg2) {
          expect(arg1).to.equal(2)
          expect(arg2).to.deep.equal(data)
          done()
        })
      })
    })

    describe('container state reset', function () {
      it('terminating with () preserves the accumulated data', function () {
        var dsl = dslFrameworkDefaultInstance((e, d) => d)
        var result = dsl.a.b('c')()
        expect(result.data.returnArrayChunks).to.deep.equal([['a'], ['b', 'c']])
      })

      it('returnArray reflects all registered commands', function () {
        var dsl = dslFrameworkDefaultInstance((e, d) => d)
        var result = dsl.x(1).y(2).z(3)()
        expect(result.data.returnArray()).to.deep.equal(['x', 1, 'y', 2, 'z', 3])
      })
    })

    describe('sparse chaining', function () {
      it('handles property-only chains (no arguments) ending with ()', function () {
        var dsl = dslFrameworkDefaultInstance((e, d) => d)
        var result = dsl.open.start.begin()
        expect(result.data.returnArrayChunks).to.deep.equal([['open'], ['start'], ['begin']])
      })

      it('handles mixed sparse and argumented chains', function () {
        var dsl = dslFrameworkDefaultInstance((e, d) => d)
        var result = dsl.a.b.c(1).d.e.f(2, 3).g()
        expect(result.data.returnArrayChunks).to.deep.equal([
          ['a'],
          ['b'],
          ['c', 1],
          ['d'],
          ['e'],
          ['f', 2, 3],
          ['g']
        ])
      })
    })

    describe('noPromises static method', function () {
      it('noPromises() returns a callable dslFramework instance', function () {
        var noPromisesDsl = dslFramework.noPromises()
        expect(noPromisesDsl).to.be.a('function')
        var result = noPromisesDsl().a.b('c')()
        expect(result.data.returnArray()).to.deep.equal(['a', 'b', 'c'])
      })
    })
  })
}
