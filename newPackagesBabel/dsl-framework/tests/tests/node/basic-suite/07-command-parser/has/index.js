const assert = require('assert')
module.exports = (
  curryCallbackObject,
  expect,
  enviromentSupportsPromises,
  dslFrameworkDefaultInstance,
  dslFramework
) => {
  describe('.has', () => {
    const example = dslFrameworkDefaultInstance((e, d) => {
      return d
    })

    const data = example.a
      .b('c')
      .d('e', 'f')
      .g('h', 'i')
      .g('j', 'k')()

    describe('retun true or false', () => {
      describe('one argument', () => {
        it('tests true case', () => {
          assert(data.command.has('g') === true)
        })
        it('tests false case', () => {
          assert(data.command.has('Hey') === false)
        })
      })
    })

    describe('callback', () => {
      describe('true case', () => {
        it('In case to flase callback is not present', () => {
          let beenThere = false
          data.command.has('a', () => {
            beenThere = true
          })
          assert(beenThere)
        })
        it('In case to flase callback is present', () => {
          let beenThere = false
          let neverWasThere = true
          data.command.has(
            'a',
            () => {
              beenThere = true
            },
            () => {
              neverWasThere = false
            }
          )
          assert(beenThere)
          assert(neverWasThere)
        })
      })
    })

    it('false case', () => {
      let beenThere = false
      let neverWasThere = true
      data.command.has(
        'HEY',
        () => {
          neverWasThere = false
        },
        () => {
          beenThere = true
        }
      )
      assert(beenThere)
      assert(neverWasThere)
    })
  })
}
