<!--- destination qa rewrite begin -->
### QA dsl-toolkit
[![CI](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml/badge.svg)](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/a0e903d579b8ebebaf18/maintainability)](https://codeclimate.com/github/dsl-toolkit/dsl-toolkit/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a0e903d579b8ebebaf18/test_coverage)](https://codeclimate.com/github/dsl-toolkit/dsl-toolkit/test_coverage)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit?ref=badge_shield)
<!--- destination qa rewrite end -->

# Cowlog

Cowlog is the product of the vidaxl.com engineering efforts. Helps you to debug
your backend javascript code with less cognitive effort. It is a library that
helps you identify your debug message quickly on the **console output**.
Having it's own
[domain-specific language](https://en.wikipedia.org/wiki/Domain-specific_language "From Wikipedia, the free encyclopedia")
regarding the logging procedures, it's behaviour can be altered
through the use
**[of them](https://github.com/311ecode/dsl-toolkit/blob/master/packages/cowlog/documentation/logging_functionality.md).**
The project supports at the moment only the **NodeJs environment**.

We want cowlog to be usable in any circumstances without problems therefore we
have close **100% code coverage**, but at least 90%.

## Motivation

- Server-side applications tend to pollute the console still sometimes you want
to use console.log, and not solely use the amazing debug mode
[--inspect](https://nodejs.org/en/docs/inspector/)
of the NodeJs.

- CowLog can help you refactor your code faster. 
Our aim is that the code would run on most node.js environment now we support node >= 7.6.4.

np## Installation
```bash
npm install cowlog --save-dev
```

## Usage
`require('cowlog)()`

This will reigister the global variable `l` this is a function that you an chain to i's DSL functions
so the mostbasic usage is 

`l('your', 'stuffs')()`
<!--- example begin -->
### Chances are high, "that's the way you like it..."
You will see all information with cowlog, no need to have
specially trained eye for development log messages, or particular identifiable
strings, before and after you want to look at.

- **session log**: Every you call cowlog, the results appear in a
separate file.

- **called from**: It is the exact place where you placed cowlog, so you can
remove it with ease, after you have inspected the variables in the
runtime.

The "stack trace" will help you, it sticks with cowlog.

### Basic logging (read further there are much more coolness)

The output looks like this:

<!--- example begin -->
``` 
 ____________________________________________________________________________________________________
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

If you don't have a global variable registered to l (cowlog.log) than cowlog will register them, so you can reach it from anywhere.
I know it is against all good practice, but don't forget to remove it after you
finished your development session.

### Cowlog has its own DSL

#### `l('your stuffs').die()`
Joe is dead here.

#### `l('your stuffs').once()`
Just once please! [lodash#once](https://lodash.com/docs/4.17.10#once)

#### `l('your stuffs').throttle(2000)()`
Just like in the [lodash#throttle](https://lodash.com/docs/4.17.10#throttle) documentation

#### `l('your stuffs').debounce(2000)()`
Just like in the [lodashe#debounce](https://lodash.com/docs/4.17.10#debounce) documentation

#### `l('your stuffs').lasts()`
Collects these logs and displays if the application exits.

#### `l('your stuffs').last()`
Pretty much like the previous, it makes sure only this last call will be shown at the end.

#### `l('your stuffs').mute()`
Mutes the output. This can be convinient in some cases.

#### `l({a:'1,b:1}).keys()`
Will print only the keys for object type aruments. here ["a", "b"] 

#### `var test = l('a', 1).return()`
Here the `test` variable's value will e `1` so it returns the last variale's value.

### l('a', 1).lol()
The rainbowmabic of lolcat is activated

### DSL chaining
For instance typing 

`l('your stuffs').once.throttle(2000)()` 

is legit.
Once it prints the output other than this it throttles it as well.

##### `const test = l('a', 1).return.mute()`
Will do the same taht the upper one, but no output, can be useful for debugging.

### Remarks
In the future, we will
add a production feature to the software, but that needs
some pressure from the community, and meanwhile, we have
more meaningful things to implement.

<!--- source part of cowlog begin -->
This document is part of the [Cowlog](https://github.com/311ecode/dsl-toolkit) project.
<!--- source part of cowlog end -->
