module.exports = (dslFrameworkParameters, results) => {
  const services = require('./servicesGetter')(dslFrameworkParameters)
  const factories =  require('./factoriesGetter')(dslFrameworkParameters)
  const parameters = require('./parameterGetter')(dslFrameworkParameters)

  return require('./containerProxyFactory')(results, factories, services, parameters)
}
