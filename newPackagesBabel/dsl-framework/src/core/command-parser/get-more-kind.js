/* eslint-disable block-spacing */
/* eslint-disable brace-style */

const getArrayData = require('../lib/get-array-data')
const { extractCallbackData } = require('./extractCallbackData')

module.exports = (baseObject) => {
  return (kind) => function (...args) {
    const commands = getArrayData(args)

    const {
      baseKindArguments,
      trueCaseFunction,
      falseCaseFunction
    } = extractCallbackData(...commands)

    return baseKindArguments.map(command => {
      const actualCommand = [...command]
      trueCaseFunction && actualCommand.push(trueCaseFunction)
      falseCaseFunction && actualCommand.push(falseCaseFunction)
      return baseObject[kind](command)})}}
