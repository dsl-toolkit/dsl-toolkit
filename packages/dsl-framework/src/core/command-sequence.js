const commandParserFactory = (value) => (getProcess) =>
  require('./arguments/parser')(value, getProcess)

module.exports = exports = (returnObject) => function * () {
  const commands = returnObject.data.returnArrayChunks

  for (let i = 0; i <= commands.length - 1; i++) {
    const value = commands[i]
    const command = commands[i][0]
    yield {
      command,
      arguments: commandParserFactory(value)('allEntries')[0]
    }
  }
}
