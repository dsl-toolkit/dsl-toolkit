const compose = require('./container-methods/compose.js')
const create = require('./container-methods/create.js')
const define = require('./container-methods/define.js')

const methods = {compose, create, define}

module.exports = (parameters, results = {}, requireModuleInstance, infoList = {}) => {
  const baseProxy = require('./proxy/index.js')(parameters, results)
  const containerKindData = ['define', 'compose', 'create']
  const containerMethods = []


  containerKindData.forEach((kind) => {
    containerMethods.push(methods[kind])})

  const registeredKeys = containerMethods.map(method => method
    (parameters, infoList, results,requireModuleInstance, baseProxy))

  const resultingObjectKeys = {}
  containerKindData.forEach((kind, index) => {resultingObjectKeys[kind] = containerMethods[index]})
  const notHiddenReaches = {}

  return require('./proxy/hidden-tags-proxy/index.js')
    (notHiddenReaches)
      (baseProxy, containerKindData, registeredKeys, containerMethods)}
