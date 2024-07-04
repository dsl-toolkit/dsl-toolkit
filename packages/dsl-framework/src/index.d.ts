// dsl-framework.d.ts

// The abstract syntax tree type
export type ast = any[][]; // Array<Array<any>>

// Default export is a function that returns an instance of the framework.
declare function dslFramework(): DslFrameworkInstance;

declare namespace dslFramework {
  export const anyType: any;
  export default dslFramework;
}

// The 'DslFrameworkInstance' type represents the main interface of the DSL framework.
interface DslFrameworkInstance {
  (): Core;
  (callback: Callback): DslState;
}

// The 'Callback' type represents the callback function used in the DSL framework.
type Callback = (error: any, data: DslState) => void;

// The 'Core' type represents the core function.
interface Core {
  (returnCallback: ReturnCallback): Core;
  (): DslState;
  (...args: any[]): Core;
  [index: string]: Core;
}

// The 'DslState' type represents the state of the DSL.
export interface DslState {
  commandSequence: () => any;
  arguments: (
    command: string,
    getProcess: "allEntries" | "firstArgument" | "firstEntry" | "lastArgument" | "lastEntry",
    defaultValue?: any
  ) => ast;
  command: {
    getObject: (...args: string[]) => ast[] | [];
    hasObject: (...args: string[]) => { [key: string]: boolean };
    hasXor: (...args: string[]) => any;
    hasOr: (...args: string[]) => any;
    hasAnd: (...args: string[]) => boolean;
    getMore: (...args: string[]) => ast[];
    hasMore: (...args: string[]) => boolean[];
    get: (name: string) => ast;
    has: (name: string) => boolean;
    getArguments: (argument: string) => ast;
  };
  data: {
    returnArrayChunks: ast;
    returnArray: () => any[]; // Flattened array
    getSubcommand: (keyword: string) => ast;
    repeate: {
      parent: any;
      me: (mecore: Core) => Core;
    };
  };
  getFrom: (fromNthItem: number, ast: ast) => DslState;
}

// The 'ReturnCallback' type represents the return callback function.
export type ReturnCallback = (callback: number, state: DslState) => void | any;

// The 'CoreFactory' type represents the factory for creating core instances.
export type CoreFactory = () => Core;

// Exporting 'anyType' as any
export const anyType: any;
export default dslFramework;
