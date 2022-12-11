/* eslint-disable block-spacing */
/* eslint-disable brace-style */
/* eslint-disable indent */

function extractCallbackData (...args) {
  let baseKindArguments = Array.from(args)
  const argumentsLastIndex = baseKindArguments.length >= 2 ? baseKindArguments.length - 1 : false
  const argumentsOneBeforeLastIndex = baseKindArguments.length >= 3 ? argumentsLastIndex - 1 : false
  let trueCaseFunction = false
  let falseCaseFunction = false

  if (argumentsLastIndex) {
    if (argumentsOneBeforeLastIndex) {
      falseCaseFunction = argumentsLastIndex
        ? typeof arguments[argumentsLastIndex] === 'function'
            ? args[argumentsLastIndex]
            : false
        : false
      trueCaseFunction = argumentsOneBeforeLastIndex
        ? typeof args[argumentsOneBeforeLastIndex] === 'function'
            ? args[argumentsOneBeforeLastIndex]
            : false
        : false
    } else {
      trueCaseFunction = argumentsLastIndex
        ? typeof args[argumentsLastIndex] === 'function'
            ? args[argumentsLastIndex]
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
  return {
    baseKindArguments,
    havingCaseFunction,
    trueCaseFunction,
    falseCaseFunction
  }
}
export default extractCallbackData
