import { ILogger } from "../iLogger";
import { Component } from "../widgets/component";
export interface ContextParams {
    providedBeanInstances: any;
    beanClasses: any[];
    debug: boolean;
    gridId: string;
}
export interface ComponentMeta {
    componentClass: new () => Object;
    componentName: string;
}
export interface ControllerMeta {
    controllerClass: new () => Object;
    controllerName: string;
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
    private callLifeCycleMethodsOnBean;
    getBean(name: string): any;
    destroy(): void;
    destroyBean<T>(bean: T): undefined;
    destroyBeans<T>(beans: T[]): T[];
    isDestroyed(): boolean;
    getGridId(): string;
}
export declare function PreConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare function PostConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare function PreDestroy(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare function Bean(beanName: string): Function;
export declare function Autowired(name?: string): Function;
export declare function Optional(name?: string): Function;
export declare function Qualifier(name: string): Function;
