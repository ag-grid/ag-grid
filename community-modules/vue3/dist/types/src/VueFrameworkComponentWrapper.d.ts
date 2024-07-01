import type { WrappableInterface } from '@ag-grid-community/core';
import { BaseComponentWrapper } from '@ag-grid-community/core';
interface VueWrappableInterface extends WrappableInterface {
    processMethod(methodName: string, args: IArguments): any;
}
export declare class VueFrameworkComponentWrapper extends BaseComponentWrapper<WrappableInterface> {
    private parent;
    private static provides;
    constructor(parent: any, provides?: any);
    createWrapper(component: any): WrappableInterface;
    createComponent<T>(component: any, params: any): any;
    protected createMethodProxy(wrapper: VueWrappableInterface, methodName: string, mandatory: boolean): () => any;
    protected destroy(): void;
}
export {};
