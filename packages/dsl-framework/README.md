<!--- destination qa rewrite begin -->
### QA monorepo
[![CI](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml/badge.svg)](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/a0e903d579b8ebebaf18/maintainability)](https://codeclimate.com/github/dsl-toolkit/dsl-toolkit/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a0e903d579b8ebebaf18/test_coverage)](https://codeclimate.com/github/dsl-toolkit/dsl-toolkit/test_coverage)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit?ref=badge_shield)
<!--- destination qa rewrite end -->

# Installation
```bash
npm install dsl-framework --save
```

# Hello world

```javascript
const { dslFramework } = require('dsl-framework')
const defaultFactory = dslFramework()

console.log(
  defaultFactory()
  .Hello.world()
  .data.returnArrayChunks.flat().join(' ')) // => Hello world
```
This is the easies use of the dsl framework. `data.returnArrayChunks` represents a matrix of data, in other wods an arrays in an array, in other works and abstract syntax tree (AST). with the current exaple you can see it as:
```javascript
[['Hello'],['world']]
```
The next exaple:
```javascript
console.log(
  defaultFactory()('Hello')('world')()
  .data.returnArrayChunks.flat().join(' ')) // => Hello world
```
gives the exact same output, the first example. It is just a different way to inject data into the AST. Your choice is how you want to use it.

Most of the times you will use the framework with the callback function like this:
```javascript
defaultFactory((e, data) => {
  console.log(data.data.returnArrayChunks.flat().join(' '))
}).Hello.world() // => Hello world
```

Most of the times you might want to create a function/module/export or variable like this:

```javascript
const sayIt = defaultFactory((e, data) => {
  console.log(data.data.returnArrayChunks.flat().join(' '))
})

sayIt.Hello.world() // => Hello world
```
So you can play with it like below:
```javascript
sayIt.Hello.world() // => Hello world
sayIt.Hello.world('!')() // => Hello world !
sayIt.Hello.world['!']() // => Hello world !
sayIt('Hello').world['!']() // => Hello world !
```
Let's create a `harvester` that returns the raw data:

```javascript
const harvester = defaultFactory((e, data) => {
  return (data.data.returnArrayChunks)
})
```
With the `harvester` we can show the date that comes back:
```javascript
console.log(
  harvester.Hello.world()
  ) // => [['Hello'],['world']]
  
console.log(
  harvester.Hello.world('!')()
  ) // => [['Hello'],['world', '!']]
```
If you see the last example above, this is the first time we have given a parameter to a function we call. you can see how it escalates in the data, the excamation sign is arrived next to the world as the second item in its array. The rest of this segment of examples are easy, so I will not explain them.
```javascript  
console.log(
  harvester.Hello.world['!']()
  ) // => [['Hello'],['world'],['!']]
  
console.log(
  harvester('Hello').world['!']()
  ) // => [['Hello'],['world'],['!']]
  
```

```javascript
const processor = defaultFactory((e, data) => {
  return (data.data.returnArrayChunks.flat().join(' '))
})

console.log(processor('Hello').world(), 'oh yeah'); // => Hello world oh yeah

(async () => {
  const result = await processor.hello.world.form.this.promise.p()
  console.log(result + '.', '"p" is sPecial!, I can say in other world, preserved, pointing to a promise factory')
})() // => hello world form this promise. "p" is sPecial!, I can say in other world, preserved, pointing to a promise factory

const processorReturndPromise = defaultFactory((e, data) => {
  return async () => (data.data.returnArrayChunks.flat().join(' '))
});
(async () => {
  const result = await processorReturndPromise.Hello.You.too('!!!')()()
  console.log(result, 'I hope got you!')
})() // => Hello You too !!! I hope got you!

const processorChecksHello = defaultFactory((e, data) => {
  if (data.command.has('Hello')) {
    return (data.data.returnArrayChunks.flat().join(' '))
  }
  return 'The message does not contain the word Hello'
})

console.log(processorChecksHello.Hi.World()) // => The message does not contain the word Hello
console.log(processorChecksHello.Hello.World('!', 'Hello again')('and').again()) // => Hello World ! Hello again and again

```
The rest of the motivation is kept here for a while because of clarity, and for historical reasons. I don't consider it complete or good enough for grasping how the framework works. Still coul containg some inspiration for someone. I plan continue and polish the hello world examples further to show and cover the abilities of the tool. if you want to see how it really works see the projects in the monorepo of this project, and see the tests within this project.
# Motivation
I wanted to have an easy to use function configuring method.
so that I can develop domain-specific languages easily and keep its application close to the code,
Moreover, use it for different kind of tasks. I started
educating myself to LISP and tying to transpiring back to my daily work life some practical concept,
using data as code and creating small domain specific languages, this is an attempt for that.

I wrote **[dsl-toolkit](https://github.com/311ecode/dsl-toolkit/tree/master/packages/dsl-toolkit)** and the central point of the application
is the usage of its specific small DSL trough chained function calls. The code that creates this possibility was
complex and precise, really too hard to understand, maintain develop and refactor; entirely the worst kind. The idea
was if we extract this necessarily complex monster into and external reusable library.

# Usage
I present the usage of the library with the example below; there are many ways to use it, let's start with the most
practically applicable one.

## Example sync basic

In this example, you can see the library if you do callback needs to have two of them the first receives the error code
that is 0 at the moment only, in the future it will change and the second that is all the parameters you chained trough.

```javascript 1.8
const unlimitedCurry = require('dsl-framework')
const fn = unlimitedCurry(
  (e, parameters) => {
    //will not return anything, will be execited anyways
  },
    parameters=>`${parameters.data.returnArray[0]}${parameters.data.returnArray[1]}${parameters.data.returnArray[2]}`
  )
const returnValue = await fn('a')('b')('c')()
console.log(returnValue)
expect(returnValue).to.be.equal('abc')
```

## Example async basic
As you see this example looks just a bit different, but his small difference not calling the empty parenthesis makes the first callbacks execution async as well.
Technically it is a setTimeout(()=>{}, 0) you can google it, that was enlightening for me, maybe you would enjoy that doing so. Later in this documentation, for now, please consult the source.
Maybe **[this](https://www.youtube.com/watch?v=8aGhZQkoFbQ) video** will help as well.

```javascript 1.8
const unlimitedCurry = require('dsl-framework')

const fn = unlimitedCurry(
  (e, parameters) => {
    return parameters.data.returnArray[0]
      + parameters.data.returnArray[1]
      + parameters.data.returnArray[2]
  })
const returnValue = await fn('a')('b')('c').p().then(data=>data)
console.log(returnValue)
expect(returnValue).to.be.equal('abc')

```
If you don't use the promise the `p()` function, as it is a detached execution you will not be able to get back anything.

## split call example

This few lines also comes from the test suite, but you will get how you can use it in real life.
```javascript 1.8
const getMyCurry = () => unlimitedCurry(
  (e, parameters) => {
  },
  parameters=>parameters.data.returnArray[0]
    + parameters.data.returnArray[1]
    + parameters.data.returnArray[2]
)
let fn = getMyCurry()
fn('a')
let returnValue = fn('b', 'c')()
expect(returnValue).to.be.equal('abc')

fn = getMyCurry()
fn('a', 'b')
returnValue =  fn('c')()
expect(returnValue).to.be.equal('abc')

fn = getMyCurry()
fn('a')
fn('b')
returnValue = fn('c')()
expect(returnValue).to.be.equal('abc')
```