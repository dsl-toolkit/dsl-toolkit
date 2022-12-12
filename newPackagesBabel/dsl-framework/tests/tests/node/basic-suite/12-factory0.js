module.exports = (curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance, dslFramework) => {
  describe('factory functionality', function () {
    it('.Testing subcommand', function () {
      const data = dslFramework()().x.y.z
        .a.ddddd('a', '1', 'c').h.j.k
        .a.ddddd('a', '2', 'c').g.h.j
        .a.ddddd('a', '3', 'c').ds.s.fa('11')
        .b.ddddd('a', 'a', 'a')
        .a('b', 'c')()
        .data

      const r = data.getSubcommand('a')().map((item, i) => {
        const ddddd = item.command.get('ddddd')
        const j = item.command.get('j')
        return { ddddd, j }
      })

      r.forEach((e, i) => {
        // eslint-disable-next-line no-throw-literal
        if (typeof e.ddddd === 'undefined') { throw 'Well that should have beeen defined.' }
      })
    })
  })
}
