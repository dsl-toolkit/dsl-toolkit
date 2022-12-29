import _ from 'underscore'
import dslf from 'dsl-framework'

module.exports = (dslFrameworkParameters, results, logger) => {
  dslFrameworkParameters.data.returnArrayChunks = objectMapper(dslFrameworkParameters.data.returnArrayChunks)
  const parameters = require('./parameterGetter.js')(dslFrameworkParameters, logger)
  const services = require('./servicesGetter.js')(dslFrameworkParameters, logger)
  const factories = require('./factoriesGetter.js')(dslFrameworkParameters, logger)
  const composedStore = {}

  return require('./containerProxyFactory.js')
  (results,factories, services, parameters, composedStore, logger)}


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
