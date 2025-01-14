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

# Introduction to dsl-framework
## Hello world

Imagine you're constructing a sentence, word by word, or drawing a picture, stroke by stroke. That's similar to how dsl-framework works. Each command you chain adds to or modifies a piece of structured data, which we call returnArrayChunks. It's like a command tree where each node represents a command or its argument.

```javascript
const { dslFramework } = require('dsl-framework');
const defaultFactory = dslFramework();

const result = defaultFactory().Hello.world();
console.log(result.data.returnArrayChunks); // [['Hello'], ['world']]
```

Adding Parameters to DSL Chain Functions and Dynamic Command Creation
A key feature of dsl-framework is its ability to accept parameters directly within the chain of commands. This flexibility allows you to customize commands or add additional data points as needed, enhancing the expressiveness of your DSL. Moreover, you can also introduce new commands dynamically, without needing to predefine them in your code. Here's an example where we both add parameters to functions in the chain and create a new command on-the-fly:


```javascript

const { dslFramework } = require('dsl-framework');
const defaultFactory = dslFramework();

// Adding a new command 'greet' dynamically
defaultFactory().greet('world', '!').with('enthusiasm');

console.log(defaultFactory().greet('world', '!').with('enthusiasm').data.returnArrayChunks);
// [['greet', 'world', '!'], ['with', 'enthusiasm']]

```

# Working with Data
While you can directly interact with returnArrayChunks for simple tasks, 
dsl-framework provides utilities to help you process, filter, and analyze the data 
without having to manually sift through raw arrays. Here’s why:

* Abstraction: Direct manipulation of the raw array can be error-prone and less intuitive, particularly for complex data structures. The framework offers methods that abstract away these complexities.
* Ease of Use: These utility functions make it easier to perform common operations like filtering, querying, or extracting data based on certain conditions.
* Consistency: Using these methods ensures consistency in how data is handled across your application, making your code more maintainable.

## Examples of Data Processing:
### Accessing and Flattening Data:

```javascript
const result = defaultFactory().Hello.world().data;
console.log(result.returnArray()); // ['Hello', 'world']
```

Filtering Commands:

```javascript
const commandData = defaultFactory().Hello.world().add('more')().data;
const hasHello = commandData.command.has('Hello'); // true
const onlyHelloCommands = commandData.command.get('Hello'); // [['Hello']]
```

Querying Complex Structures:

```javascript
const complexData = defaultFactory()
  .Task.create('Code review', { due: '2023-10-05' })
  .Task.create('Deploy', { due: '2023-10-07' })()
  .data;

// Function to check if 'Task' followed by whatever command exists in the command sequence
const processTaskCreation = (data) => {
  let tasks = [];

  for (let i = 0; i < data.returnArrayChunks.length - 1; i++) {
    if (data.returnArrayChunks[i][0].toLowerCase() === 'task') {
      tasks.push(data.returnArrayChunks[i + 1]);
    }
  }

  return tasks;
};

const createdTasks = processTaskCreation(complexData);
console.log('Created Tasks:', createdTasks); 
const complexData = defaultFactory()
  .Task.create('Code review', { due: '2023-10-05' })
  .Task.create('Deploy', { due: '2023-10-07' })()
  .data;


const createdTasks = processTaskCreation(complexData);
console.log('Created Tasks:', createdTasks); 
// The data now looks like: 
//   [
//     ['create', 'Code review', { due: '2023-10-05' }], 
//     ['create', 'Deploy', { due: '2023-10-07' }]
//   ]
```

### Embedding Processing in Callbacks

Using callbacks for data processing:

Allows for immediate execution post-DSL chain.
Keeps DSL chain clean, processing logic encapsulated.
Can handle errors inline with data generation.

Here's how to use callbacks:


```javascript
const { dslFramework } = require('dsl-framework');
const defaultFactory = dslFramework();

// Function to check if 'Task' followed by whatever command exists in the command sequence
const processTaskCreation = (data) => {
  let tasks = [];

  for (let i = 0; i < data.returnArrayChunks.length - 1; i++) {
    if (data.returnArrayChunks[i][0].toLowerCase() === 'task') {
      tasks.push(data.returnArrayChunks[i + 1]);
    }
  }

  return tasks;
};

// Using callbacks to process data directly within the DSL chain
defaultFactory((e, data) => {
  const createdTasks = processTaskCreation(data);
  console.log('Created Tasks:', createdTasks); 
  // The data now looks like: 
  //   [
  //     ['create', 'Code review', { due: '2023-10-05' }], 
  //     ['create', 'Deploy', { due: '2023-10-07' }]
  //   ]
})
.Task.create('Code review', { due: '2023-10-05' })
.Task.create('Deploy', { due: '2023-10-07' })();

```

These examples showcase how you can work with the data provided by the DSL without directly manipulating the returnArrayChunks. This approach leverages the power of the framework to make data processing more intuitive and aligned with your domain logic.


