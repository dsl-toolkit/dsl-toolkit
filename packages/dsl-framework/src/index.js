/* eslint-disable no-trailing-spaces */
/* eslint-disable block-spacing */
/* eslint-disable brace-style */
/* eslint-disable indent */

const dslFrameworkFactory = require('./core/index.js')
const { toRegistry, makePlugin } = require('./real-time/index.js')
module.exports = dslFrameworkFactory((e, d) => {
  const { registry, aspects } = toRegistry(d)
  const factory = dslFrameworkFactory.createFactory()
  factory.setCoreData(d)
  factory.realTime = registry
  factory.realTimePlugin = makePlugin(registry, aspects)
  return factory})
