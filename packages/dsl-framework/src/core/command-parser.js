const getArrayData = require('./lib/get-array-data')
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

      const hasLogicalKind = (kind) => function () {
        const commands = getArrayData(arguments)
        return commands ? baseObject.has.more(commands).reduce(kind) : false
      }

      baseObject.has.and = hasLogicalKind((acc = true, currValue) => acc && currValue)
      baseObject.has.or = hasLogicalKind((acc = true, currValue) => acc || currValue)

      baseObject.hasAnd = baseObject.has.and
      baseObject.hasOr = baseObject.has.or

      baseObject.has.xor = function () {
        const commands = getArrayData(arguments)

        return commands
          ? baseObject.has.more(commands).filter((entry) => entry).length &&
          baseObject.has.more(commands).filter((entry) => !entry).length
          : false
      }
      baseObject.hasXor = baseObject.has.xor

      const toObjectKind = (kind) => function () {
        const returnObject = {}
        getArrayData(arguments).forEach(entry => {
          returnObject[entry] = baseObject[kind](entry)
        })

        return returnObject
      }

      baseObject.has.object = toObjectKind('has')
      baseObject.get.object = toObjectKind('get')

      baseObject.hasObject = baseObject.has.object
      baseObject.getObject = baseObject.get.object

      return baseObject
    },

    getArguments: function (command, commands) {
      if (typeof commands === 'undefined') {
        commands = returnObject.data.returnArrayChunks
      }
      return this.get(command).map((command) => command.slice(1))
    }
  }

  return baseObject.init()
}

function getMoreKind (baseObject) {
  return (kind) => function () {
    const commands = getArrayData(arguments)
    return commands.map(command => baseObject[kind](command))
  }
}

function getBaseKind (baseObject, returnObject) {
  return (kind) => function () {
    let baseKindArguments = Array.from(arguments)
    const argumentsLastIndex = baseKindArguments.length >= 2 ? baseKindArguments.length - 1 : false
    const argumentsOneBeforeLastIndex = baseKindArguments.length >= 3 ? argumentsLastIndex - 1 : false
    let trueCaseFunction = false; let falseCaseFunction = false

    if (argumentsLastIndex) {
      if (argumentsOneBeforeLastIndex) {
        falseCaseFunction = argumentsLastIndex ? typeof arguments[argumentsLastIndex] === 'function' ? arguments[argumentsLastIndex] : false : false
        trueCaseFunction = argumentsOneBeforeLastIndex ? typeof arguments[argumentsOneBeforeLastIndex] === 'function' ? arguments[argumentsOneBeforeLastIndex] : false : false
      } else {
        trueCaseFunction = argumentsLastIndex ? typeof arguments[argumentsLastIndex] === 'function' ? arguments[argumentsLastIndex] : false : false
        falseCaseFunction = false
      }
    }
    trueCaseFunction && (() => baseKindArguments = baseKindArguments.slice(0, -1))()
    falseCaseFunction && (() => baseKindArguments = baseKindArguments.slice(0, -1))()

    const havingCaseFunction = !!trueCaseFunction || !!falseCaseFunction

    const command = arguments[0]

    const returnValue = Array.isArray(command) || baseKindArguments.length > 1
      ? baseObject[`${kind === 'some' ? 'has' : 'get'}`].more(command)
      : returnObject.data.returnArrayChunks[kind](argumentArray => argumentArray[0] === command)

    if (!havingCaseFunction) {
      return returnValue
    }
    if (havingCaseFunction) {
      returnValue && trueCaseFunction && trueCaseFunction()
      returnValue || falseCaseFunction && falseCaseFunction()
    }
  }
}
