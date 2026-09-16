// demeter-di.d.ts

/** The resolved container: services and constants are read by name. */
export interface Container {
  [key: string]: any
}

/**
 * The chain of `define` / `compose` / `create` commands. Calling it with no
 * arguments builds the container.
 */
export interface ContainerFactory {
  define<T>(name: string, value: T): ContainerFactory
  compose<T>(
    name: string,
    service: (...args: any[]) => T,
    dependencies?: string[]
  ): ContainerFactory
  create<T>(
    name: string,
    service: (...args: any[]) => T,
    dependencies?: string[]
  ): ContainerFactory
  (): Container
}

/** Call it to get a fresh, independent `ContainerFactory` chain. */
export interface ContainerFactoryFactory {
  (): ContainerFactory
}

/** A dsl-framework factory wired to demeter-di's interpreter. */
export interface DslFrameworkFactory {
  (callbackFunction: (error: any, program: any) => any): any
}

/** One shared chain. Use it for a single container; prefer the factory below. */
export const containerFactory: ContainerFactory

/** Returns a fresh chain per call — the safe entry point. */
export const containerFactoryFactory: ContainerFactoryFactory

export const DslFrameworkFactory: DslFrameworkFactory

declare const demeterDi: {
  containerFactory: ContainerFactory
  containerFactoryFactory: ContainerFactoryFactory
  DslFrameworkFactory: DslFrameworkFactory
}

export default demeterDi
