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
  /** The normalized sequence. Present when a callback runs through a real-time factory. */
  steps?: { command: string, arguments: any[] }[]
  /** Results of the real-time `run` handlers, in written order. */
  effects?: any[]
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

/** What a real-time handler receives. */
export interface RealTimePayload {
  name: string
  arguments: any[]
  program: DslState
}

/** What `next()` hands back to a for-all aspect. */
export interface RealTimeOutcome {
  arguments: any[]
  effects: any[]
}

/** One per-command real-time registration. */
export interface RealTimeCallSpec {
  parameters?: string[]
  resolve?: (payload: RealTimePayload) => any[]
  run?: (payload: RealTimePayload) => any
}

/** One for-all real-time aspect. */
export interface RealTimeAspectSpec {
  name?: string
  wrap: (payload: RealTimePayload, next: () => RealTimeOutcome) => any
}

/** The folded registry a factory carries: command name to its stacked handlers. */
export interface RealTimeRegistry {
  [command: string]: RealTimeCallSpec[]
}

/** A factory minted by the default export. It carries its own real-time registry. */
export interface RealTimeFactory extends DslFrameworkInstance {
  realTime: RealTimeRegistry
  realTimePlugin: (callback: Callback) => Callback
  createFactory: () => DslFrameworkInstance
  setCoreData: (data: any) => void
}

/** The default export's registration chain: register, then terminate to mint. */
export interface RealTimeRegistration {
  (): RealTimeFactory
  registerRealTimeCall (name: string, spec: RealTimeCallSpec): RealTimeRegistration
  registerRealTimeCallAdd (name: string, spec: RealTimeCallSpec): RealTimeRegistration
  registerRealTimeCallReplace (name: string, spec: RealTimeCallSpec): RealTimeRegistration
  registerRealTimeCallForAll (spec: RealTimeAspectSpec): RealTimeRegistration
  registerRealTimeCallForAllAdd (spec: RealTimeAspectSpec): RealTimeRegistration
  registerRealTimeCallForAllReplace (spec: RealTimeAspectSpec): RealTimeRegistration
}

export const anyType: any

declare function dslFramework (): RealTimeFactory

declare namespace dslFramework {
  export const anyType: any
  export function registerRealTimeCall (name: string, spec: RealTimeCallSpec): RealTimeRegistration
  export function registerRealTimeCallAdd (name: string, spec: RealTimeCallSpec): RealTimeRegistration
  export function registerRealTimeCallReplace (name: string, spec: RealTimeCallSpec): RealTimeRegistration
  export function registerRealTimeCallForAll (spec: RealTimeAspectSpec): RealTimeRegistration
  export function registerRealTimeCallForAllAdd (spec: RealTimeAspectSpec): RealTimeRegistration
  export function registerRealTimeCallForAllReplace (spec: RealTimeAspectSpec): RealTimeRegistration
}

export default dslFramework
