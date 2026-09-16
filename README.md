<!--- source qa rewrite begin -->
### QA dsl-toolkit
[![CI](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml/badge.svg)](https://github.com/dsl-toolkit/dsl-toolkit/actions/workflows/test.yml)
<!--- source qa rewrite end -->
<!--- coverage begin -->
![coverage: 82.3% lines](https://dsl-toolkit.github.io/dsl-toolkit/coverage.svg)
<!--- coverage end -->
#Where are you?

This project is a monorepo, giving home for multiple projects depending on each
other. We use [lerna](https://github.com/lerna/lerna) to manage the releases
and the packages efficiently. Each of the projects it hosts is meant to be
**useful** in its area, and they are listed below.

# What projects belong to here?

 - **[dsl-framework](https://github.com/dsl-toolkit/dsl-toolkit/tree/master/packages/dsl-framework)**
The chaining engine. Describe a program as a labeled command sequence, then
interpret it once with a callback.
 - **[demeter-di](https://github.com/dsl-toolkit/dsl-toolkit/tree/master/packages/demeter-di)**
A dependency-injection container **built on dsl-framework**. Its `define`,
`compose` and `create` chains are folded into a container, making it the worked
example of a second interpreter over the engine.
 - **[cowlog](https://github.com/dsl-toolkit/dsl-toolkit/tree/master/packages/cowlog)**
Development time logging for NodeJs developers. Its logging command DSL is
built on dsl-framework.
 - **[generic-text-linker](https://github.com/dsl-toolkit/dsl-toolkit/tree/master/packages/generic-text-linker)**
Generic text linker for NodeJs.
 - **[directory-fixture-provider](https://github.com/dsl-toolkit/dsl-toolkit/tree/master/packages/directory-fixture-provider)**
Provides directories for testing. Built on dsl-framework.

# Motivation
Our aim is to provide tools that has not been released for developers, 
more productive. The original project called cowlog. All the tools here are
developed to remove the repetitive soul crushing tasks from you and be able
to focus to your business needs. 
