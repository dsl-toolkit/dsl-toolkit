/* eslint-disable block-spacing */
/* eslint-disable brace-style */
/* eslint-disable indent */

const { extractCallbackData } = require('./extractCallbackData')

module.exports = (baseObject, returnObject) => {
  return kind =>
    function () {
      const {
        baseKindArguments,
        havingCaseFunction,
        trueCaseFunction,
        falseCaseFunction
      } = extractCallbackData(...arguments)

      const command = arguments[0]

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
