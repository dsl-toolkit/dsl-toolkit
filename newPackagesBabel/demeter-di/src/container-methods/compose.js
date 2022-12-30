import arrify from 'arrify';
import functionArgumentsGeter  from '../lib/function-parameters-parser.js'

module.exports = (parameters, infoList, results, requireModuleInstance, proxy, loggerTool) => {
  const composes = parameters.arguments('compose', 'allEntries', [])

  composes.length &&
  (() => {
    composes.map(composeDetails => {

      const composed = {}
      const service = composeDetails[1]

      const parameterNames = composeDetails[2] ? (()=>{
        const ret = arrify(composeDetails[2])
        loggerTool()('Used container items defined as array',{referredServices:ret})
        return ret
      })()
      : (()=>{
        const ret = functionArgumentsGeter(service)
        loggerTool()('Used container items form the service definition function parameters', {referredServices:ret})
        return ret
      })()

      composed[composeDetails[0]] = () =>
        service(...parameterNames.map(dependecyName => proxy[dependecyName]))

      return composed}).
        forEach(composed => Object.assign(results, composed))})()

  return require('./lib/get-keys.js')(composes, 'service')}
