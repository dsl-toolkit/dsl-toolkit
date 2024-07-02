const _ = require('underscore')
const dslf = require('dsl-framework')

module.exports = (dslFrameworkParameters, results, loggerTool) => {
  dslFrameworkParameters.data.returnArrayChunks = objectMapper(dslFrameworkParameters.data.returnArrayChunks)
  const parameters = require('./parameterGetter.js')(dslFrameworkParameters, loggerTool)
  const services = require('./servicesGetter.js')(dslFrameworkParameters, loggerTool)
  const factories = require('./factoriesGetter.js')(dslFrameworkParameters, loggerTool)
  const composedStore = {}

  return require('./containerProxyFactory.js')
  (results,factories, services, parameters, composedStore, loggerTool)}


  const objectMapper = (returnArrayChunks) =>{
    const result= returnArrayChunks.map(line=>{
      const possibleObjectDefinition = line[1]
      return _.isObject(possibleObjectDefinition)?
        (()=>{
          let adsl = dslf.noPromoises()()
          Object.keys(possibleObjectDefinition).forEach(objectKey=>{
            const value = possibleObjectDefinition[objectKey]
            adsl[objectKey](value)
          })
          const res = adsl().data.returnArrayChunks.map(e=>[line[0], ...e])
          return res
        })():
        [line]
      })
      return result.flat()}
