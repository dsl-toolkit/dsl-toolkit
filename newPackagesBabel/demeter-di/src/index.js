const compose = require('./container-methods/compose.js')
const create = require('./container-methods/create.js')
const define = require('./container-methods/define.js')

const methods = {compose, create, define}

module.exports = (parameters, results = {}, requireModuleInstance, infoList = {}) => {
  const loggerArument = parameters.arguments('logger', 'allEntries', false)
  const loggerToolContainerRow = loggerArument && loggerArument || false
  const [loggerToolContainer] = loggerToolContainerRow && loggerToolContainerRow || [false],
  loggerTool = () => (...args) => {
      ;loggerToolContainer?.noLogsTillLoggerDefined ||
      loggerToolContainer?.logger && (loggerToolContainer?.logger || console.log)(...args)
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
