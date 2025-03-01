/* eslint-disable block-spacing */
/* eslint-disable brace-style */
/* eslint-disable indent */

const { extractCallbackData } = require('./extractCallbackData.js')

module.exports = (baseObject, returnObject) => {
  return kind =>
    function (...args) {
      const {
        baseKindArguments,
        havingCaseFunction,
        trueCaseFunction,
        falseCaseFunction
      } = extractCallbackData(...args)

      const command = args[0]

      const returnValue =
        Array.isArray(command) || baseKindArguments.length > 1
          ? baseObject[`${kind === 'some' ? 'has' : 'get'}`].more(command)
          : returnObject.data.returnArrayChunks[kind](
            argumentArray => argumentArray[0] === command)

      if (!havingCaseFunction) {
        return returnValue}
      if (havingCaseFunction) {
        returnValue && trueCaseFunction && trueCaseFunction()
        returnValue || (falseCaseFunction && falseCaseFunction())}}}
