const assert = require('assert')
module.exports = (
  curryCallbackObject,
  expect,
  enviromentSupportsPromises,
  dslFrameworkDefaultInstance,
  dslFramework
) => {
  describe('commandParser Tests', function () {
    const example = dslFrameworkDefaultInstance((e, d) => {
      return d
    })

    const data = example.a
      .b('c')
      .d('e', 'f')
      .g('h', 'i')
      .g('j', 'k')()

    it('.has.more', function () {
      assert(data.command.has.more(['g', 'd', 'aa']))
      assert.deepEqual(data.command.has.more(['g', 'd', 'aa']), [
        true,
        true,
        false
      ])
      assert.deepEqual(data.command.has.more('g'), [true])
    })

    it('.has.and', function () {
      assert(data.command.has.and('g'))
      assert(!data.command.has.and('gg'))
      assert(!data.command.hasAnd('gg'))
      assert(data.command.has.and(['g', 'd']))
      assert(data.command.has.and(['g'], 'd'))
      assert(data.command.has.and(['g'], ['d', 'a', 'b']))
      assert(!data.command.has.and(['g', 'd', 'aa']))
      assert(!data.command.has.and(['g', 'd'], 'aa'))
      assert(!data.command.has.and(['g', 'd'], ['aa']))

      assert(!data.command.hasAnd(['g', 'd'], ['aa']))
    })

    it('.has.or', function () {
      assert(data.command.has.or(['g', 'd', 'aa']))
      assert(data.command.hasOr(['g', 'd', 'aa']))
      assert(!data.command.has.or(['gg', 'dd', 'aa']))
      assert(!data.command.has.or('gg', ['dd', 'aa']))

      assert(!data.command.hasXor('gg', ['dd', 'aa']))
    })

    it('.has.xor', function () {
      assert(data.command.hasXor(['g', 'd', 'aa']))
      assert(data.command.has.xor(['g', 'd', 'aa']))
      assert(data.command.has.xor(['g', 'd', 'j']))
      assert(!data.command.has.xor(['gg', 'dd', 'aa']))
      assert(!data.command.has.xor('g', 'd'))

      assert(!data.command.hasXor('g', 'd'))
    })

    it('.has.object', function () {
      assert.deepEqual(data.command.hasObject('g'), { g: true })
      assert.deepEqual(data.command.has.object('g'), { g: true })
      assert.deepEqual(data.command.has.object('g', 'a'), { g: true, a: true })
      assert.deepEqual(data.command.has.object(['g', 'a']), {
        g: true,
        a: true
      })
      assert.deepEqual(data.command.has.object(['g', 'a', 'foo']), {
        g: true,
        a: true,
        foo: false
      })
      assert.deepEqual(data.command.has.object(['g', 'a'], 'foo'), {
        g: true,
        a: true,
        foo: false
      })
      assert.deepEqual(data.command.has.object(['g', 'a'], ['foo'], 'b'), {
        g: true,
        a: true,
        foo: false,
        b: true
      })
      assert.deepEqual(data.command.has.object(['g', 'a'], ['foo', 'b']), {
        g: true,
        a: true,
        foo: false,
        b: true
      })

      assert.deepEqual(data.command.hasObject(['g', 'a'], ['foo', 'b']), {
        g: true,
        a: true,
        foo: false,
        b: true
      })
    })

    it('.get.more', function () {
      assert.deepEqual(data.command.get.more(['b']), [[['b', 'c']]])
      assert.deepEqual(data.command.get.more(['b'], 'd'), [
        [['b', 'c']],
        [['d', 'e', 'f']]
      ])
      assert.deepEqual(data.command.get.more(['b'], ['d', 'g']), [
        [['b', 'c']],
        [['d', 'e', 'f']],
        [
          ['g', 'h', 'i'],
          ['g', 'j', 'k']
        ]
      ])
      assert.deepEqual(data.command.get.more(['b'], ['d', 'g'], 'jj'), [
        [['b', 'c']],
        [['d', 'e', 'f']],
        [
          ['g', 'h', 'i'],
          ['g', 'j', 'k']
        ],
        []
      ])

      assert.deepEqual(data.command.getMore(['b'], ['d', 'g'], 'jj'), [
        [['b', 'c']],
        [['d', 'e', 'f']],
        [
          ['g', 'h', 'i'],
          ['g', 'j', 'k']
        ],
        []
      ])
    })

    it('.get.object', function () {
      assert.deepEqual(data.command.getObject(['b']), { b: [['b', 'c']] })
      assert.deepEqual(data.command.get.object(['b']), { b: [['b', 'c']] })
      assert.deepEqual(data.command.get.object(['b'], 'jj'), {
        b: [['b', 'c']],
        jj: []
      })
      const { g } = data.command.get.object(['b'], 'jj', 'g')
      assert.deepEqual(g, [
        ['g', 'h', 'i'],
        ['g', 'j', 'k']
      ])

      // const { d } = data.command.getObject(['b'], 'jj', 'g')
      assert.deepEqual(g, [
        ['g', 'h', 'i'],
        ['g', 'j', 'k']
      ])
    })

    it('.has and .get with an array or with several names', function () {
      assert.deepEqual(data.command.has(['g', 'dd']), [true, false])
      assert.deepEqual(data.command.has('g', 'dd'), [true, false])
      assert.deepEqual(data.command.get(['b', 'dd']), [[['b', 'c']], []])
    })

    it('.has.and, .has.or and .has.xor without commands', function () {
      assert.strictEqual(data.command.has.and(), false)
      assert.strictEqual(data.command.has.or(), false)
      assert.strictEqual(data.command.has.xor(), 0)
    })

    it('.arguments.object with a scalar mode and default', function () {
      assert.deepEqual(data.arguments.object('g', 'lastEntry', 'fallback'), { g: ['j', 'k'] })
      assert.deepEqual(data.arguments.object('missing', 'firstArgument', 'fallback'), { missing: 'fallback' })
    })

    it('exposes the low level getFrom', function () {
      assert.strictEqual(typeof data.getFrom(0).command.has, 'function')
    })

    // it('.', function () {

    // })
  })
}
