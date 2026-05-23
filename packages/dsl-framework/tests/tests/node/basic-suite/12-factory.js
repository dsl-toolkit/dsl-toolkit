module.exports = (curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance, dslFramework) => {
  describe('Factory and repeate.me', function () {
    it('replays all commands into a fresh instance preserving returnArrayChunks', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d)
      const original = template.a.b('c').d('e', 'f').g('h')()

      const fresh = dslFrameworkDefaultInstance((e, d) => d)
      const replayedData = original.data.repeate.me(fresh)()

      expect(replayedData.data.returnArrayChunks).to.deep.equal(original.data.returnArrayChunks)
    })

    it('allows extending replayed instance with additional commands', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d)
      const original = template.a.b('c')()

      const fresh = dslFrameworkDefaultInstance((e, d) => d)
      const replayedProxy = original.data.repeate.me(fresh)
      replayedProxy.x('y', 'z')
      const result = replayedProxy()

      expect(result.data.returnArrayChunks).to.deep.equal([
        ['a'],
        ['b', 'c'],
        ['x', 'y', 'z']
      ])
    })

    it('creates multiple independent instances from the same template', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d).a.b('c')()

      const makeInstance = function () { return dslFrameworkDefaultInstance((e, d) => d) }

      const i1 = template.data.repeate.me(makeInstance())
      const i2 = template.data.repeate.me(makeInstance())

      const r1 = i1.onlyThis('hi')()
      const r2 = i2.onlyThat('bye')()

      expect(r1.data.returnArrayChunks).to.deep.equal([
        ['a'],
        ['b', 'c'],
        ['onlyThis', 'hi']
      ])
      expect(r2.data.returnArrayChunks).to.deep.equal([
        ['a'],
        ['b', 'c'],
        ['onlyThat', 'bye']
      ])
    })

    it('preserves argument data through replay', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d)
      const original = template.color('red', 'green', 'blue').size(42).shape('circle')()

      const fresh = dslFrameworkDefaultInstance((e, d) => d)
      const replayedData = original.data.repeate.me(fresh)()

      expect(replayedData.command.get('color')).to.deep.equal([['color', 'red', 'green', 'blue']])
      expect(replayedData.command.get('size')).to.deep.equal([['size', 42]])
      expect(replayedData.arguments('color', 'allEntries')).to.deep.equal([['red', 'green', 'blue']])
      expect(replayedData.command.get('shape')).to.deep.equal([['shape', 'circle']])
    })

    it('replays chained-only commands (no arguments)', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d)
      const original = template.a.b.c.d()

      const fresh = dslFrameworkDefaultInstance((e, d) => d)
      const replayedData = original.data.repeate.me(fresh)()

      expect(replayedData.command.has('a')).to.equal(true)
      expect(replayedData.command.has('b')).to.equal(true)
      expect(replayedData.command.has('c')).to.equal(true)
      expect(replayedData.command.has('d')).to.equal(true)
    })

    it('supports nested replay (replay of a replay)', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d).step1('do')()

      const gen2 = dslFrameworkDefaultInstance((e, d) => d)
      const expandedProxy = template.data.repeate.me(gen2)
      const expandedData = expandedProxy()

      const gen3 = dslFrameworkDefaultInstance((e, d) => d)
      const resultData = expandedData.data.repeate.me(gen3)()

      expect(resultData.command.has('step1')).to.equal(true)
      expect(resultData.command.get('step1')).to.deep.equal([['step1', 'do']])
    })

    it('produces correct command-sequence after replay', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d)
      const original = template.a.b('c').d('e')()

      const fresh = dslFrameworkDefaultInstance((e, d) => d)
      const replayedData = original.data.repeate.me(fresh)()

      const entries = [...replayedData.commandSequence()]
      expect(entries).to.deep.equal([
        { command: 'a', arguments: [] },
        { command: 'b', arguments: ['c'] },
        { command: 'd', arguments: ['e'] }
      ])
    })

    it('handles empty template replay', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d)()
      const fresh = dslFrameworkDefaultInstance((e, d) => d)
      const replayedData = template.data.repeate.me(fresh)()

      expect(replayedData.data.returnArrayChunks).to.deep.equal([])
    })
  })
}
