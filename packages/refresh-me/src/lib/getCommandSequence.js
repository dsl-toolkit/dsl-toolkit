const getCurrentBranch = require('./get-current-branch');

const getCommandSequence = (type = 'javascript') => {
  if (type === 'javascript') {
    return (relativePath, name, dependencyName, actualVersion, latestVersion, testBranch) => {
      const currentBranch = getCurrentBranch();
      const modParams = {
        // actualVersion,
        latestVersion, testBranch
      };
      // Sometimes it puts a space after the version number in the name of the test branch.
      Object.keys(modParams).forEach(tagName => {
        modParams[tagName] = modParams[tagName].replace(/\s/g, '')
      })

      return [
        `git checkout -b ${testBranch}`,
        `npm install ${dependencyName}@${modParams.latestVersion}`,
        'npm test',
        'git add package.json ',
        `git commit --no-verify -m "Updated package ${name} dependency to: ${dependencyName}@${latestVersion}."`,

        // `at path:${!relativePath ? './' : relativePath}`,
        `git checkout ${currentBranch}`,
        `git merge ${modParams.testBranch}  --no-verify`,
        `git branch -D ${modParams.testBranch}`]}}}
exports.getCommandSequence = getCommandSequence
