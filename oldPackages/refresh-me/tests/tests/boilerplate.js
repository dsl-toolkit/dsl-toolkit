const shell = require('shelljs');
const path = require('path');
const assert = require('assert');
const getCurrentBranch = require('../../src/lib/get-current-branch');
const dfp = require('directory-fixture-provider')
const fixtureDirectoryProvider = dfp(path.join(__dirname, '../assets'))()

function boilerplate(pathPart) {
  const assetRelativePath = `javascript/${pathPart}/`;
  const fixtureDataPath = fixtureDirectoryProvider.get(assetRelativePath).dir;
  shell.cd(fixtureDataPath);
  shell.exec(`git init && git add . && git commit -m"just for the test && npm install"`);
  console.log({ fixtureDataPath });
  assert(!shell.exec(`${path.join(__dirname, '../../', 'src/index.js')} `).code);
  const currentBranch = getCurrentBranch();
  assert(currentBranch === 'master', `getCurrentBranch() = '${currentBranch}'`, `${currentBranch}`);
  const originalPackageJson = require(path.join(__dirname, '../', `assets/${assetRelativePath}/package.json`));
  const testPackageJson = require(path.join(fixtureDataPath, '/package.json'));
  return { originalPackageJson, testPackageJson };
}
exports.boilerplate = boilerplate;
