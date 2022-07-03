import { BaseComponentWrapper, WrappableInterface } from 'ag-grid-community';
interface VueWrappableInterface extends WrappableInterface {
    overrideProcessing(methodName: string): boolean;
    processMethod(methodName: string, args: IArguments): any;
}
export declare class VueFrameworkComponentWrapper extends BaseComponentWrapper<WrappableInterface> {
    private parent;
    constructor(parent: any);
    createWrapper(component: any): WrappableInterface;
    createComponent<T>(component: any, params: any): any;
    protected createMethodProxy(wrapper: VueWrappableInterface, methodName: string, mandatory: boolean): () => any;
    protected destroy(): void;
}
export {};
