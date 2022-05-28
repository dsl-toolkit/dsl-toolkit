'use strict'
const configParser = require('./app/configParser/configParser')
// const dslFreamewrk = require('dsl-framework')()

module.exports = exports = function (defaultParametersToken) {
  defaultParametersToken = defaultParametersToken || 'default'
  const appContainer =
    require('./app/container')(Object.assign(configParser('default'), configParser(defaultParametersToken)))

  return appContainer.get('cowlog')()
}
