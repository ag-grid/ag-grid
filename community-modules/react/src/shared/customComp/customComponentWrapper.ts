import { AgPromise } from '@ag-grid-community/core';

import customWrapperComp from '../../reactUi/customComp/customWrapperComp';
import { ReactComponent } from '../reactComponent';

export type WrapperParams<P, M> = {
    initialProps: P;
    CustomComponentClass: any;
    setMethods: (methods: M) => void;
    addUpdateCallback: (callback: (props: P) => void) => void;
};

export function addOptionalMethods<M, C>(optionalMethodNames: string[], providedMethods: M, component: C): void {
    optionalMethodNames.forEach((methodName) => {
        const providedMethod = (providedMethods as any)[methodName];
        if (providedMethod) {
            (component as any)[methodName] = providedMethod;
        }
    });
}

export class CustomComponentWrapper<TInputParams, TOutputParams, TMethods> extends ReactComponent {
    private updateCallback?: () => AgPromise<void>;
    private resolveUpdateCallback!: () => void;
    private awaitUpdateCallback = new AgPromise<void>((resolve) => {
        this.resolveUpdateCallback = resolve;
    });

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

    public getInstance(): AgPromise<any> {
        return this.instanceCreated.then(() => this.componentInstance);
    }

    public getFrameworkComponentInstance(): any {
        return this;
    }

    protected createElement(reactComponent: any, props: TOutputParams): any {
        return super.createElement(this.wrapperComponent, {
            initialProps: props,
            CustomComponentClass: reactComponent,
            setMethods: (methods: TMethods) => this.setMethods(methods),
            addUpdateCallback: (callback: (props: TOutputParams) => void) => {
                // this hooks up `CustomWrapperComp` to allow props updates to be pushed to the custom component
                this.updateCallback = () => {
                    callback(this.getProps());
                    return new AgPromise<void>((resolve) => {
                        // ensure prop updates have happened
                        setTimeout(() => {
                            resolve();
                        });
                    });
                };
                this.resolveUpdateCallback();
            },
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
        return {
            ...this.sourceParams,
            key: this.key,
            ref: this.ref,
        } as any;
    }

    protected refreshProps(): AgPromise<void> {
        if (this.updateCallback) {
            return this.updateCallback();
        }
        // `refreshProps` is assigned in an effect. It's possible it hasn't been run before the first usage, so wait.
        return new AgPromise<void>((resolve) =>
            this.awaitUpdateCallback.then(() => {
                this.updateCallback!().then(() => resolve());
            })
        );
    }
}
