/* eslint-disable no-trailing-spaces */
/* eslint-disable block-spacing */
/* eslint-disable brace-style */
/* eslint-disable indent */

const dslFrameworkFactory = require('./core/index.js')
module.exports = dslFrameworkFactory((e, d) => {
  dslFrameworkFactory.setCoreData(d)
  return dslFrameworkFactory})
