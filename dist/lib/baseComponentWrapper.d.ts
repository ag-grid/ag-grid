// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { FrameworkComponentWrapper } from "./componentProvider";
import { IComponent } from "./interfaces/iComponent";
export interface WrapableInterface {
    hasMethod(name: string): boolean;
    callMethod(name: string, args: IArguments): void;
    addMethod(name: string, callback: Function): void;
}
export declare abstract class BaseComponentWrapper<F extends WrapableInterface> implements FrameworkComponentWrapper {
    wrap<A extends IComponent<any>>(OriginalConstructor: {
        new (): any;
    }, mandatoryMethodList: string[], optionalMethodList?: string[]): A;
    abstract createWrapper(OriginalConstructor: {
        new (): any;
    }): F;
    private createMethod(wrapper, methodName, mandatory);
    private createMethodProxy(wrapper, methodName, mandatory);
}
