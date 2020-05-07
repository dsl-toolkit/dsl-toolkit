// [require-a-lot] testAsset001 begin
const {
  expect, // *tag* of chai |
  logger, // *di service* | an instance of the cowlog |
  path, // *node module*: path | https://nodejs.org/api/path.html |
  requireALot, // *alias* of ../../src | The entry point of the package |
  sayHelloToName, // *di service* | A service |
  somethingComplex // *di service* | A factory that is inline defined |
}
// [require-a-lot] testAsset001 end
  = require('./requires')()

// { requireALot, path, logger, somethingComplex, sayHelloToName, chai, expect }
{ requireALot, path, logger, somethingComplex, sayHelloToName, expect }

somethingComplex('Erika', true)
