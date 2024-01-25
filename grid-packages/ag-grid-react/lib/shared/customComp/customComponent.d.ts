// ag-grid-react v31.0.3
import { AgPromise } from "ag-grid-community";
import { ReactComponent } from "../reactComponent";
export declare type WrapperParams<P, M> = {
    initialProps: P;
    CustomComponentClass: any;
    setMethods: (methods: M) => void;
    addUpdateCallback: (callback: (props: P) => void) => void;
};
export declare function addOptionalMethods<M, C>(optionalMethodNames: string[], providedMethods: M, component: C): void;
export declare class CustomComponent<TInputParams, TOutputParams, TMethods> extends ReactComponent {
    protected refreshProps: () => void;
    protected providedMethods: TMethods;
    protected wrapperComponent: any;
    protected sourceParams: TInputParams;
    init(params: TInputParams): AgPromise<void>;
    addMethod(): void;
    getInstance(): AgPromise<any>;
    getFrameworkComponentInstance(): any;
    protected createElement(reactComponent: any, props: TOutputParams): any;
    protected setMethods(methods: TMethods): void;
    protected getOptionalMethods(): string[];
    protected getProps(): TOutputParams;
}
