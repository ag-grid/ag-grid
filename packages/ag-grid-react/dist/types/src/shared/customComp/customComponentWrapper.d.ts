import { AgPromise } from "ag-grid-community";
import { ReactComponent } from "../reactComponent";
export type WrapperParams<P, M> = {
    initialProps: P;
    CustomComponentClass: any;
    setMethods: (methods: M) => void;
    addUpdateCallback: (callback: (props: P) => void) => void;
};
export declare function addOptionalMethods<M, C>(optionalMethodNames: string[], providedMethods: M, component: C): void;
export declare class CustomComponentWrapper<TInputParams, TOutputParams, TMethods> extends ReactComponent {
    private updateCallback?;
    private resolveUpdateCallback;
    private awaitUpdateCallback;
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
    protected refreshProps(): AgPromise<void>;
}
