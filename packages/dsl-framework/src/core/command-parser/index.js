/* eslint-disable brace-style */
/* eslint-disable block-spacing */
const getArrayData = require('../lib/get-array-data.js')
const getBaseKind = require('./get-base-kind.js')
const getMoreKind = require('./get-more-kind.js')

module.exports = exports = (returnObject) => {
  const baseObject = {
    init: () => {
      const baseKind = getBaseKind(baseObject, returnObject)

      baseObject.has = baseKind('some')
      baseObject.get = baseKind('filter')

      const moreKind = getMoreKind(baseObject)
      baseObject.has.more = moreKind('has')
      baseObject.get.more = moreKind('get')
      baseObject.hasMore = baseObject.has.more
      baseObject.getMore = baseObject.get.more

      const hasLogicalKind = (kind) => function (...args) {
        const commands = getArrayData(args)
        return commands ? baseObject.has.more(commands).reduce(kind) : false}

      baseObject.has.and = hasLogicalKind((acc = true, currValue) => acc && currValue)
      baseObject.has.or = hasLogicalKind((acc = true, currValue) => acc || currValue)
      baseObject.hasAnd = baseObject.has.and
      baseObject.hasOr = baseObject.has.or
      baseObject.has.xor = function (...args2) {
        const commands = getArrayData(args2)

        return commands
          ? baseObject.has.more(commands).filter((entry) => entry).length &&
          baseObject.has.more(commands).filter((entry) => !entry).length
          : false}
      baseObject.hasXor = baseObject.has.xor

      const toObjectKind = (kind) => function (...args3) {
        const returnObject = {}
        getArrayData(args3).forEach(entry => {
          returnObject[entry] = baseObject[kind](entry)})

        return returnObject}
      baseObject.has.object = toObjectKind('has')
      baseObject.get.object = toObjectKind('get')
      baseObject.hasObject = baseObject.has.object
      baseObject.getObject = baseObject.get.object
      return baseObject},

    getArguments: function (command, commands) {
      if (typeof commands === 'undefined') {
        commands = returnObject.data.returnArrayChunks}
      return this.get(command).map((command) => command.slice(1))}
  }
  return baseObject.init()}
