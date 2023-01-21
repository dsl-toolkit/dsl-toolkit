<!--- destination qa rewrite begin -->
### QA dsl-toolkit
[![CI](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml/badge.svg)](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/a0e903d579b8ebebaf18/maintainability)](https://codeclimate.com/github/dsl-toolkit/dsl-toolkit/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a0e903d579b8ebebaf18/test_coverage)](https://codeclimate.com/github/dsl-toolkit/dsl-toolkit/test_coverage)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdsl-toolkit%2Fdsl-toolkit?ref=badge_shield)
<!--- destination qa rewrite end -->

# What does it help you with?
The "Law of Demeter" (LoD) is a principle in object-oriented programming that states that an object should only interact with its immediate neighbors, and not with objects that are further away. The LoD helps to promote loose coupling and maintainability in the code by limiting the number of connections between objects and reducing the impact of changes in one part of the code on other parts of the code.

Demeter-DI is a dependency injection container that follows the "Law of Demeter" principle. It allows developers to define and compose services and constants within a container, and manage their dependencies in a way that follows the LoD.

The define method of the container factory allows you to define constants and register them within the container. It helps to separate your constants from the services and manage them easily, making your code more readable and maintainable.

The compose and create methods of the container factory allow you to compose services and register them within the container. These methods take a service function as their second parameter and an array of dependencies as their third parameter. The service function can take any number of parameters that match the names of the dependencies specified in the container. This makes it easy to manage the dependencies of services and follow the LoD.

In summary, Demeter-DI is a simple and lightweight dependency injection container that helps developers follow the "Law of Demeter" principle by providing a clear and easy-to-use API for managing dependencies between objects. This makes the code more readable, maintainable, and less prone to bugs.


# let's get int to he compose

```js
compose(name: string, service: Function, dependencies: string[])
```

This method is used to compose a service and register it within the container. It allows you to create a small domain-specific language within the container, making your code more expressive and readable. The service is executed only once when it's referred for the first time, so once it is referred to, it does not get evaluated again.

The first parameter, "name", is a string that represents the name of the service.

The second parameter, "service", is a function that represents the service to be composed. This function can take any number of parameters, which should match the names of the dependencies specified in the "dependencies" array. Please note that the names of the parameters within the function reflect the services/constants within the container. Therefore, the third parameter, "dependencies" is an array of strings that represents the names of the dependencies that the service function depends on. However, if you don't use minification in your code, this parameter is not necessary as the function's parameter names will match the services/constants within the container.

It's very important to be aware of the closing function call as it tells the container factory that it can make the container.

This method returns the container object, which can be used to access the composed service.

Example:
```js
const container = containerFactory.compose('myService', (dependency1, dependency2) => dependency1 + dependency2, ['dependency1', 'dependency2'])();
console.log(container.myService); // adition of depencency1 and dependecy2
// if dependency1 evaluates to 1 and depencency2 evaluates to two this will print 3
// most likey you will define dependency1 and 2 with the define method of this factory,
// but it can be a service or a factory too.
```
## mentioning define in this example
developers can chain the "compose", "create", and "define" functions in order to create a more readable and expressive code.

Here is an example of how to chain these functions

```js
const container = containerFactory
  .define('one', 1)
  .compose('showOne', (one) => console.log(one))()

console.log(container.one) // Output: 1
container.showOne() // Output: 1
```
# let's get into the create

The "container factory" has a "create" method that looks identical to the "compose" method, but it will always be evaluated when it's called. This means that each time the service is accessed, a new instance of the service is created.

The "compose" method, on the other hand, is evaluated only once when it's first referred to, so any subsequent references to the service will return the same instance of the service. This is known as "lazy initialization," as the service is only initialized when it's needed, rather than when the container is created.

This difference in initialization can be useful in different situations. For example, if you're creating a service that is resource-intensive, you may want to use the "compose" method to ensure that the service is only created once and not recreated every time it's accessed. On the other hand, if you need to create a new instance of a service each time it's accessed, you can use the "create" method.

Here is an example of the difference between the "create" and "compose" methods:

```js

containerFactory.compose('singleton', () => {
  console.log('Creating singleton');
  return {};
})();

containerFactory.create('factory', () => {
  console.log('Creating factory');
  return {};
});
```

console.log(container.singleton === container.singleton); // Output: true
console.log(container.factory === container.factory); // Output: false

In this example, the "compose" method is used to create a service called "singleton", which logs a message when it's created. The "create" method is then used to create a service called "factory", which also logs a message when it's created.

When we access the "singleton" service for the first time, it logs "Creating singleton" and returns an object. When we access the "singleton" service again, it returns the same object that was created the first time, and it doesn't log any message. On the other hand, each time we access the "factory" service, it logs "Creating factory" and returns a new object.

This example illustrates how the "create" method creates a new instance of the service each time it's accessed the "compose" method will only create the service once, and any subsequent accesses will return the same instance of the service, which is known as "lazy initialization."

# more on define
The define method is used to define a constant and register it within the container. It allows you to manage your constants easily and separately from the services.

The first parameter, "name", is a string that represents the name of the constant.

The second parameter, "value", is the value of the constant. This value can be of any type, it can be a string, number, object, array, function, etc.

The define method returns the container object, which can be used to access the defined constant.

Here's an example of how to use the define method to define a constant PI with a value of 3.14:

```js
const container = containerFactory.define('PI', 3.14)();
console.log(container.PI); // Output: 3.14
```

You can also use the define method to define multiple constants at once by chaining multiple calls to define method.

```js
const container = containerFactory()
    .define('PI', 3.14)
    .define('E', 2.72)
    .define('GOLDEN_RATIO', 1.618)();
```

In this example, the define method is used to define the constants PI, E, and GOLDEN_RATIO and then the empty function call at the end is used to create the container.

Once the container is created, you can access the defined constants like so:


console.log(container.PI); // Output: 3.14
console.log(container.E); // Output: 2.72
console.log(container.GOLDEN_RATIO); // Output: 1.618

In this way, you can separate your constants from the services and manage them easily, making your code more readable and maintainable.

# Important fact about writing tests with the demeter-di

you can override the existing functionality of a service for testing purposes by simply redefining the service with the create method of the container factory.

You can override the functionality of this service for testing purposes by simply redefining the service with the create method, like this:


```js
containerFactory.create('complexService', (A, lot, of, dependencies) => ... ... [] /* returns an output of an array */)
```

You can override the functionality of this service for testing purposes by simply redefining the service with the create method, like this:

```js
containerFactory.create('complexService', () => ['fixture','data'])
```
again: It's important to note that the create method will create a new instance of the service each time it's accessed, this means that the service will be evaluated again and the new value returned.

You can use this technique to provide different test fixtures to your tests and test the behavior of your code under different conditions. This is a powerful way to test your code as it allows you to test it in isolation, without the need to test the whole application.

This will override the existing 'complexService' with a new service that returns the array ['fixture','data'] regardless of the dependencies passed to it.

# More intellectual munition for you
TLDR begin;

The Law of Demeter (LoD), the Inversion of Control (IoC) principle, also known as the Hollywood Principle, and Dependency Injection (DI) containers are all related concepts in software design that aim to promote loose coupling and maintainability in the code.

The Law of Demeter states that an object should only interact with its immediate neighbors, and not with objects that are further away. It helps to reduce the number of connections between objects and the impact of changes in one part of the code on other parts of the code. The LoD is mainly focused on the interactions between objects, and how they should be limited to reduce dependencies.

The Inversion of Control principle, on the other hand, is mainly focused on the control flow of a system. It states that the control of a system should be inverted, meaning that instead of the objects controlling the flow of the program, the flow of the program should control the objects. This is achieved by having objects that are dependent on other objects, rather than objects that are tightly coupled to one another.

Dependency Injection (DI) containers are tools that help developers manage the dependencies between objects and follow the principles of LoD and IoC. They provide an API for defining and composing services and constants, and managing their dependencies in a way that follows the LoD and IoC principles.

A DI container allows developers to define and compose services and constants within a container, and manage their dependencies in a way that follows the LoD and IoC principles. It can be used to create instances of objects and manage their dependencies, it also allows you to create a new instance of a service each time it's accessed, and it can also be used to create a singleton service that's only created once.

In summary, all these concepts are closely related and complement each other, and are often used together to improve the design and maintainability of a software system. The Law of Demeter and the Inversion of Control principle are mainly focused on limiting the interactions between objects and inverting the control flow of a system respectively, while Dependency Injection (DI) containers are a tool to help developers manage the dependencies between objects and follow the principles of LoD and IoC.

TLDR end;

# Examples

## React example
Here's an example of how you can use the compose method to create JSX elements, a fetchData function, and a handleClick function in a container and use them in a React component:

```jsx
import React from 'react';
import { containerFactory } from 'demeter-di';

const container = containerFactory
  .define('API_URL', 'https://api.example.com')
  .define('API_KEY', 'secret_key')
  .compose('MyButton', (handleClick) => <button onClick={handleClick}>Fetch Users</button>)
  .compose('MyData', (data) => <div>{JSON.stringify(data)}</div>)
  .compose('handleClick', (fetchData, setData) => () => {
    fetchData('/users')
      .then((users) => setData(users));
  })
  .compose('setData', (useState) => useState(null)[1])
  .compose('fetchData', (API_URL, API_KEY) => (endpoint) =>
    fetch(`${API_URL}/${endpoint}`, { headers: { 'x-api-key': API_KEY } })
      .then((res) => res.json())
  )
  .compose('MyComponent', (MyButton, MyData, handleClick, setData) => () => {
    const data = setData;
    return (
      <div>
        {MyButton}
        {data && MyData(data)}
      </div>
    );
  })();

export default container.MyComponent;

```

## Nodejs Example

```js
import Hapi from 'hapi';
import {containerFactory} from 'demeter-di'

const container = (server = false) => containerFactory
  .define('host', process.env.API_HOST || 'localhost')
  .define('port', process.env.API_PORT || 3000)
  .define('secret', process.env.API_SECRET || 'mysecret')
  .compose('validateJWT', (secret) => (request, h) => {
    // JWT validation logic
  })
  .compose('server', (host, port) => server || new Hapi.Server({ host, port }))
  .compose('init', (validateJWT, server) => {
    server.route({
      method: 'GET',
      path: '/',
      handler: (request, h) => {
        return 'Hello, World!';
      },
    });

    server.auth.strategy('jwt', 'jwt', {
      key: container.secret,
      validate: container.validateJWT,
      verifyOptions: { algorithms: ['HS256'] },
    });

    server.auth.default('jwt');

    await server.start();
    console.log('Server running on %s', container.server.info.uri);
  });

container.init;
```

This way, if a server is passed as an argument to the container function, it will be used instead of creating a new Hapi server. Also, the container.init is called at the end, to start the server and handle the routes.