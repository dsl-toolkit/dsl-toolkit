const {getInstalledPathSync} = require('get-installed-path')
const path = require('path')
const camelCase = require('camelcase')
const collectPackageInfo = require('./collectPackageInfo')

function attemptToGetFilepath (name) {
  let filePath = ''
  let probablyNodeModule = false
  try {
    filePath = path.join(path.join(getInstalledPathSync(name, { local: true }), 'package.json'))
  } catch (e) {
    probablyNodeModule = true
  }
  return { filePath, probablyNodeModule }
}

function extractd (probablyNodeModule, name, infoList) {
  probablyNodeModule && (() => {
    const camelCaseName = camelCase(name)
    // noPackageInfo.push(name)
    infoList[camelCaseName] = {
      head: `*node module*: ${name}`,
      homepage: `https://nodejs.org/api/${name}.html`
    }
  })()
}

module.exports = (ralContainer, localPath, name) => {
  const { parameters, infoList } = ralContainer
  const info = parameters.command.has('info')

  localPath || (() => {
    let { filePath, probablyNodeModule } = attemptToGetFilepath(name)
    extractd(probablyNodeModule, name, infoList)
    const infoData = collectPackageInfo(probablyNodeModule, filePath, info, infoList, name)

    require('./from')(ralContainer, name, infoData)
    require('./alias')(ralContainer, name, infoData)
  })()
}

