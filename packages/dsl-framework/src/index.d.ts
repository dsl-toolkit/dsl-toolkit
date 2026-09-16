// dsl-framework.d.ts

/** One chunk of a program: `[commandName, ...arguments]`. */
export type ast = any[][]

/**
 * The program object a callback receives, and what a callback-less terminal
 * call returns.
 */
export interface DslState {
  commandSequence: () => IterableIterator<{ command: string, arguments: any[] }>
  arguments: ArgumentsReader
  command: Command
  data: ProgramData
  /** Low-level container access. */
  getFrom: (...args: any[]) => any
}

export interface ProgramData {
  returnArrayChunks: ast
  returnArray: () => any[]
  repeate: {
    me: (instance: Core) => Core
    parent: ProgramData
  }
}

/** Modes accepted by `arguments(name, mode, defaultValue)`. */
export type ArgumentMode =
  | 'allEntries'
  | 'firstEntry'
  | 'lastEntry'
  | 'firstArgument'
  | 'lastArgument'
  | 'boolean'

export interface ArgumentsReader {
  (command: string, mode?: ArgumentMode, defaultValue?: any): any
  (commands: string[], mode?: ArgumentMode, defaultValue?: any): any[]
  object (
    commands: string | string[],
    modes?: ArgumentMode | ArgumentMode[],
    defaults?: any | any[]
  ): { [command: string]: any }
}

export type HasMoreFunction = (...names: string[]) => boolean[]
export type HasLogicalFunction = (...names: string[]) => boolean
export type GetMoreFunction = (...names: string[]) => ast[][]

export interface HasFunction {
  (name: string): boolean
  (name: string, onTrue: () => void, onFalse?: () => void): void
  more: HasMoreFunction
  and: HasLogicalFunction
  or: HasLogicalFunction
  xor: (...names: string[]) => number
  object: (...names: string[]) => { [command: string]: boolean }
}

export interface GetFunction {
  (name: string): ast[]
  more: GetMoreFunction
  object: (...names: string[]) => { [command: string]: ast[] }
}

export interface Command {
  has: HasFunction
  get: GetFunction
  hasMore: HasMoreFunction
  getMore: GetMoreFunction
  hasAnd: HasLogicalFunction
  hasOr: HasLogicalFunction
  hasXor: (...names: string[]) => number
  hasObject: (...names: string[]) => { [command: string]: boolean }
  getObject: (...names: string[]) => { [command: string]: ast[] }
  getArguments: (command: string) => any[][]
}

/**
 * The chain. It is an indexable, callable object: property access names a
 * command, calling it supplies that command's arguments, and calling the chain
 * with no arguments terminates it. Because the index signature is all the
 * engine can know about your vocabulary, commands type-check without being
 * verified — see the README's TypeScript section.
 */
export interface Core {
  (): DslState
  (returnCallback: ReturnCallback): Core
  (...args: any[]): Core
  [command: string]: Core
}

/** Result of calling the factory: hold it, then call it with a callback. */
export interface DslFrameworkInstance {
  (): Core
  (callback: Callback): Core
}

export type Callback = (error: any, program: DslState) => any

export type ReturnCallback = (error: number, program: DslState) => any

export type CoreFactory = () => Core

export const anyType: any

declare function dslFramework (): DslFrameworkInstance

declare namespace dslFramework {
  export const anyType: any
}

export default dslFramework
