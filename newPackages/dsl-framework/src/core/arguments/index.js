/* eslint-disable block-spacing */
/* eslint-disable brace-style */
/* eslint-disable indent */
import getArrayData from '../lib/get-array-data.js'
import parser from './parser'
const process = (parameters) => (command, getProcess, defaultValue) => {
  defaultValue = typeof defaultValue === 'undefined' ? false : defaultValue
  if (Array.isArray(command)) {
    const commands = getArrayData(command)
    return commands.map(c => process(parameters)(c, getProcess, defaultValue))
  }
  if (parameters) {
    const doWeHaveTheCommand = parameters.command.has(command)
    const returnValue = doWeHaveTheCommand ? !!parameters.command.getArguments(command) : defaultValue
    if (getProcess === 'boolean') { return doWeHaveTheCommand }
    if (returnValue === defaultValue) { return returnValue }

    const commandValue = parameters.command.get(command)
    return parser('./parser')(commandValue, getProcess)}}

  export default (parameters) => process(parameters)
// exports.toObject = (command, getProcess, defailtValue = false) => {
//   Array.isArray(command) || (() => { command = [command] })()
// }
