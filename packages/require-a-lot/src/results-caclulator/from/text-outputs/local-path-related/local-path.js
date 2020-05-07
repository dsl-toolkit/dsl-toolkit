module.exports = (ralContainer, localPath, localPackageName) => {
  const { infoList } = ralContainer
  localPath && (() => {
    infoList[localPackageName] = { head: `*file path*: ${localPackageName}` }
  })()
}
