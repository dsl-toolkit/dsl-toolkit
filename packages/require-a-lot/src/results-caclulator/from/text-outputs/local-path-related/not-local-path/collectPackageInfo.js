const camelCase = require('camelcase')
module.exports = (probablyNodeModule, filePath, info, infoList, infoListIndex) => {
  probablyNodeModule || (() => {
    const module = require(filePath)
    let homepage = module.homepage
    let description = module.description
    homepage = homepage ? `${homepage}` : 'no homepage'
    description = description ? `${description}` : 'no description'
    infoData = info ? `${module.name}@${module.version} | ${homepage} | ${description}` : ''
    infoList[camelCase(infoListIndex)] = { head: `${module.name}@${module.version}`, homepage, description }
  })()
}
