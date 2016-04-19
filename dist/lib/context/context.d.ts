// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export interface ContextParams {
    seed: any;
    beans: any[];
    overrideBeans: any[];
    debug: boolean;
}
export declare class Context {
    private beans;
    private contextParams;
    private logger;
    private destroyed;
    constructor(params: ContextParams);
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
    private postWire(beans);
    private wireCompleteBeans(beans);
    destroy(): void;
}
export declare function PostConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare function Bean(beanName: string): Function;
export declare function Autowired(name?: string): Function;
export declare function Optional(name?: string): Function;
export declare function Qualifier(name: string): Function;
