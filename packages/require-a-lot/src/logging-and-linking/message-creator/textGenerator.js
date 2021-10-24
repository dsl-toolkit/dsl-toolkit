const compare = require('compare')

module.exports = (ralContainer) => (includeThese = false) => {
  const results = includeThese ? includeThese : ralContainer.results
  const {parameters, infoList} = ralContainer
  const { maxLineWidth, noTagEqual, listDelimiter, lastLineDelimiter} = require('./messagePieces')(parameters)
  const resultsKeys = Object.keys(results).sort(compare)
  let msg = `const {${listDelimiter}`
  resultsKeys.forEach(key => {
    const infoObject = infoList[key]
    let msgPiece = `  ${key}, // `
    typeof infoObject === 'object' && (() => {
      msgPiece += `${infoObject['head'] || ''} `
      if (infoObject['head']) msgPiece += '| '
      msgPiece += infoObject['homepage']
        ? `${infoObject['homepage']} `
        : ''
      if (infoObject['homepage']) msgPiece += '| '
      msgPiece += infoObject['description']
        ? `${infoObject['description'] || ''} `
        : ''
      if (infoObject['description']) msgPiece += '| '
      msgPiece += infoObject['infoData']
        ? `${infoObject['infoData'] || ''} `
        : ''
    })()
    typeof infoObject === 'object' || (() => {
      msgPiece += `${infoObject}`
    })()

    msgPiece += `${listDelimiter}`
    msg += msgPiece
  })
  msg += `${lastLineDelimiter}} ${noTagEqual} `
  msg = msg.split('\n').map(line =>
    line.length > maxLineWidth
      ? (() => {
        const tooLong = '...'
        return line.slice(0, maxLineWidth - tooLong.length) + tooLong
      })()
      : line
  ).join('\n')
  return msg
}
