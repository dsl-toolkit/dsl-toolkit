import { dState, returnCallback } from "../dsl-framework/src";

// import * as dslFrameworkStarter from 'dsl-framework';
const dslFrameworkStarter = require('dsl-framework');
const {log:l} = require('./src/index')();

// dslFrameworkStarter.DADADADE()
// dslFrameworkStarter()
// const dslFramework = dslFrameworkStarter.noPromises()

const rcb: returnCallback = (e:number, state: dState)=>{
  l(
    Object.keys(state),
    // state
    state.arguments,
    state.getFrom(5,state.data.returnArrayChunks),
    // state.command.hasMore('a', 'b'),
    // state.command.getMore('a', 'b'),
    // state.command.hasOr('g', 'j', 'e'),
    // state.command.hasObject('a','b', 'j'),
    // state.getFrom(0).getFrom(0).command.hasMore('a','b'),
    // Object.keys(state.argumets)
    // state.argumets
    // state.command.get('a')
    )()

  
}
dslFrameworkStarter.noPromises()(
  rcb
).a.b('1',2,3,4).b(2).c.d.j(111,222,333).j('a','b','c')()

// const dslFramework_ = dslFrameworkStarter().
// l(
  // dslFrameworkStarter.noPromises()((e, state)=>{
  //   l(state.data)()
  // })
  // Object.keys(dslFrameworkStarter), 
  // Object.keys(dslFrameworkStarter),
  // Object.keys(dslFramework().called.called.called),
  // dslFramework().a.b.c(),
  // dslFramework().a.b.c.ddd(),
  // dslFramework().key.ddd.dddd.ddd(),
  // Object.keys(dslFramework().key.ddd.dddd.ddd()),
  // dslFrameworkStarter()().a.b.c().data.returnArrayChunks,
  // Array.isArray( dslFrameworkStarter()().a.b.c().data.returnArrayChunks),
  // dslFrameworkStarter()().a.b.c().data.returnArrayChunks,
  // )()
  // dslFrameworkStarter()().a.b.c().data,

  // dslFrameworkStarter()().a.b.c.ddd()
  // l(

  //   dslFrameworkStarter()().a.b.c.e.f.g()

  // )();
// console.log(dslFrameworkStarter);
// console.log(dslFrameworkStarter());
// const dslFramework= dslFrameworkStarter();

// const f = instance() + '2'

// instance.a
// ccc = instance()
// ccc()
// console.log("aaa")

