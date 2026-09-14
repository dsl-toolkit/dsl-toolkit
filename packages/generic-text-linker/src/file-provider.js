const fs = require('fs')
const readdir = require('recursive-readdir-sync')

module.exports = exports = function (rootDir) {
  const files = readdir(rootDir)
  const blackList = [
    '.git',
    '.svn',
    'node_modules',
    'dist',
    'tests/fixtures',
    'tests/directory-fixtures'
  ]
  const fileList = []
  files.forEach(function (file) {
    let blackListed = false
    blackList.forEach(function (pathPart) {
      if (file.includes(pathPart)) {
        blackListed = true
      }
    })
    /* istanbul ignore else */
    if (blackListed) {
      return
    }
    // readdir can hand back directories and symlinks (a workspace symlink such
    // as node_modules/<pkg> is a directory). Handing one of those to
    // readFileSync throws EISDIR, and every caller treats the whole traversal
    // as failed -- so one directory would silently disable the entire rewrite.
    try {
      /* istanbul ignore else */
      if (!fs.statSync(file).isFile()) {
        return
      }
    } catch (e) {
      return
    }
    fileList.push(file)
  })

  return fileList
}
