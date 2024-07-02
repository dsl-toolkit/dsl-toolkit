module.exports = function (curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance) {
  require('./command-parser')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance)
  require('./has')(curryCallbackObject, expect, enviromentSupportsPromises, dslFrameworkDefaultInstance)
}
