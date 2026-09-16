<!--- destination qa rewrite begin -->
### QA dsl-toolkit
[![CI](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml/badge.svg)](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml)
<!--- destination qa rewrite end -->
<!--- coverage begin -->
![coverage: 100.0% lines](https://dsl-toolkit.github.io/dsl-toolkit/dsl-framework.svg)
<!--- coverage end -->

# dsl-framework

**Labeled, order-free arguments and inspectable command sequences for JavaScript.**

Describe a program by chaining commands, then interpret it once by calling the chain. Each command's name and arguments are recorded as data, so validation and extraction happen in one place instead of being spread across a ten-parameter function signature.

Zero dependencies. Runs in Node and the browser. Commands are created dynamically — there is no schema, grammar file, or code generation step.

## Why

A function with ten parameters is hard to call correctly and hard to change:

```js
function createUser(firstName, lastName, email, age, address, city, country, role, permissions, preferences) {
  // ...
}

createUser(
  'John', 'Doe', 'john@example.com', 30,
  undefined, undefined, 'USA', 'admin',
  ['read', 'write'], { theme: 'dark' }
)
```

Everything is positional. Optional arguments force `undefined` holes. The call site never says what any value is. Adding or reordering a parameter is a breaking change, and validation lives somewhere else entirely.

dsl-framework replaces that with a chain where every value is labeled by the command that carries it, and hands you the finished call as plain data you can validate and read by name:

```js
createUser
  .firstName('John')
  .lastName('Doe')
  .email('john@example.com')
  .age(30)
  .permissions('read', 'write')
  ()
```

Order does not matter, optional arguments are simply omitted, and the callback that receives the program can validate the whole sequence before doing anything.

## Install

```bash
npm install dsl-framework --save
```

Works with both module systems:

```js
// ESM
import dslFramework from 'dsl-framework'

// CommonJS
const dslFramework = require('dsl-framework')
```

## Quick start

```js
const dslFramework = require('dsl-framework')

// 1. Create a factory.
const dsl = dslFramework()

// 2. Define a language. The callback receives (error, program) and runs last.
const createUser = dsl((error, program) => {
  const { command, arguments: args } = program

  // Validate the sequence rather than a list of positional parameters.
  if (!command.hasAnd('firstName', 'lastName', 'email')) {
    throw new Error('firstName, lastName and email are required')
  }

  // Read the arguments back by command name, in any order.
  const user = args.object(
    ['firstName', 'lastName', 'email', 'age', 'role', 'permissions'],
    ['firstArgument', 'firstArgument', 'firstArgument', 'firstArgument', 'firstArgument', 'allEntries']
  )

  return {
    ...user,
    role: user.role || 'user',
    permissions: user.permissions.flat()
  }
})

// 3. Describe a user, then run the callback by calling the chain with no arguments.
const user = createUser
  .firstName('John')
  .lastName('Doe')
  .email('john@example.com')
  .age(30)
  .permissions('read', 'write')
  ()

console.log(user)
```

```
{
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  age: 30,
  role: 'user',
  permissions: [ 'read', 'write' ]
}
```

Two details worth noticing: `permissions` uses `allEntries`, so `('read', 'write')` comes back as an array; `role` was never given, so it falls back to `false` and `||` turns that into `'user'`.

## Mental model

There are only three moving parts.

```
  dslFramework()          dsl(callback)              chain.a.b('c')()
  ───────────────         ──────────────             ─────────────────
  a factory               a language instance        describe, then run
                          (grammar + callback)       |
                                                     |
  every chained command appends one chunk:  [ 'b', 'c' ]
                                                     |
  the terminal () hands the whole program to the callback
```

A chain builds an ordered list of chunks. Each chunk is `[commandName, ...arguments]`. Property access names a command; calling it supplies that command's arguments.

```js
const dsl = dslFramework()

const program = dsl()
  .firstName('John')
  .lastName('Doe')
  .email('john@example.com')
  ()

console.log(program.data.returnArrayChunks)
// [ [ 'firstName', 'John' ], [ 'lastName', 'Doe' ], [ 'email', 'john@example.com' ] ]

console.log(program.data.returnArray())
// [ 'firstName', 'John', 'lastName', 'Doe', 'email', 'john@example.com' ]
```

Calling the chain with **no arguments** is the terminal step. What it returns depends on whether the language instance was given a callback:

| Instance | Terminal `()` returns |
| --- | --- |
| `dsl(callback)` | whatever `callback` returns (or a `Promise` if the callback is `async`) |
| `dsl()` (no callback) | the program object itself |

Nothing in the chain executes your domain logic; commands only accumulate. All behavior lives in the callback.

## API reference

### Creating a language

```js
const dsl = dslFramework()      // factory
const users = dsl(callback)     // independent language instance
const orders = dsl(callback)    // a separate, independent instance
```

Every call to the factory creates an isolated instance with its own accumulated state. Instances do not share data.

The callback has the signature `(error, program)`. The `error` argument is always `0` — see [Limitations](#limitations-and-non-goals).

### Chaining commands

```js
users.firstName('John')             // command with one argument
users.permissions('read', 'write')  // command with several arguments
users.expired                       // command with no arguments
users.a.b.c()                       // several no-argument commands
users('admin')                      // a bare, unnamed chunk
```

Any property name is a valid command. There is no predefined command list, so commands can be introduced on the fly and names are matched as plain strings.

### The program object

The callback receives, and a callback-less terminal returns, a program object with these members:

| Member | Description |
| --- | --- |
| `program.data.returnArrayChunks` | The chunks: `[['a'], ['b', 'c']]` |
| `program.data.returnArray()` | All chunks flattened into one array |
| `program.data.repeate.me(instance)` | Replays this program into another instance |
| `program.command` | Query API over the chunks (below) |
| `program.arguments(name, mode, default)` | Reads one command's arguments |
| `program.arguments.object(names, modes?, defaults?)` | Reads several commands into an object |
| `program.commandSequence()` | Generator of `{ command, arguments }`, in order |
| `program.getFrom` | Low-level container access |

### Querying commands

Given:

```js
const program = dsl().a.b('c').d('e', 'f').g('h', 'i').g('j', 'k')()
```

| Call | Result |
| --- | --- |
| `program.command.has('g')` | `true` |
| `program.command.has('nope')` | `false` |
| `program.command.get('g')` | `[['g', 'h', 'i'], ['g', 'j', 'k']]` |
| `program.command.getArguments('b')` | `[['c']]` — arguments only |
| `program.command.has.more('a', 'nope')` | `[true, false]` |
| `program.command.has.and('a', 'g')` | `true` — all present |
| `program.command.has.or('nope', 'g')` | `true` — at least one present |
| `program.command.has.xor('a', 'nope')` | `1` — truthy when some are present and some are not |
| `program.command.has.object('a', 'nope')` | `{ a: true, nope: false }` |
| `program.command.get.more('g')` | `[[['g', 'h', 'i'], ['g', 'j', 'k']]]` — one `get` per requested name |
| `program.command.get.object('g')` | `{ g: [['g', 'h', 'i'], ['g', 'j', 'k']] }` |

Aliases exist without the dots: `hasMore`, `hasAnd`, `hasOr`, `hasXor`, `hasObject`, `getMore`, `getObject`.

`has.and` and `has.or` return booleans. `has.xor` returns a number (the count of absent commands), which is truthy only when the commands are mixed — treat it as truthy/falsy rather than a strict boolean.

### Reading arguments

`arguments(name, mode, defaultValue)`. The mode decides what is extracted when a command appears more than once.

```js
const program = dsl().g('h', 'i').g('j', 'k')()
```

| Mode | Result |
| --- | --- |
| `'allEntries'` (default) | `[['h', 'i'], ['j', 'k']]` |
| `'firstEntry'` | `['h', 'i']` |
| `'lastEntry'` | `['j', 'k']` |
| `'firstArgument'` | `'h'` |
| `'lastArgument'` | `'j'` |
| `'boolean'` | `true` — presence only, the value is ignored |

If the command is absent, `defaultValue` is returned (default `false`).

`arguments` also accepts an array of names and returns an array of results, and `.object()` reads several commands into an object:

```js
program.arguments.object(
  ['g', 'missing'],
  ['lastEntry', 'firstArgument'],
  [false, 'fallback']
)
// { g: [ 'j', 'k' ], missing: 'fallback' }
```

### commandSequence

`commandSequence()` is a generator that yields every chunk in order, as `{ command, arguments }`. Use it for rules that depend on ordering or on how many times a command appears.

```js
;[...program.commandSequence()]
// [
//   { command: 'a', arguments: [] },
//   { command: 'b', arguments: [ 'c' ] },
//   { command: 'd', arguments: [ 'e', 'f' ] },
//   { command: 'g', arguments: [ 'h', 'i' ] },
//   { command: 'g', arguments: [ 'j', 'k' ] }
// ]
```

## Recipes

### Enforcing an order

```js
const migrate = dsl((error, program) => {
  const steps = [...program.commandSequence()]
  const created = steps.findIndex(step => step.command === 'createTable')
  const inserted = steps.findIndex(step => step.command === 'insert')

  if (created === -1 || inserted === -1 || created > inserted) {
    throw new Error('createTable must come before insert')
  }

  return steps.map(step => ({ step: step.command, args: step.arguments }))
})

migrate.createTable('users').insert('users', { id: 1 })()
// [
//   { step: 'createTable', args: [ 'users' ] },
//   { step: 'insert', args: [ 'users', { id: 1 } ] }
// ]
```

### Asynchronous work

An `async` callback makes the terminal call return a promise, so the chain can be awaited directly. Because the callback is the only place work happens, the chain itself stays cheap to build.

```js
const fetchUser = dsl(async (error, program) => {
  const id = program.arguments('id', 'firstArgument')
  const response = await fetch(`https://example.com/users/${id}`)
  return response.json()
})

