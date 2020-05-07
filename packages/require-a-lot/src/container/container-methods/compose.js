const { parseScript } = require('esprima')
const arrayDsl = require('array-dsl')

module.exports = (parameters, infoList, results, requireModuleInstance, proxy) => {
  const composes = parameters.arguments('compose', 'allEntries', [])
  composes.length &&
  (() => {
    composes.map(composeDetails => {
      const returnObject = {}
      const service = composeDetails[1]
      const isItPath = typeof service === 'string'
        ? requireModuleInstance(composeDetails[1])
        : composeDetails[1]
      let parameterNames = !!composeDetails[2]
        ? arrayDsl(composeDetails[2]).arrify()
        : parseScript(service.toString()).body[0].expression.params.map(e => e.name)
      // l(composeDetails[2])()

      // l(isItPath,
      //   service,
      //   // parseScript(data.toString()),
      //   parameterNames)()

      infoList[composeDetails[0]] = { head: `*di service*` };
      returnObject[composeDetails[0]] = () => service(
        ...parameterNames.map(dependecyName => proxy[dependecyName]))
      return returnObject
    }).forEach(composed => Object.assign(results, composed))
  })()

  return require('./lib/get-keys')(composes, 'service')
}
