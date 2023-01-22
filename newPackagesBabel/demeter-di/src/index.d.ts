interface Container {
  [key: string]: any;
}

interface ContainerFactory {
  define(name: string, value: any): ContainerFactory;
  compose(name: string, service: Function, dependencies?: string[]): ContainerFactory;
  create(name: string, service: Function, dependencies?: string[]): ContainerFactory;
  (): Container;
}

declare const containerFactory: ContainerFactory;