const profile = await fetchUser.id(42)()
```

### Reusing a program as a template

`repeate.me` replays a finished program into a fresh instance, which you can then extend. This is how you build a base configuration and specialize it.

```js
const template = dsl((e, program) => program).from('users').where('active', true)()

const extended = template.data.repeate.me(dsl((e, program) => program))
  .orderBy('name')
  ()

extended.data.returnArrayChunks
// [ [ 'from', 'users' ], [ 'where', 'active', true ], [ 'orderBy', 'name' ] ]
```

The target instance may be reused to produce independent copies, and replays can themselves be replayed.

## Built on this engine

Three packages in this repo build their own languages on dsl-framework, in three different domains, with no engine changes:

| Package | Its command vocabulary | Reads the program back with |
| --- | --- | --- |
| [cowlog](https://github.com/dsl-toolkit/dsl-toolkit/tree/master/packages/cowlog) | Logging: `lol`, `mute`, `forget`, `die`, `keys`, `return`, … | `command.has`, `command.getArguments` |
| [demeter-di](https://github.com/dsl-toolkit/dsl-toolkit/tree/master/packages/demeter-di) | Dependency injection: `define`, `compose`, `create` | `arguments('compose', 'allEntries', [])` |
| [directory-fixture-provider](https://github.com/dsl-toolkit/dsl-toolkit/tree/master/packages/directory-fixture-provider) | Fixture builds: `permanent`, `noFileReads` | `command.has`, `command.getArguments`, `data.returnArray()` |

None of those command names exist in this package. That is the point: the vocabulary belongs to the consumer, and dsl-framework only carries the sequence until an interpreter folds it. demeter-di's bootstrap is one line:

```js
module.exports.containerFactoryFactory = () =>
  require('dsl-framework')()((e, program) => buildContainer(program))
