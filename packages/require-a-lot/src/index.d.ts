export type ast = Array<Array<any>>

export type coreFactory = (...args : string[]) => {
  (): {[key:string]: any};
  alias: (from:string, to:string) => coreFactory;
  from: (baseObject: string, tags: string[]) => coreFactory;
  define: (firstArg:string, secondArg: any) => coreFactory;
  compose: (
    firstArg:string, 
    secondArg: (...args : any[])=>any,
    secondArgParamContainerNamePointers?: string[]
  ) => coreFactory;
  cretae: (
    firstArg:string, 
    secondArg: (...args : any[])=>any,
    secondArgParamContainerNamePointers?: string[]
  ) => coreFactory;
  from: (firstArf: string, tags:string[]) => coreFactory;
  hide: (tag: string) => coreFactory;
  log: coreFactory;
  info: coreFactory;
  tag: (directory: string)=>coreFactory;
  information: (index:string, text:string) => coreFactory;
};

export type coreFactoryStarter = (require: require) => coreFactory;

export default coreFactory