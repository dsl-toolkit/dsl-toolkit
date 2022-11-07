const _ = require('underscore')

module.exports = (dslFrameworkParameters, results) => {
  dslFrameworkParameters.data.returnArrayChunks = objectMapper(dslFrameworkParameters.data.returnArrayChunks)
  const parameters = require('./parameterGetter')(dslFrameworkParameters)
  const services = require('./servicesGetter')(dslFrameworkParameters)
  const factories = require('./factoriesGetter')(dslFrameworkParameters)
  const composedStore = {}

  return require('./containerProxyFactory')
  (results,factories, services, parameters, composedStore)}


  const objectMapper = (returnArrayChunks) =>{
    const result= returnArrayChunks.map(line=>{
      const possibleObjectDefinition = line[1]
      return _.isObject(possibleObjectDefinition)?
        (()=>{
          let adsl = require('dsl-framework').noPromoises()()
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
