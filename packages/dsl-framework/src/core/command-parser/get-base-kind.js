module.exports = (baseObject, returnObject) => {
  return kind =>
    function () {
      let baseKindArguments = Array.from(arguments)
      const argumentsLastIndex =
        baseKindArguments.length >= 2 ? baseKindArguments.length - 1 : false
      const argumentsOneBeforeLastIndex =
        baseKindArguments.length >= 3 ? argumentsLastIndex - 1 : false
      let trueCaseFunction = false
      let falseCaseFunction = false

      if (argumentsLastIndex) {
        if (argumentsOneBeforeLastIndex) {
          falseCaseFunction = argumentsLastIndex
            ? typeof arguments[argumentsLastIndex] === 'function'
              ? arguments[argumentsLastIndex]
              : false
            : false
          trueCaseFunction = argumentsOneBeforeLastIndex
            ? typeof arguments[argumentsOneBeforeLastIndex] === 'function'
              ? arguments[argumentsOneBeforeLastIndex]
              : false
            : false
        } else {
          trueCaseFunction = argumentsLastIndex
            ? typeof arguments[argumentsLastIndex] === 'function'
              ? arguments[argumentsLastIndex]
              : false
            : false
          falseCaseFunction = false
        }
      }
      trueCaseFunction &&
        (() => (baseKindArguments = baseKindArguments.slice(0, -1)))()
      falseCaseFunction &&
        (() => (baseKindArguments = baseKindArguments.slice(0, -1)))()

      const havingCaseFunction = !!trueCaseFunction || !!falseCaseFunction

      const command = arguments[0]

      const returnValue =
        Array.isArray(command) || baseKindArguments.length > 1
          ? baseObject[`${kind === 'some' ? 'has' : 'get'}`].more(command)
          : returnObject.data.returnArrayChunks[kind](
              argumentArray => argumentArray[0] === command
            )

      if (!havingCaseFunction) {
        return returnValue
      }
      if (havingCaseFunction) {
        returnValue && trueCaseFunction && trueCaseFunction()
        returnValue || (falseCaseFunction && falseCaseFunction())
      }
    }
}
