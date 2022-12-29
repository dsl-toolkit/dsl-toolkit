function containerFactory() {
  return require('dsl-framework')()((e, parameters) => require( '../../src/index.js')(parameters));
}
exports.containerFactory = containerFactory;
