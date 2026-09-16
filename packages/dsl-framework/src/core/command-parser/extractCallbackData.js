/* eslint-disable block-spacing */
/* eslint-disable brace-style */
/* eslint-disable indent */

function extractCallbackData (...args) {
  let baseKindArguments = Array.from(args)
  const lastIndex = args.length >= 2 ? args.length - 1 : -1
  const oneBeforeLastIndex = args.length >= 3 ? lastIndex - 1 : -1
  let trueCaseFunction = false
  let falseCaseFunction = false

  if (lastIndex > -1) {
    if (oneBeforeLastIndex > -1) {
      falseCaseFunction = typeof args[lastIndex] === 'function' ? args[lastIndex] : false
      trueCaseFunction = typeof args[oneBeforeLastIndex] === 'function' ? args[oneBeforeLastIndex] : false
    } else {
      trueCaseFunction = typeof args[lastIndex] === 'function' ? args[lastIndex] : false
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
exports.extractCallbackData = extractCallbackData
