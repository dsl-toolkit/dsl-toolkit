import _ from 'underscore'
import dslf from 'dsl-framework'

module.exports = (dslFrameworkParameters, results) => {
  dslFrameworkParameters.data.returnArrayChunks = objectMapper(dslFrameworkParameters.data.returnArrayChunks)
  const parameters = require('./parameterGetter.js')(dslFrameworkParameters)
  const services = require('./servicesGetter.js')(dslFrameworkParameters)
  const factories = require('./factoriesGetter.js')(dslFrameworkParameters)
  const composedStore = {}

  return require('./containerProxyFactory.js')
  (results,factories, services, parameters, composedStore)}


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
