import { AgPromise } from "@ag-grid-community/core";
import customWrapperComp from "../../reactUi/customComp/customWrapperComp";
import { NewReactComponent } from "../newReactComponent";

export type WrapperParams<P, M> = {
    initialProps: P;
    CustomComponentClass: any;
    setMethods: (methods: M) => void;
    addUpdateCallback: (callback: (props: P) => void) => void;
}

export function addOptionalMethods<M, C>(optionalMethodNames: string[], providedMethods: M, component: C): void {
    optionalMethodNames.forEach(methodName => {
        const providedMethod = (providedMethods as any)[methodName];
        if (providedMethod) {
            (component as any)[methodName] = providedMethod;
        }
    });
}

export class CustomComponent<TInputParams, TOutputParams, TMethods> extends NewReactComponent {
    protected refreshProps!: (props: TOutputParams) => void;

    protected providedMethods!: TMethods;

    protected wrapperComponent: any = customWrapperComp;

    protected sourceParams!: TInputParams;

    public init(params: TInputParams): AgPromise<void> {
        this.sourceParams = params;
        return super.init(this.getProps());
    }

    public addMethod(): void {
        // do nothing
    }

    protected createElement(reactComponent: any, props: TOutputParams): any {
        return super.createElement(this.wrapperComponent, {
            initialProps: props,
            CustomComponentClass: reactComponent,
            setMethods: (methods: TMethods) => this.setMethods(methods),
            addUpdateCallback: (callback: (props: TOutputParams) => void) => {
                this.refreshProps = callback;
            }
        });
    }

    protected setMethods(methods: TMethods): void {
        this.providedMethods = methods;
        addOptionalMethods(this.getOptionalMethods(), this.providedMethods, this);
    }

    protected getOptionalMethods(): string[] {
        return [];
    }

    protected getProps(): TOutputParams {
        return this.sourceParams as any;
    }
}
