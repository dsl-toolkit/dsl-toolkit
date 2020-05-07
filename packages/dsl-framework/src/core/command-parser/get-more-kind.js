const getArrayData = require('../lib/get-array-data')
const { extractCallbackData } = require('./extractCallbackData')

module.exports = (baseObject) => {
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
      return baseObject[kind](command)
    })
  }
}
