/* eslint-disable block-spacing */
/* eslint-disable brace-style */
import getArrayData from '../lib/get-array-data'

import extractCallbackData from './extractCallbackData.js'

export default (baseObject) => {
  return (kind) => function () {
    const commands = getArrayData(arguments)

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
