import { BaseComponentWrapper, WrapableInterface } from 'ag-grid-community';
import { AgGridVue } from './AgGridVue';
interface VueWrapableInterface extends WrapableInterface {
    overrideProcessing(methodName: string): boolean;
    processMethod(methodName: string, args: IArguments): any;
}
export declare class VueFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> {
    private parent;
    constructor(parent: AgGridVue);
    createWrapper(component: any): WrapableInterface;
    createComponent<T>(component: any, params: any): any;
    protected createMethodProxy(wrapper: VueWrapableInterface, methodName: string, mandatory: boolean): () => any;
    protected destroy(): void;
}
export {};
