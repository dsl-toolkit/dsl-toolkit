module.exports = (requireModuleInstance) => function () {
  const dependentLibraries = arguments
  return require('dsl-framework').noPromises()(
    (e, parameters) => {
      const ralContainer = require('./app-container-factory')()
        .define('parameters', parameters)
        .define('requireModuleInstance', requireModuleInstance)
        .define('dependentLibraries', dependentLibraries)
        .define('parameters', parameters)
        .define('results', {})
        .define('infoList', [])
        .define('noPackageInfo', [])
        .define('messagePieces', require('./logging-and-linking/message-creator/messagePieces')(parameters))()
      const { results } = require('./results-caclulator')(ralContainer);
      (parameters.command.has.or('log', 'linkDirectory')) &&
      require('./logging-and-linking')(ralContainer)

      return results
    })
}
