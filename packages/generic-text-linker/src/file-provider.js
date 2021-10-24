const readdir = require('recursive-readdir-sync')

module.exports = exports = function (rootDir) {
  const files = readdir(rootDir)
  const blackList = ['.git', '.svn', 'node_modules', 'dist', 'tests/fixtures']
  const fileList = []
  files.forEach(function (file) {
    let blackListed = false
    blackList.forEach(function (pathPart) {
      if (blackListed && file.includes(pathPart)) {
        blackListed = true
      }
    })
    /* istanbul ignore else */
    if (!blackListed) {
      fileList.push(file)
    }
  })

  return fileList
}
