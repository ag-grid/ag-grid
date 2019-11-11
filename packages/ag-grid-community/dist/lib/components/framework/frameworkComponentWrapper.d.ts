import { IComponent } from "../../interfaces/iComponent";
/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface FrameworkComponentWrapper {
    wrap<A extends IComponent<any>>(frameworkComponent: {
        new (): any;
    }, methodList: string[], optionalMethodList: string[], componentName?: string): A;
}
export interface WrapableInterface {
    hasMethod(name: string): boolean;
    callMethod(name: string, args: IArguments): void;
    addMethod(name: string, callback: Function): void;
}
export declare abstract class BaseComponentWrapper<F extends WrapableInterface> implements FrameworkComponentWrapper {
    wrap<A extends IComponent<any>>(OriginalConstructor: {
        new (): any;
    }, mandatoryMethodList: string[], optionalMethodList?: string[], componentName?: string): A;
    abstract createWrapper(OriginalConstructor: {
        new (): any;
    }, componentName?: string): F;
    private createMethod;
    protected createMethodProxy(wrapper: F, methodName: string, mandatory: boolean): Function;
}
