import arrify from 'arrify'
import functionArgumentsGeter  from 'get-function-arguments'


console.log({functionArgumentsGeter},functionArgumentsGeter((a)=>a));

module.exports = (parameters, infoList, results, requireModuleInstance, proxy) => {
  const create = parameters.arguments('create', 'allEntries', [])
  create.length &&
  (() => {
    create.map(createDetails => {
      console.log('createDetails', createDetails, '----')
      const returnObject = {}
      const factoryDefinition = typeof createDetails[1] === 'string'
        ? requireModuleInstance(createDetails[1])
        : createDetails[1]
      const parameterNames = createDetails[2]
        ? arrify(createDetails[2])
        : (()=>{
          // console.log('factoryDefinition', factoryDefinition.toString(), '----',functionArgumentsGeter(factoryDefinition))
          return functionArgumentsGeter(factoryDefinition)})()

      console.log({parameterNames}, '----++++');
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
