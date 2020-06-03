import { ILogger } from "../iLogger";
import { Component } from "../widgets/component";
export interface ContextParams {
    providedBeanInstances: any;
    beanClasses: any[];
    debug: boolean;
}
export interface ComponentMeta {
    componentClass: new () => Object;
    componentName: string;
}
export declare class Context {
    private beanWrappers;
    private contextParams;
    private logger;
    private destroyed;
    constructor(params: ContextParams, logger: ILogger);
    private getBeanInstances;
    createBean<T extends any>(bean: T, afterPreCreateCallback?: (comp: Component) => void): T;
    private wireBeans;
    private createBeans;
    private createBeanWrapper;
    private autoWireBeans;
    private methodWireBeans;
    private forEachMetaDataInHierarchy;
    private getBeanName;
    private getBeansForParameters;
    private lookupBeanInstance;
    private callLifeCycleMethods;
    private callLifeCycleMethodsOneBean;
    getBean(name: string): any;
    destroy(): void;
    destroyBean<T extends any>(bean: T): T;
    destroyBeans<T extends any>(beans: T[]): T[];
}
export declare function PreConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare function PostConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare function PreDestroy(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare function Bean(beanName: string): Function;
export declare function Autowired(name?: string): Function;
export declare function Optional(name?: string): Function;
export declare function Qualifier(name: string): Function;
