const arrayDsl = require('array-dsl')
module.exports = (ralContainer) => {
  const {infoList, parameters} = ralContainer
  parameters.arguments('information', 'allEntries', [[]]).forEach(e => {
    const description = { description: e[1] }
    const containerEntries = arrayDsl(e[0]).arrify()
    containerEntries.forEach(entry => {
      infoList[entry] = infoList[entry] ? Object.assign(infoList[entry], description) : description
    })
  })

}
