export type ast = Array<Array<any>>

export type dState = {
  // make it a generator function:
  commandSequence: ()=>any
  arguments: (
    command: string, 
    getProcess: "allEntries"|
    "firstArgument"|"firstEntry"|
    "lastArgument"|"lastEntry",
    defaultValue?: any)=>ast 
  // (command:string, getProcess: boolean, defaultValue?: any) =>
  command:{
    getObject:(...args : string[])=>ast[]|[],
    hasObject:(...args : string[])=>{[key:string]: boolean},
    hasXor:(...args : string[])=>any,
    hasOr:(...args : string[])=>any,
    hasAnd:(...args : string[])=>boolean,
    getMore:(...args : string[])=>ast[],
    hasMore:(...args : string[])=>boolean[],
    get:(name:string)=>ast,
    has:(name:string)=>boolean,
    getArguments:(argument:string)=>ast,
  },
  data:{
    returnArrayChunks: ast,
    returnArray: () => ast,
    getSubcommand: (keyword:string) => ast
    repeate:{
      parent: any,
      me: (mecore: core)=>core
    }
  }
  getFrom:(fromNthItem:number, ast:ast)=>dState
}

// It can be promise too. todo: add pomise too
export type returnCallback = (callback: number, state: dState)=> void;

declare type core = {
  (returnCallback): core
  (): dState | any;
  (...args : any[]): core;
  [index: string]: core;
};

export type coreFactory = () => {
  (): core;
  noPromises: coreFactory;
};

// export const instance = ():core|function(returnCallback):core => {
export const instance = ():core => {
  ()=>core
  noPromises: this;
};

instance.noPromises = instance;
