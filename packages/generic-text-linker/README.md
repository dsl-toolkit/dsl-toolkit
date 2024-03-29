<!--- destination qa rewrite begin -->
### QA dsl-toolkit
[![CI](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml/badge.svg)](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/a0e903d579b8ebebaf18/maintainability)](https://codeclimate.com/github/dsl-toolkit/dsl-toolkit/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a0e903d579b8ebebaf18/test_coverage)](https://codeclimate.com/github/dsl-toolkit/dsl-toolkit/test_coverage)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit?ref=badge_shield)
<!--- destination qa rewrite end -->

# Installation
```bash
npm install generic-text-linker --save-dev
```

# Motivation
I wanted to have a small generic linker solution for text files so that I can avoid
copy and paste, and use it different kind of automation tasks.


# Usage
I present the usage of the library with the example below

## Example

markdownFile1:
```markdownFile

<!-- source begin-->
Your projects badges, or information you want to share in other files without
copy and paste on your own.
<!-- source end-->

```

markdownFile2:
```markdownFile

<!-- destination begin-->
<!-- destination end-->

```

code:
```javascript 1.6
const {linkerDir} = require('generic-text-linker')
const projectRoot = 'path to the directory where you want to use the linker.'

const source = {
  begin: '<!-- source begin-->',
  end: '<!-- source end-->'
}

const destination = {
  begin: '<!-- destination begin-->',
  end: '<!-- destination end-->'
}

let sourceData = linkerDir(projectRoot, sourceTags.begin, sourceTags.end)

const changedFilesArray = linkerDir(projectRoot, destination.begin, destination.end, sourceData)

```
This will change the content of markdownFile2

# More information
This library helps you find changes modifications between your working and original fixture files. More examples are coming for more information; please check the [tests](./tests/tests)
