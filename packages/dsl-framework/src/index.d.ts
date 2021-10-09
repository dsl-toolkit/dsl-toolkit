export type ast = Array<Array<any>>

export type dState = {
  // make it a generator function:
  commandSequence: ()=>any
  argumets:{
  }
  command:{
    getObject:(...args : string[])=>ast[]|[],
    hasObject:(...args : string[])=>{[key:string]: boolean},
    hasXor:(...args : string[])=>any,
    hasOr:(...args : string[])=>any,
    hasAnd:(...args : string[])=>boolean,
    getMore:(...args : string[])=>ast[],
    hasMore:(...args : string[])=>boolean[],
    get:(name:string)=>ast,
    has:()=>any,
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
  getFrom:(fromNthItem:number)=>dState
}

export function returnCallback (callback: number, state: dState): any;

declare type core = () => {
  (returnCallback) :any
  (): any;
  [key:string]: core;
};

export type coreFactory= () => {
  (): core;
  noPromises: coreFactory;
};


export default coreFactory