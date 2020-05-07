const camelCase = require('camelcase')

module.exports = (ralContainer, localPath, returnObject, name) => {
  const { requireModuleInstance } = ralContainer
  localPath && (() => {
    // l("AAAA", libraryToRequire, localPackageName, camelCase(name))()
    returnObject[name] = requireModuleInstance(name)
  })()
  localPath || (() => { returnObject[camelCase(name)] = requireModuleInstance(name) })()
}
