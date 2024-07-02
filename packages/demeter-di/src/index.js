const compose = require('./container-methods/compose.js')
const create = require('./container-methods/create.js')
const define = require('./container-methods/define.js')

const methods = {compose, create, define}

const demeterDi = module.exports = (parameters, results = {}, requireModuleInstance, infoList = {}) => {
  const loggerArument = parameters.arguments('logger', 'allEntries', false),
  loggerToolContainerRow = loggerArument && loggerArument || false,
  [loggerToolContainer] = loggerToolContainerRow && loggerToolContainerRow[0] || [false]
    const loggerTool = () => (...args) => {

      !loggerToolContainer.logger &&
      loggerToolContainer.logsTillLoggerDefined &&
      (console.log)(...args)

      loggerToolContainer.logger && (loggerToolContainer.logger)('|demeter-di|',...args)
    },
    baseProxy = require('./proxy/index.js')(parameters, results, loggerTool),
    containerKindData = ['define', 'compose', 'create'],
    containerMethods = []

  containerKindData.forEach((kind) => {
    containerMethods.push(methods[kind])})

  const registeredKeys = containerMethods.map(method => method
    (parameters, infoList, results,requireModuleInstance, baseProxy, loggerTool))

  const notHiddenReaches = {}

  return require('./proxy/hidden-tags-proxy/index.js')
    (notHiddenReaches)
      (baseProxy, containerKindData, registeredKeys)}

module.exports.containerFactory = require('dsl-framework')()((e, parameters) => demeterDi(parameters))

module.exports.containerFactoryFactory = () => require('dsl-framework')()((e, parameters) => demeterDi(parameters))

module.exports.DslFrameworkFactory = (callbackFunction) => require('dsl-framework')()(callbackFunction)
