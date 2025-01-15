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

# Asynchronous Operations in DSL Chains and returning values from callbacks

One of the key features of dsl-framework is the ability to handle asynchronous operations within the DSL chain. Below is an example demonstrating how you can integrate asynchronous callbacks into your DSL workflow. This method is particularly useful when your DSL commands need to wait for external resources or perform time-consuming operations. Importantly, this approach also allows for returning values from callback functions, providing a way to pass processed data back to the caller. Whether the callback is asynchronous or not, you can return any value, but in an async context, this is particularly useful for chaining further operations or making decisions based on the returned data.


```javascript
const { dslFramework } = require('dsl-framework');
const defaultFactory = dslFramework();

const myAsyncDsl = defaultFactory(async (error, data) => {
  if (error) {
    console.error('Error in DSL processing:', error);
    return; // Since we're not in a Promise context, we can't use resolve directly
  } else {
    // Simulate some async operation with data
    await new Promise(r => setTimeout(r, 1000)); // Wait for 1 second
    console.log('Data processed asynchronously');
    
    // Join the returnArray to get "Hello world" string
    const result = data.returnArray().join(' ');
    console.log('Returning:', result);
    return result; // Return the joined string
  }
});

// Await the DSL chain execution and log the returned string
const result = await myAsyncDsl.Hello.world();
console.log('Processed result:', result); // This will log "Hello world"
```

# Using Conditional Commands in DSL Chains
Building on the asynchronous operations, dsl-framework also allows for conditional command execution within the DSL chain. This example introduces the use of a hypothetical capital command to demonstrate how you can dynamically alter the output based on the presence of specific commands in the chain. Here, we'll check if the capital command exists to decide whether to return the result in all capital letters or not. This approach showcases the flexibility of DSLs in processing commands conditionally, based on the structure of the command sequence.


```javascript
const { dslFramework } = require('dsl-framework');
const defaultFactory = dslFramework();

const myAsyncDsl = defaultFactory(async (error, data) => {
  if (error) {
    console.error('Error in DSL processing:', error);
    return; // Since we're not in a Promise context, we can't use resolve directly
  } else {
    // Check if 'capital' command is in the chain
    if (data.command.has('capital')) {
      const result = data.returnArray().join(' ').toUpperCase();
      console.log('Returning in CAPITALS:', result);
      return result; // Return the capitalized string
    } else {
      console.log('No capital command found, returning nothing.');
      return ''; // Return an empty string or null if you prefer
    }
  }
});

// First scenario without 'capital'
const result1 = await myAsyncDsl.Hello.world();
console.log('Result without capital:', result1); // This will log an empty string or nothing

// Second scenario with 'capital'
const result2 = await myAsyncDsl.Hello.world.capital();
console.log('Result with capital:', result2); // This will log "HELLO WORLD"
```

## Different Kinds of Conditionals in DSL
The dsl-framework provides several methods for conditional checks within the DSL chain:

has: Checks if a specific command or property exists in the chain. 
hasMore: Similar to has, but can check for multiple commands at once, returning an array of booleans indicating the presence of each command.
hasAnd: Checks if all specified commands or properties are present in the chain. Useful for ensuring multiple conditions are met.
hasOr: Checks if at least one of the specified commands or properties is present in the chain. Helpful for scenarios where any one condition can trigger an action.
hasXor: Checks for the exclusive presence of one command or property from a list, ensuring only one exists, not multiple.

Example: Using hasAnd for Complex Conditions
Imagine you are creating a DSL for managing tasks in a project management tool. You might want to check if both a Task and a Deadline command have been used in sequence to confirm that a task has been properly scheduled:

```javascript
const { dslFramework } = require('dsl-framework');
const defaultFactory = dslFramework();

const taskManagerDsl = defaultFactory(async (error, data) => {
  if (error) {
    console.error('Error in task management DSL:', error);
    return;
  } else {
    if (data.command.hasAnd('Task', 'Deadline')) {
      const taskDetails = data.returnArray().join(' - ');
      console.log('Task scheduled with deadline:', taskDetails);
      return taskDetails; // Return details of the scheduled task
    } else {
      console.log('Task not fully scheduled, missing either Task or Deadline command.');
      return ''; // Indicate that the task wasn't fully scheduled
    }
  }
});

// Example usage
const result = await taskManagerDsl.Task('Write Report').Deadline('2023-12-31')();
console.log('Task management result:', result); // Logs the task details if both commands are present
```

In this use case, hasAnd ensures that both "Task" and "Deadline" commands are in the sequence before proceeding with task scheduling. This demonstrates how conditional logic can be used to validate complex command sequences or ensure that all necessary components for an operation are present.

# Command Sequences
In this example, we'll create different DSL chains to demonstrate how commands can be validated based on their presence, order, and parameters. We'll define four checks:

 - Check for 'hello' and 'world' presence
 - Check if there are only 'hello' and 'world'
 - Check if any command has more than one argument
 - Check if 'hello' comes before 'world'

```javascript
const { dslFramework } = require('dsl-framework');
const defaultFactory = dslFramework();

// Check if 'hello' and 'world' are present
const hasHelloAndWorld = (data) => data.command.hasAnd('hello', 'world');

// Check if only 'hello' and 'world' are used
const onlyHelloAndWorld = (data) => {
  const commands = data.commandSequence();
  return Array.from(commands).every(cmd => ['hello', 'world'].includes(cmd.command)) && 
         Array.from(commands).length === 2;
};

// Check if any command has more than one argument
const noCommandWithMultipleArgs = (data) => {
  for (const cmd of data.commandSequence()) {
    if (cmd.arguments.length > 1) return false;
  }
  return true;
};

// Check if 'hello' is before 'world'
const helloBeforeWorld = (data) => {
  const commands = Array.from(data.commandSequence());
  const helloIndex = commands.findIndex(cmd => cmd.command === 'hello');
  const worldIndex = commands.findIndex(cmd => cmd.command === 'world');
  return helloIndex !== -1 && worldIndex !== -1 && helloIndex < worldIndex;
};

const validateDSL = defaultFactory((error, data) => {
  if (error) {
    console.error('Error in DSL validation:', error);
    return;
  }

  if (!hasHelloAndWorld(data)) {
    console.log('Validation failed: Missing hello or world');
    return false;
  }
  if (!onlyHelloAndWorld(data)) {
    console.log('Validation failed: More than hello and world used');
    return false;
  }
  if (!noCommandWithMultipleArgs(data)) {
    console.log('Validation failed: Command with multiple arguments found');
    return false;
  }
  if (!helloBeforeWorld(data)) {
    console.log('Validation failed: World before Hello');
    return false;
  }

  console.log('Validation passed:', data.returnArray().join(' '));
  return true;
});

// Testing different scenarios
console.log('Scenario 1:');
await validateDSL.hello.world(); // Should pass

console.log('\nScenario 2:');
await validateDSL.hello.extra.world(); // Should fail due to extra command

console.log('\nScenario 3:');
await validateDSL.hello('arg1', 'arg2').world(); // Should fail due to multiple arguments

console.log('\nScenario 4:');
await validateDSL.world.hello()(); // Should fail due to order
```

In this example, we've created a DSL chain where we validate various aspects of the command sequence in the callback function. Each validation function checks for different criteria, demonstrating how you can chain commands and validate their sequence, presence, and parameters in a way that mirrors monadic behavior by maintaining state and context across transformations.


