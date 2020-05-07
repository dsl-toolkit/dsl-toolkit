const { linkerDir, linkerFile } = require('generic-text-linker')
const trimRight = require('trim-right')
const fs = require('fs')

const linking = (linkFile, begin, end, msg, emptySpaces) => {
  msg = msg.split('\n').map(line => trimRight(line)).join('\n')
  const params = [linkFile, begin, end, msg.split('\n')
  .map(line => emptySpaces + line).join('\n')]
  const returnObject =  typeof linkFile === 'string'
    ? fs.lstatSync(linkFile).isDirectory()
      ? linkerDir(...params)
      : linkerFile(...params)
    : {}

  return returnObject
}

const prepareMsgAsParameters = (msg) => msg
.replace("const {\n", '')
.replace("\n}", '')
// .replace("}", '')
.trimRight()

module.exports = (ralContainer) => (linkFile, msg, emptySpaces, extraTag) => {
  const {messagePieces} = ralContainer
  let {begin, end} = messagePieces
  begin += extraTag
  end += extraTag
  const preparedMsg = begin.endsWith('parameters') ? prepareMsgAsParameters(msg) : msg

  return linking(linkFile, begin, end, preparedMsg, emptySpaces)
}

module.exports.tags = ['', ' parameters']
