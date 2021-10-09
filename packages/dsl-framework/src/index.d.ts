export type ast = Array<Array<any>>

export type dState = {
  // make it a generator function:
  commandSequence: ()=>any
  argumets:{
  }
  command:{
    getObject:()=>any,
    hasObject:()=>any,
    hasXor:()=>any,
    hasOr:()=>any,
    hasAnd:()=>any,
    getMore:()=>any,
    hasMore:()=>any,
    get:(name:string)=>any,
    has:()=>any,
    getArguments:()=>any,
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