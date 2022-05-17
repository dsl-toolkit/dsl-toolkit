const { parseScript } = require('esprima')
const arrayDsl = require('array-dsl')

module.exports = (parameters, infoList, results, requireModuleInstance, proxy) => {
  const composes = parameters.arguments('compose', 'allEntries', [])
  composes.length &&
  (() => {
    composes.map(composeDetails => {
      const composed = {}
      const service = composeDetails[1]
      const parameterNames = composeDetails[2]
        ? arrayDsl(composeDetails[2]).arrify()
        : parseScript(service.toString()).body[0].expression.params.map(e => e.name)
      infoList[composeDetails[0]] = { head: '*di service*' }
      composed[composeDetails[0]] = () => 
        service(...parameterNames.map(dependecyName => proxy[dependecyName]))

      return composed
    }).forEach(composed => Object.assign(results, composed))
  })()

  return require('./lib/get-keys')(composes, 'service')
}
