const arrify = require('./lib/arrify.js')
// import functionArgumentsGeter  from 'get-function-arguments'
const functionArgumentsGeter = require('../lib/function-parameters-parser.js')

module.exports = (parameters, infoList, results, requireModuleInstance, proxy, loggerTool) => {
  const create = parameters.arguments('create', 'allEntries', [])
  create.length &&
  (() => {
    create.map(createDetails => {
      loggerTool()('createDetails', createDetails, )
      const returnObject = {}
      const factoryDefinition = typeof createDetails[1] === 'string'
        ? requireModuleInstance(createDetails[1])
        : createDetails[1]
      const parameterNames = createDetails[2]
        ? (()=>{
          const ret = arrify(createDetails[2])
          loggerTool()('Used container items defined as array',{referredServices:ret})
          return ret
        })()
        : (()=>{
          const ret = functionArgumentsGeter(factoryDefinition)
          loggerTool()('Used container items fetched form the service definition function parameters', {referredServices:ret})
          return ret
        })()
      infoList[createDetails[0]] = { head: '*di factory result* ' }
      infoList[createDetails[0] + 'Factory'] = { head: '*di factory* ' }

      returnObject[createDetails[0]] = () => factoryDefinition(
        ...parameterNames.map(dependecyName => proxy[dependecyName]))

      returnObject[createDetails[0] + 'Factory'] = () => proxy[createDetails[0]]

      return returnObject
    }).forEach(composed => Object.assign(results, composed))
  })()

  return require('./lib/get-keys.js')(create, 'factory')
}
