const dslFrameworkFactory = require('./core')
const dslFrameworkFactoryInitiator = dslFrameworkFactory((e, d) => {
  dslFrameworkFactory.setCoreData(d)
  return dslFrameworkFactory
})
const inBrowser = !!process.browser

if (inBrowser) {
  window.dslFramework = dslFrameworkFactory
}

// eslint-disable-next-line no-undef
const weHaveAmd = typeof define === 'function' && define.amd

if (weHaveAmd) {
  // eslint-disable-next-line no-undef
  define('dsl-framework', [], function () {
    return dslFrameworkFactoryInitiator
  })
}

(weHaveAmd || inBrowser) && (() => { window.dslFramework = dslFrameworkFactory })()

module.exports = dslFrameworkFactoryInitiator
