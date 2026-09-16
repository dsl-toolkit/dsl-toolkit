/* eslint-disable block-spacing */
/* eslint-disable brace-style */

const getArrayData = require('../lib/get-array-data.js')
const { extractCallbackData } = require('./extractCallbackData.js')

module.exports = (baseObject) => {
  return (kind) => function (...args) {
    const commands = getArrayData(args)
    const { baseKindArguments } = extractCallbackData(...commands)

    return baseKindArguments.map(command => baseObject[kind](command))}}
