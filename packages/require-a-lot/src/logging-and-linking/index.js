const textGenerator = require('./message-creator/textGenerator')
module.exports = (ralContainer) => (includeThese = false) => {
  const { parameters, messagePieces } = ralContainer
  require('./message-creator/mesaggeCommentFiller')(ralContainer)
  const { tagOpen, tagEnd, tagEqual } = messagePieces
  const msg = textGenerator(ralContainer)(includeThese)

  const consoleMessage = require('./prepare-before-placement')(tagOpen + msg + tagEnd + tagEqual)
  parameters.command.has('log') && console.log(consoleMessage)

  require('./linker')(ralContainer)()
}
