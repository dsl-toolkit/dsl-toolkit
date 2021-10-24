module.exports = function (input, find, options = { nothingAfterFind: true }) {
  const { nothingAfterFind } = options
  const inputArray = input.split('\n')
  const returnValue = []
  inputArray.forEach(function (line, lineKey) {
    /* istanbul ignore else */
    if (line.includes(find) && (!nothingAfterFind || (line.endsWith(find)))) {
      returnValue.push(lineKey)
    }
  })

  return returnValue
}
