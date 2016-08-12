// Type definitions for ag-grid v5.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Component } from "../widgets/component";
export interface ContextParams {
    seed: any;
    beans: any[];
    components: ComponentMeta[];
    overrideBeans: any[];
    debug: boolean;
}
export interface ComponentMeta {
    theClass: new () => Object;
    componentName: string;
}
export declare class Context {
    private beans;
    private contextParams;
    private logger;
    private componentsMappedByName;
    private destroyed;
    constructor(params: ContextParams);
    private setupComponents();
    private addComponent(componentMeta);
    createComponent(element: Element): Component;
    private copyAttributesFromNode(fromNode, toNode);
    wireBean(bean: any): void;
    private wireBeans(beans);
    private createBeans();
    private createBeanEntry(Bean);
    private autoWireBeans(beans);
    private methodWireBeans(beans);
    private autoWireBean(bean);
    private getBeanName(bean);
    private methodWireBean(bean);
    private getBeansForParameters(parameters, beanName);
    private lookupBeanInstance(wiringBean, beanName, optional?);
    private postConstruct(beans);
    getBean(name: string): any;
    destroy(): void;
}
export declare function PostConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare function PreDestroy(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare function Bean(beanName: string): Function;
export declare function Autowired(name?: string): Function;
export declare function Optional(name?: string): Function;
export declare function Qualifier(name: string): Function;
