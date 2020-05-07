const {join} = require ('path');
const requireALot = require('../../src');
const isNyc = process.env.NYC_ROOT_ID;
let anInstanceOfTheCowlog = 'an instance of the cowlog';

module.exports = requireALot(require)(
  '../lib/console-capture', 'assert', 'cowlog', '../../src', 'require-dir', 'path', 'generic-text-linker', 'directory-fixture-provider'
)

  .from('chai', ['expect'])

  .alias('../../src', 'requireALot')
  .alias('dfp', 'directory-fixture-provider')
  .information('requireALot', 'The main library itself.')

  .define('fixturesPath', join(__dirname, '..', 'assets/testFixture'))

  .define( 'anotherTestData', 'test')
  .define('isNyc', !!isNyc)

  .information('isNyc', 'true if nyc is turned on')

  .compose('executeIfNycIsOff', isNyc => fn => !isNyc && fn())
  .information('executeIfNycIsOff',
    'Executes function if nyc is not running, technically if the test-dev script is runing.')

  .compose('logger', cowlog => l ? l : cowlog().log, 'cowlog')
  .information(['logger', 'l'], anInstanceOfTheCowlog)

  .compose('l', logger => logger)

  .linkDirectory(join(__dirname, '../', 'tests'))
  .log.info.tag('testRequires')

  .compose('assetDir', (path) => path.join(__dirname, '../assets'))
  .information('assetDir', 'Test assets root directory')

  .compose('diAssetDir', (path, assetDir) => path.join(assetDir, 'dependency-injection'))
  .information('diAssetDir', 'Dependency injection related test assets folder.')

  .compose('mapDirAssetDir', (path, assetDir) => path.join(assetDir, 'map-dir'))
  .information('diAssetDir', 'map-dir related test assets folder.')

  .service('fixtureProvider', (directoryFixtureProvider, fixturesPath, requireALot) => (path = 'unused') => {
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
  })




.removeUnused();