```

### What the consumers reveal

Across all three, the API in real use is `command.has`, `command.getArguments`, `arguments(name, mode, default)`, `data.returnArray()` and `data.returnArrayChunks`. None of them uses `command.get`, `commandSequence()`, `get.more`, `arguments.object` or `repeate.me`, so the presence/argument queries are the load-bearing surface, while the ordered-validation and template-replay recipes elsewhere in this document are not yet proven by adoption.

Only cowlog uses the engine safely: it holds the factory and creates a fresh instance per program.

```js
const factory = require('dsl-framework').noPromoises()
// ...
const run = factory((e, program) => { /* ... */ })   // a fresh chain, every call
```

demeter-di exposes `containerFactory` (one shared chain) alongside `containerFactoryFactory()` (a fresh chain per build), and directory-fixture-provider exports one shared chain directly — so there an abandoned build leaks into the next one. Both are the single-use and mutable-cursor trade-off from [Limitations](#limitations-and-non-goals) turned into public API shape. The rule that avoids all of it: **hold the factory, not the chain.**

One note if you change the engine: cowlog and demeter-di call `noPromoises()`, which this package does not implement. (This package's own test spells it `noPromises`.) The catch-all Proxy returns a chain for any name, so both calls appear to work. Two published packages therefore rely on accidental Proxy behaviour, and tightening the Proxy — for example to reserve `Symbol` keys for a protocol — is a breaking change, not an internal cleanup.

## Limitations and non-goals

These are deliberate or known properties. Knowing them will save you time.

**Chains are mutable cursors, not values.** Property access appends a command immediately, so a "prefix" cannot be branched:

```js
const chain = dsl((e, program) => program).Alpha
const left = chain.Beta
const right = chain.Gamma

left === right            // true — same object
left().data.returnArrayChunks
// [ [ 'Alpha' ], [ 'Beta' ], [ 'Gamma' ] ] — all three landed in one chain
```

Even inspecting a property counts as using a command. Build a fresh chain from the factory for each program instead.

**A chain is single-use once it has a callback.** Terminating an instance that was created with a callback resets its accumulator, so a half-built chain cannot be resumed:

```js
const chain = dsl((e, program) => program).Step1('a')

chain.Step2('b')().data.returnArrayChunks
// [ [ 'Step1', 'a' ], [ 'Step2', 'b' ] ]

