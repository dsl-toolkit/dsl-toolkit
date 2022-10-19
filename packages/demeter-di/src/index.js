module.exports = (parameters, results = {}, requireModuleInstance, infoList = {}) => {
  const baseProxy = require('./proxy')(parameters, results)
  const containerKindData = ['define', 'compose', 'create']
  const containerMethods = []
  containerKindData.forEach((kind) => {
    containerMethods.push(require(`./container-methods/${kind}`))})

  const registeredKeys = containerMethods.map(method => method
    (parameters, infoList, results,requireModuleInstance, baseProxy))

  const resultingObjectKeys = {}
  containerKindData.forEach((kind, index) => {resultingObjectKeys[kind] = containerMethods[index]})
  const notHiddenReaches = {}

  return require('./proxy/hidden-tags-proxy')
    (notHiddenReaches)
      (baseProxy, containerKindData, registeredKeys, containerMethods)}
