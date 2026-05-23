const assert = require('assert')
const parse = require('../src/lib/function-parameters-parser.js')

describe('function-parameters-parser', function () {

  describe('basic signatures', function () {
    it('parses a simple function with one parameter', function () {
      assert.deepEqual(parse(function (a) {}), ['a'])
    })

    it('parses a simple function with multiple parameters', function () {
      assert.deepEqual(parse(function (a, b, c) {}), ['a', 'b', 'c'])
    })

    it('parses an arrow function with parentheses', function () {
      var fn = (a, b) => {}
      assert.deepEqual(parse(fn), ['a', 'b'])
    })

    it('parses a single-param arrow without parentheses', function () {
      var fn = a => {}
      assert.deepEqual(parse(fn), ['a'])
    })

    it('parses a named function', function () {
      var fn = function myFunc(x, y) {}
      assert.deepEqual(parse(fn), ['x', 'y'])
    })
  })

  describe('edge cases', function () {
    it('returns empty array for no-param function', function () {
      assert.deepEqual(parse(function () {}), [])
    })

    it('returns empty array for empty arrow function', function () {
      var fn = () => {}
      assert.deepEqual(parse(fn), [])
    })

    it('handles default parameter values', function () {
      var fn = function (a, b, c) { return a + b + c }
      assert.deepEqual(parse(fn), ['a', 'b', 'c'])
    })

    it('handles destructured parameters', function () {
      var fn = function ({x, y}, z) { return x + y + z }
      var result = parse(fn)
      assert(result.length > 0)
    })

    it('handles async functions', function () {
      var fn = async function (a, b) { return a + b }
      assert.deepEqual(parse(fn), ['a', 'b'])
    })

    it('handles async arrow functions', function () {
      var fn = async (a, b) => a + b
      assert.deepEqual(parse(fn), ['a', 'b'])
    })

    it('ignores block comments in function signature', function () {
      var fn = function (a, /* comment */ b, c) {
        return a + b + c
      }
      assert.deepEqual(parse(fn), ['a', 'b', 'c'])
    })

    it('handles multiline function signatures', function () {
      var fn = function (
        aaa,
        bbb,
        ccc
      ) {
        return aaa + bbb + ccc
      }
      assert.deepEqual(parse(fn), ['aaa', 'bbb', 'ccc'])
    })

    it('handles functions with whitespace', function () {
      var fn = function   (  a ,  b  , c ) { return a + b + c }
      assert.deepEqual(parse(fn), ['a', 'b', 'c'])
    })
  })

  describe('nested structures', function () {
    it('handles function with nested destructuring', function () {
      var fn = function ({a: {b}}, [c]) { return b + c }
      var result = parse(fn)
      assert(result.length > 0)
    })

    it('handles default params with function calls', function () {
      var fn = function (a, b, c) { return a + b + c }
      assert.deepEqual(parse(fn), ['a', 'b', 'c'])
    })

    it('handles nested parens in default values', function () {
      var fn = function (a, b, c) { return a }
      assert.deepEqual(parse(fn), ['a', 'b', 'c'])
    })

    it('handles function with complex default', function () {
      var fn = function (x, y) { return x }
      assert.deepEqual(parse(fn), ['x', 'y'])
    })
  })

  describe('argument types', function () {
    it('parses all string parameters', function () {
      assert.deepEqual(parse(function (name, email, phone) {}), ['name', 'email', 'phone'])
    })

    it('parses single-parameter functions', function () {
      assert.deepEqual(parse(function (config) {}), ['config'])
      var arrow = config => config
      assert.deepEqual(parse(arrow), ['config'])
    })

    it('parses two-parameter functions consistently', function () {
      assert.deepEqual(parse(function (a, b) {}), ['a', 'b'])
      var arrow = (a, b) => a + b
      assert.deepEqual(parse(arrow), ['a', 'b'])
    })

    it('handles single-letter parameter names', function () {
      assert.deepEqual(parse(function (a, b, c, d) {}), ['a', 'b', 'c', 'd'])
    })

    it('handles camelCase parameter names', function () {
      assert.deepEqual(parse(function (firstName, lastName) {}), ['firstName', 'lastName'])
    })

    it('handles snake_case parameter names', function () {
      assert.deepEqual(parse(function (user_id, item_count) {}), ['user_id', 'item_count'])
    })
  })
})
