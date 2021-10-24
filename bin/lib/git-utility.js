const {join} = require('path')
const arrayDsl = require('array-dsl')
module.exports = (directory) => {
  const s = require('shelljs')
  s.cd(directory);

  const gitUtilFunctionalities = {
    sexec: (command, config = {silent:false}) => s.exec(command, {silent:false, ...config}),
    removeEmptyLines: (output) => output.split('\n').filter(e=>e!=='').join(' '),
    exec: (command) => gitUtilFunctionalities.removeEmptyLines(gitUtilFunctionalities.sexec(command).stdout),
    stash: () => gitUtilFunctionalities.exec('git stash'),
    //git symbolic-ref HEAD | sed 's!refs\/heads\/!!'
    getCurrentBranch: () => gitUtilFunctionalities.exec('git branch  | grep "*" | awk \'{print $2}\''),
    getAllBranches: () => gitUtilFunctionalities.exec('git branch -a').split(' ').filter(e=>e!=='*'&&e!==''&&e!=='->'),
    getAllBranchesWithoutRemotes: () => arrayDsl(gitUtilFunctionalities.exec('git branch -a').split(' ')
    .filter(e=>e!=='*'&&e!==''&&e!=='->').map(e=>e.startsWith('remotes/') ? e.split('/')
    .slice(2).join('/') : e)).unique()
    .filter(e=>!e.startsWith('circleci') && !e.startsWith('greenkeeper')&&!e.startsWith('origin')&&e!== 'HEAD'),
    getAllRemoteBranches: () => gitUtilFunctionalities.getAllBranches().filter(e=>e.startsWith('remotes/')),
    getAllRemotes: () => gitUtilFunctionalities.getAllRemoteBranches().map(e=>e.split('/')[1])
    .filter((v, i, a) => a.indexOf(v) === i),
    checkoutBranch: name => gitUtilFunctionalities.sexec(`git checkout ${name}`),
    filterBranch:(directory, branch) => gitUtilFunctionalities.sexec(`git filter-branch --force --prune-empty --subdirectory-filter ${directory}/ ${branch}`, {silent:false}),
    createBranch: name => gitUtilFunctionalities.exec(`git checkout -b ${name}`),
    getDirectory: () => directory,
    addRemote: packageName => gitUtilFunctionalities.sexec(`git remote add ${packageName} git@github.com:dsl-toolkit/${packageName}.git`),
    getPackageInfo: (currentBranch, packageDirectory) => {
      const packageInfo = require(join(__dirname, '../..', packageDirectory, 'package.json'))
      const packageName = packageInfo.name
      const newBranch = `${currentBranch}_${packageName}`

      return {currentBranch, packageName, packageDirectory, newBranch, packageInfo}
    },
    subDirectoryToSeparateBranch: (currentBranch, packageDirecroty) => {
      const packageInfo = gitUtilFunctionalities.getPackageInfo(currentBranch, packageDirecroty)
      const {newBranch} = packageInfo
      gitUtilFunctionalities.createBranch(newBranch)
      gitUtilFunctionalities.filterBranch(packageDirecroty, newBranch)

      return packageInfo
    },
    pushSeparatedBranch: (currentBranch, packageDirectory, token) => {
      const packageInfo = gitUtilFunctionalities.getPackageInfo(currentBranch, packageDirectory)
      const {packageName, newBranch} = packageInfo

      console.log(currentBranch, `git push -f ${packageName} ${newBranch}:${currentBranch}`)

      gitUtilFunctionalities.addRemote(packageName)
      const gitPush = `git push -f -q https://${token}@github.com/dsl-toolkit/${packageName} ${newBranch}:${currentBranch}`
      console.log({gitPush})
      gitUtilFunctionalities.sexec(gitPush)
      gitUtilFunctionalities.checkoutBranch(currentBranch)

      return packageInfo
    },

  }

  return gitUtilFunctionalities
}