chain.Step3('c')().data.returnArrayChunks
// [ [ 'Step3', 'c' ] ] — the earlier chunks are gone
```

Create a new instance per program, or use `repeate.me` to start from a template.

**Any property is a command.** There is no way to tell a real command from a typo, and no autocomplete or static checking: `chain.usrName('x')` is a valid command named `usrName`. This also means protocol-style members cannot be detected on a chain.

**The error argument is always `0`.** The callback signature is `(error, program)` for familiarity, but no failure is ever reported through it, and there is no short-circuit. Throw from the callback to signal failure.

**The `has(name, onTrue, onFalse)` callback form returns `undefined`.** The callbacks are invoked, but the boolean result is not returned. Prefer the plain `has(name)` form.

**`noPromises()` and `noTriggerEndOfExecution()` are not implemented.** They are left-over names from earlier designs. Because every property looks callable, they appear to work but do nothing useful.

**It is not a parser or a grammar.** There is no text syntax and no automatic validation. The framework builds and inspects command sequences; enforcing structure is your callback's job.

**It is not a lawful monad.** It is Writer-shaped and free-monad-adjacent: chaining accumulates a description and the terminal call interprets it. But there is no `of`/`pure`, no `chain`/`flatMap` that takes a function of the accumulated value, no immutability, and no error channel — so the monad laws do not apply. If you need lawful `Option`/`Either`/`Task` or typed effects, use [Effect](https://github.com/Effect-TS/effect), [fp-ts](https://github.com/gcanti/fp-ts), or [neverthrow](https://github.com/supermacro/neverthrow) instead.

### When this is a good fit

- You have functions or builders with many optional, order-insensitive arguments.
- You want one place to validate a call before it executes.
- You want the call itself to be inspectable data (logging, replay, templating).
- You want negligible setup and no schema.

### When it is not

- You need compile-time guarantees about which commands exist.
- You need typed errors, cancellation, concurrency, or retries.
- You need to parse a textual DSL.

## TypeScript

The engine stays JavaScript. Command names are property accesses invented at the call site, so a compiler cannot know them — that is the design, not a gap to close. A declaration file ships with the package, and it describes the inspection types:

| Type | Describes |
| --- | --- |
| `Core` | the chain — an indexable, callable object |
| `DslState` | the program object the callback receives, and what a callback-less terminal returns |
| `ast` | the raw chunks, `any[][]` |
| `ReturnCallback` | the `(error, program)` callback signature |

One limit is worth stating plainly: the chain is an index signature, so `chain.usrName('x')` compiles and nothing is verified — no autocomplete, no typo detection, no argument checking. That is the ceiling for an engine that cannot know your vocabulary, and it is the reason to make *your* language the typed surface.

### Typing a language built on this engine

If you publish your own language over dsl-framework, do not try to make the engine's types enumerate your commands. Write a small facade `.d.ts` that names your vocabulary once, by hand, beside your source. `demeter-di` is the worked example — its public API is declared independently of the engine:

```ts
// demeter-di/src/index.d.ts
export interface ContainerFactory {
  define<T>(name: string, value: T): ContainerFactory
  compose<T>(name: string, service: (...args: any[]) => T, dependencies?: string[]): ContainerFactory
  create<T>(name: string, service: (...args: any[]) => T, dependencies?: string[]): ContainerFactory
  (): Container
}

export interface Container { [key: string]: any }

export interface ContainerFactoryFactory {
  (): ContainerFactory
}
```

With that, the chain this page describes and the typed API are the same shape:

```ts
containerFactoryFactory()
  .define('a', 1)
  .compose('b', (a: number) => a + 1, ['a'])
  .create('c', (b: number) => b * 2, ['b'])
  () // Container
```

Hints that fall out of that example:

- **One interface per chain, one method per command.** The facade *is* your command reference, and the only place the vocabulary exists in typed form.
- **Give the terminal its own signature.** The same interface carries `(): Container`, so `()` returns the folded result instead of another chain.
- **Type the factory as well as the chain.** `(): ContainerFactory` lets callers hold the factory — the safe pattern from [What the consumers reveal](#what-the-consumers-reveal) — and still get a typed chain.
- **Mark the safe entry point.** `containerFactoryFactory()` mints a fresh chain per call, while `containerFactory` is one shared, single-use chain — worth a comment in the facade so callers pick deliberately.
- **Ship it where resolvers look.** Keep `index.d.ts` beside `src/`, copy it into `dist/` in your build, and point `exports.types` — plus a top-level `types` for older resolvers — at the copy.
- **Compile your README's examples.** A hand-written facade drifts from the runtime, so keep the two in step with a `tsc --noEmit` over your examples — the same test that proves the facade is worth having.

The trade-off is the whole story: the engine stays schema-less JavaScript, you get real checking on your own vocabulary, and keeping the facade honest is one type test away.

## License

MIT © Imre Toth
