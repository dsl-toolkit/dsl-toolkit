declare module 'demeter-di' {
    export interface ContainerFactory {
      define<T>(name: string, value: T): ContainerFactory;
      compose<T>(
        name: string, 
        service: (...args: any[]) => T, 
        dependencies?: string[]
      ): ContainerFactory;
      create<T>(
        name: string, 
        service: (...args: any[]) => T, 
        dependencies?: string[]
      ): ContainerFactory;
      (): Container;
    }
  
    export interface Container {
      [key: string]: any | any;
    }
  
    export interface ContainerFactoryFactory {
      (): ContainerFactory;
    }
  
    const demeterDi: {
      containerFactoryFactory: ContainerFactoryFactory;
    };
  
    export default demeterDi;
  }