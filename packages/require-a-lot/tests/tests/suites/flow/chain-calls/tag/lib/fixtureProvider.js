// [require-a-lot] testRequires begin
const {
  directoryFixtureProvider, // directory-fixture-provider@1.6.63 | https://github.com/dsl-toolkit/directory-fixture-p...
  fixturesPath, // *di parameter* |
  path, // *node module*: path | https://nodejs.org/api/path.html |
  requireALot // *alias* of ../../src | The main library itself. |
}
// [require-a-lot] testRequires end
  = require('../../../../../../lib/requires')

const fixtureProvider = (path = 'unused') => {
  const provider = directoryFixtureProvider(`${fixturesPath}/${path}`)()
  const fixture = provider.get('./')
  const {dir:fixtureDir} = fixture
  const ral = requireALot(require)('fs')
  .linkDirectory(fixtureDir)
  .tag('a')
  return {
    ral,
    fixture,
    fixtureDir,
    provider
  }
}
module.exports = fixtureProvider
