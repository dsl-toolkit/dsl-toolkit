/* eslint-disable brace-style */
/* eslint-disable block-spacing */
import parser from './arguments/parser.js'

const commandParserFactory = (value) => (getProcess) => parser(value, getProcess)

export default (returnObject) => function * () {
  const commands = returnObject.data.returnArrayChunks
  for (let i = 0; i <= commands.length - 1; i++) {
    const value = commands[i]
    const command = commands[i][0]
    yield {
      command,
      arguments: commandParserFactory(value)('allEntries')[0]
    }}}
