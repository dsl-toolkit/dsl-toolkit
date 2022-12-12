const { dslFramework } = require('../../src')
const defaultFactory = dslFramework()

console.log(defaultFactory().Hello.world().data.returnArrayChunks.flat().join(' ')) // => Hello world

console.log(defaultFactory()('Hello')('world')().data.returnArrayChunks.flat().join(' ')) // => Hello world

defaultFactory((e, data) => {
  console.log(data.data.returnArrayChunks.flat().join(' '))
}).Hello.world() // => Hello world

const printer = defaultFactory((e, data) => {
  console.log(data.data.returnArrayChunks.flat().join(' '))
})

printer.Hello.world() // => Hello world

printer.Hello.world('!')() // => Hello world !

printer.Hello.world['!']() // => Hello world !

printer('Hello').world['!']() // => Hello world !

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
