module.exports = (ralContainer) => {
  let { results } = ralContainer
  const { parameters, infoList, noPackageInfo, requireModuleInstance } = ralContainer
  require('./from')(ralContainer)
    .forEach(partialResult => {
      results = Object.assign(results, partialResult)})
  require('./hide')(parameters, results)
  results = require('demeter-di')(parameters, results, requireModuleInstance, infoList)
  return ({ results, noPackageInfo, infoList })}
