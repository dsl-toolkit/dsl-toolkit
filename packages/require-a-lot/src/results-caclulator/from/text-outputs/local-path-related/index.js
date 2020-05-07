module.exports = (ralContainer, localPath, libraryToRequire) => {
  require('./local-path')(ralContainer, localPath, libraryToRequire)
  require('./not-local-path')(ralContainer, localPath, libraryToRequire)
}
