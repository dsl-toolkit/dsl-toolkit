const { substingToLineMapper } = require('generic-text-linker')
const assert = require('chai').assert

module.exports = function (input, stringArray) {
  let previous = null
  let previousValue = null
  stringArray.forEach(function (value, index) {
    const actual = substingToLineMapper(input, value)
    if (index) {
      if (typeof previous === 'number' && typeof actual === 'number') {
        assert(previous < actual, '"' + previousValue + '" is not sooner than "' + value + '" in string: \n' + input)
      }
    }
    previous = actual
    previousValue = value
  })
}
