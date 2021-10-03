<!--- destination qa rewrite begin -->
### QA monorepo
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![CircleCI](https://circleci.com/gh/dsl-toolkit/dsl-toolkit/tree/master.svg?style=svg)](https://circleci.com/gh/dsl-toolkit/dsl-toolkit/tree/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/0fbd6b842ef4ad099067/maintainability)](https://codeclimate.com/github/dsl-toolkit/dsl-framework/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/0fbd6b842ef4ad099067/test_coverage)](https://codeclimate.com/github/dsl-toolkit/dsl-framework/test_coverage)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit?ref=badge_shield)[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
<!--- destination qa rewrite end -->


# Installation
```bash
npm install parenting
```
# Motivation
Getting parent and children shall be as easy drinking water (yes there are people hate drinking water).

## Early release

The current API will work as is but will be extended soon. Soon the parent and children tags will be redefinable, and optional.

## Examples
For now the current tests will do it:

```javascript 1.8
const {expect} = require('chai')
const partenting = require('../../src')

describe('Basic Test Suite', function () {
  exampleObject = {
    a:{
      b:{
        c:1,
        c1:2,
        c3:{
          deep:{
            deeper:{
              whatCouldGoWrong: 1
            }
          }
        },
        c4:4
      },
      d:{
        e:2
      }
    },
    f: 'g',
    array:[
      {a:{b:'c'}}
    ]
  }

  it('checking default results', function () {
    const parented = partenting(exampleObject)()
    expect(parented.a.b.c3.parent()).to.deep.equal(parented.a.b)
    expect(parented.a.parent()).to.deep.equal(parented)
    expect(parented.a.children()[0].parent()).to.deep.equal(parented)
  })
})

```
