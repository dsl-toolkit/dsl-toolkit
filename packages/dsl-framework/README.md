<!--- destination qa rewrite begin -->
### QA dsl-toolkit
[![CI](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml/badge.svg)](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml)
<!--- destination qa rewrite end -->
<!--- coverage begin -->
![coverage: 95.0% lines](https://dsl-toolkit.github.io/dsl-toolkit/dsl-framework.svg)
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

Types ship with the package. The chain is typed as an indexable callable (`Core`), so dynamic commands type-check but are not statically verified, and there is no autocomplete for command names. `DslState`, `ast`, and `ReturnCallback` describe the program object and the callback.

## License

MIT © Imre Toth
