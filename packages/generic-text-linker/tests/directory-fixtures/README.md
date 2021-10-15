<!--- destination qa rewrite begin -->
### QA monorepo
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![CircleCI](https://circleci.com/gh/dsl-toolkit/dsl-toolkit/tree/master.svg?style=svg)](https://circleci.com/gh/dsl-toolkit/dsl-toolkit/tree/master)
[![Maintainability](https://api.codeclimate.com/v1/badges/a0e903d579b8ebebaf18/maintainability)](https://codeclimate.com/github/dsl-toolkit/dsl-toolkit/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a0e903d579b8ebebaf18/test_coverage)](https://codeclimate.com/github/dsl-toolkit/dsl-toolkit/test_coverage)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit?ref=badge_shield)[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
<!--- destination qa rewrite end -->

**Cowlog is not meant to be included in any production code, as it might create
performance issues.** 
However, the tool provides you the ability to see where it is used in your code,
so it can safely and easily removed. Cowlog let you see the **stacktrace** up until
where from this tool called. **All the log messages** per process are
**collected to a separate file**.
<!--- source chat rewrite begin -->
### Chat
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dsl-toolkit/Lobby)
<!--- source chat rewrite end -->
# Cowlog

Cowlog is made for developers by the vidaxl.com, helping them to debug their
application. It is a library that helps you identify your debug message quickly
on the console output. The project is meant to be used solely in a
**nodejs environment** as these days browsers provide really neat standard
toolsets for debugging your applications.

We want dsl-toolkit to be usable in any circumstances without problems therfore we
have 100% code coverage.


## Motivation

- Server side applications tend to pollute the console still sometimes you want
to use console.log, and not solely use the amazing debug mode
[--inspect](https://nodejs.org/en/docs/inspector/)
of the node.js.

- CowLog can help you refactoring your code faster. it runs on every node.js
environment >= 4.0.0

## Installation
```bash
npm install cowlog --save-dev
```

## Usage
For [more documentation click here](./documentation/logging_functionality.md)
this document will leverage the power of the logging capabilities of this
library.

<!--- example begin -->
``` ____________________________________________________________________________________________________
/                                                                                                    \
| 0 Beginnig -------                                                                                 |
| "abcz"                                                                                             |
| 0 End -------                                                                                      |
|                                                                                                    |
| 1 Beginnig -------                                                                                 |
| {                                                                                                  |
|   a: "A",                                                                                          |
|   "embeded.level1.level2.c": null,                                                                 |
|   "embeded.level1.level2.c2": "cc",                                                                |
|   "embeded.level1.level2.array.0.a": "a",                                                          |
|   "embeded.level1.level2.array.0.b": "b",                                                          |
|   "embeded.level1.level2.array.1": 1,                                                              |
|   "embeded.level1.level2.array.2": 1,                                                              |
|   "embeded.level1.level2.array.3": 3,                                                              |
|   "embeded.level1.level2.array.4": 7,                                                              |
|   "embeded.level1.level2.testObject2.c": 1,                                                        |
|   "embeded.level1.level2.testObject2.fn": function (a, b) {                                        |
|   return a + b                                                                                     |
| },                                                                                                 |
|   "embeded.level1.b": "1.5"                                                                        |
| }                                                                                                  |
| 1 End -------                                                                                      |
|                                                                                                    |
| 2 Beginnig -------                                                                                 |
| "This is a very long text. Indeed, it has to be long enough to be able to                          |
| present how awesomely it breaks the strings so that you will have a conven                         |
| ient reading experience through your logs."                                                        |
| 2 End -------                                                                                      |
|                                                                                                    |
| _-_-_-_-_-_-_-_-_-_-_-_                                                                            |
|                                                                                                    |
| called from:/home/it/dev/misc/dsl-toolkit/packages/dsl-toolkit/node_modules/bottlejs/dist/bottle.js:205:89   |
| stack trace:/tmp/dsl-toolkit/hashes/1a/aca79320ae42540da2a83d1d1c7b6d_stack-trace.log                   |
| session log:/tmp/dsl-toolkit/hashes/b6/cda5f0931f0f85054b0f59b0d5e749_session.log                       |
\ logged at:2018-06-20T20:54:17.782Z                                                                 /
 ----------------------------------------------------------------------------------------------------
    \
     \
                                   .::!!!!!!!:.
  .!!!!!:.                        .:!!!!!!!!!!!!
  ~~~~!!!!!!.                 .:!!!!!!!!!UWWW$$$ 
      :$$NWX!!:           .:!!!!!!XUWW$$$$$$$$$P 
      $$$$$##WX!:      .<!!!!UW$$$$"  $$$$$$$$# 
      $$$$$  $$$UX   :!!UW$$$$$$$$$   4$$$$$* 
      ^$$$B  $$$$\     $$$$$$$$$$$$   d$$R" 
        "*$bd$$$$      '*$$$$$$$$$$$o+#" 
             """"          """"""" 
```
<!--- example end -->

### Remarks

If you don't have a golbal variable registered to l (cowlog.log) or lf
(cowlog.lf) than cowlog will register them, so you can reach it from anywhere.
I know it is against all good practice, but don't forget cowlog is used in
developmnet time only.

<!--- source part of cowlog begin -->
This document is part of the [Cowlog](https://github.com/311ecode/dsl-toolkit) project.
<!--- source part of cowlog end -->
