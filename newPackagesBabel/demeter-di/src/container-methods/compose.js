//get rid of esprima for now
// const { parseScript } = require('esprima')
import { parseScript } from 'esprima';
import arrify from 'arrify';

module.exports = (parameters, infoList, results, requireModuleInstance, proxy) => {
  const composes = parameters.arguments('compose', 'allEntries', [])

  composes.length &&
  (() => {
    composes.map(composeDetails => {

      const composed = {}
      const service = composeDetails[1]

      const parameterNames = composeDetails[2] ? arrify(composeDetails[2])
      : parseScript(service.toString()).body[0].expression.params.map(e => e.name)

      composed[composeDetails[0]] = () =>
        service(...parameterNames.map(dependecyName => proxy[dependecyName]))

      return composed}).
        forEach(composed => Object.assign(results, composed))})()

  return require('./lib/get-keys')(composes, 'service')}
