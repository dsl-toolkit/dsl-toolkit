export type containerFactory = (...args : string[]) => {
  (): {[key:string]: any};
  alias: (from:string, to:string) => containerFactory;
  from: (baseObject: string, tags: string[]) => containerFactory;
  define: (firstArg:string, secondArg: any) => containerFactory;
  compose: (
    firstArg:string, 
    secondArg: (...args : any[])=>any,
    secondArgParamContainerNamePointers?: string[]
  ) => containerFactory;
  create: (
    firstArg:string, 
    secondArg: (...args : any[])=>any,
    secondArgParamContainerNamePointers?: string[]
  ) => containerFactory;
  hide: (tag: string) => containerFactory;
  log: containerFactory;
  info: containerFactory;
  tag: (directory: string)=>containerFactory;
  information: (index:string, text:string) => containerFactory;
};

export type coreFactoryStarter = (require: (requiredPAth:string)=>any) => containerFactory;

export default containerFactory