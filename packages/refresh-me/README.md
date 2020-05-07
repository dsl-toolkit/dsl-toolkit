<!--- destination qa rewrite begin -->
### QA monorepo
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![CircleCI](https://circleci.com/gh/dsl-toolkit/dsl-toolkit/tree/master.svg?style=svg)](https://circleci.com/gh/dsl-toolkit/dsl-toolkit/tree/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/a0e903d579b8ebebaf18/maintainability)](https://codeclimate.com/github/dsl-toolkit/dsl-toolkit/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a0e903d579b8ebebaf18/test_coverage)](https://codeclimate.com/github/dsl-toolkit/dsl-toolkit/test_coverage)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit?ref=badge_shield)[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
<!--- destination qa rewrite end -->

# Installation
```bash
npm install refresh-me
```
# Motivation
Greenkeeper is not cheap for corporates, I wanted a commandline tool that updates the packages to the latest version.

# Philosophy
The commandline tool does process any arguments works as is. If it detects new version for any of the packages your project uses. 
It will create a branch for each updated dependency, install the newest version of it and merges back the changes to the master if the 
test (`npm test`) runs succesfully. If not, it will keep the head on the branch that's nave will reflect what update went wrong.

# Usage
Depending on your taste you can install this package locally so you will use it form the `node_modules/.bin/refresh-me` or just `refresh-me`. 

# Limitations
Currently supports only npm only, works locally only. Start it form your master branch.
