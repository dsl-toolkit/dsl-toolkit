#!/usr/bin/env node
const token = process.env.GITHUB_TOKEN
const s = require('shelljs')
const op = require('object-path')
const { request } = require("@octokit/request")
const packages = require('./lib/get-packages')
const pacageNames = packages.map(e=>require(`../${e}/package.json`).name)
const reponsitories = packages.map(e=>require(`../${e}/package.json`).repository.url)
const diff = require('diff')
const authorization = `token ${token}`
const gitUtilityCreator = require('./lib/git-utility')
const dfp = require('directory-fixture-provider')
const {join} = require('path');
const getNewFixtureDirectory = (path) => {
  const fixtureDirectoryProvider = dfp(path).noFileReads()
  return fixtureDirectoryProvider.get('./').dir
}
const splitGitRepository = (gitUtility, currentBranch) => {
  packages.forEach((package) => {
    gitUtility.subDirectoryToSeparateBranch(currentBranch, package)
    gitUtility.pushSeparatedBranch(currentBranch, package, token)
  })
}

(async () => {
  const pwd = s.pwd()
  s.exec('npx lerna exec -- rm -rf ./node_modules', {silent:true}).stdout
  // s.exec('rm -rf ./node_modules', {silent:true}).stdout

  const baseFixtureDirectory = getNewFixtureDirectory(join(__dirname, '../'))
  s.exec(`rm -rf ${baseFixtureDirectory}/node_modules`, {silent:true}).stdout
  console.log({baseFixtureDirectory})
  const result = await request("GET /orgs/dsl-toolkit/repos", {
    headers: {
      authorization
    },
  });
  const existingRepos = result.data.map(e=>e.name).sort()
  const toCreate = diff.diffArrays(pacageNames.sort(), existingRepos.sort()).filter(e=>e.removed).map(e=>e.value).flat()
  console.log('aaa')
  toCreate.forEach( async (repository)=> {
    console.log({repository})
    await request("POST /orgs/dsl-toolkit/repos",
      {headers: {authorization}, name: repository})
  });
  console.log('bbb')

  const directory = getNewFixtureDirectory(baseFixtureDirectory);
  const gitUtility = gitUtilityCreator(directory)
  gitUtility.stash();

  console.log(
    gitUtility.getAllBranches(),
    gitUtility.getAllBranchesWithoutRemotes(),
  )

  if (process.argv.includes('--all-Local')){
    const allLocalBranches = gitUtility.getAllBranchesWithoutRemotes()
    allLocalBranches.filter(e=>e!==currentBranch).forEach(branch => {
      gitUtility.checkoutBranch(branch)
      splitGitRepository(gitUtility, branch)
    })
  } else {
    const currentBranch = gitUtility.getCurrentBranch()
    gitUtility.checkoutBranch(currentBranch)
    splitGitRepository(gitUtility, currentBranch)
  }

  console.log(`${pwd}`,directory)
})()
