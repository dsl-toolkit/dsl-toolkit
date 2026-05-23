module.exports = (curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance, dslFramework) => {
  describe('Subcommand grouping with factory / repeate.me', function () {

    it('preserves repeated command groups through replay', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d)
      const original = template
        .a.task('first', 'do-this')
        .a.task('second', 'do-that')
        .a.task('third', 'do-other')()

      const fresh = dslFrameworkDefaultInstance((e, d) => d)
      const replayedData = original.data.repeate.me(fresh)()

      const tasks = replayedData.command.get('task')
      expect(tasks).to.deep.equal([
        ['task', 'first', 'do-this'],
        ['task', 'second', 'do-that'],
        ['task', 'third', 'do-other']
      ])
    })

    it('supports get.more on replayed subcommand groups', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d)
      const original = template
        .a.ddddd('a', '1', 'c').h.j.k
        .a.ddddd('a', '2', 'c').h.j.k
        .a.ddddd('a', '3', 'c').h.j.k
        .b.other('x')()

      const fresh = dslFrameworkDefaultInstance((e, d) => d)
      const replayedData = original.data.repeate.me(fresh)()

      const dddddGroup = replayedData.command.get.more('ddddd')
      expect(dddddGroup).to.have.lengthOf(1)
      expect(dddddGroup[0]).to.have.lengthOf(3)
      dddddGroup[0].forEach(function (entry) {
        expect(entry[0]).to.equal('ddddd')
        expect(entry[3]).to.equal('c')
      })
    })

    it('supports get.object on replayed data', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d)
      const original = template.item('skate').item('bike').item('snowboard')()

      const fresh = dslFrameworkDefaultInstance((e, d) => d)
      const replayedData = original.data.repeate.me(fresh)()

      const obj = replayedData.command.get.object('item')
      expect(obj.item).to.deep.equal([
        ['item', 'skate'],
        ['item', 'bike'],
        ['item', 'snowboard']
      ])
    })

    it('supports has.or with replayed subcommands', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d)
      const original = template.foo('x').bar('y').baz('z')()

      const fresh = dslFrameworkDefaultInstance((e, d) => d)
      const replayedData = original.data.repeate.me(fresh)()

      expect(replayedData.command.has.or(['foo', 'nope'])).to.equal(true)
      expect(replayedData.command.has.or(['nope', 'missing'])).to.equal(false)
    })

    it('supports has.and with replayed subcommands', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d)
      const original = template.foo('x').bar('y').baz('z')()

      const fresh = dslFrameworkDefaultInstance((e, d) => d)
      const replayedData = original.data.repeate.me(fresh)()

      expect(replayedData.command.has.and(['foo', 'bar', 'baz'])).to.equal(true)
      expect(replayedData.command.has.and(['foo', 'nope'])).to.equal(false)
    })

    it('replays an already-terminated DSL as a template for new calls', function () {
      const template = dslFrameworkDefaultInstance((e, d) => d)
      const original = template.a.b('c')()

      const fresh = dslFrameworkDefaultInstance((e, d) => d)
      const replayedProxy = original.data.repeate.me(fresh)

      replayedProxy.extra('added')
      const result = replayedProxy()

      expect(result.command.has('a')).to.equal(true)
      expect(result.command.has('b')).to.equal(true)
      expect(result.command.has('extra')).to.equal(true)
      expect(result.command.get('extra')).to.deep.equal([['extra', 'added']])
    })
  })
}
