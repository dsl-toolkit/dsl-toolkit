/* eslint-disable brace-style */
/* eslint-disable block-spacing */
/* eslint-disable indent */
'use strict'
const stringifyObject = require('stringify-object')
const flatten = require('flat')
const fclone = require('fclone')
// todo: Needs refactoring!
const weGotMarkdown = process.env.markdown

module.exports = exports = function (container) {
  module.dictionary = container.get('dictionary')
  module['logger-print-helpers'] = container.get('logger-print-helpers')

  return function (colored, originalArguments, calculatedParameters, loggerPrintHelpers) {
    const referenceFunctionArguments = false
    return module.createBody(
      colored, referenceFunctionArguments, originalArguments, calculatedParameters, loggerPrintHelpers)}}

module.createArgumentName = function extracted (referenceFunctionArguments, iterator) {
  const argumentName = iterator
  return argumentName}

module.createArgumentDelimiter = function (text, colored, argumentName) {
  let delimiter = argumentName + ` ${text} ${module.dictionary.argumentNameDelimiter}---`
  delimiter = module['logger-print-helpers'].getInverseString(colored, delimiter)
  delimiter = '\n' + delimiter + '\n'
  return delimiter}

module.createBody = function extracted (
  colored, referenceFunctionArguments, originalArguments, calculatedParameters, loggerPrintHelpers) {
  if (colored && weGotMarkdown) {
    colored = false}
  let logBody = ''
  const parametersLength = originalArguments.length
  for (let i = 0; i < parametersLength; i++) {
    const argumentName = module.createArgumentName(referenceFunctionArguments, i)
    let newMsg = ''
    newMsg += module.createArgumentDelimiter(
      module.dictionary.beginning, colored, argumentName, calculatedParameters, loggerPrintHelpers)
    const value = originalArguments[i]
    const isObject = value != null && typeof value === 'object'
    const valueToShow = isObject ? flatten(fclone(value)) : value
    const stringifyedParameter = stringifyObject(valueToShow, {
      indent: '  ',
      singleQuotes: false
    })
    newMsg += stringifyedParameter
    newMsg += module.createArgumentDelimiter(
      module.dictionary.end, colored, argumentName, calculatedParameters, loggerPrintHelpers)
    logBody += newMsg
  }

  const cols = process.stdout.columns || 80
  const bodyArray = logBody.split('\n')
  return bodyArray.map((line) => {
    const limit = cols - 6
    const tooLongLine = line.length >= limit
    if (tooLongLine) {
      return (line.match(RegExp(`.{1,${limit}}`, 'gm')).join('\n'))}
    if (!tooLongLine || !line.length) {
      return line}}).join('\n')}
