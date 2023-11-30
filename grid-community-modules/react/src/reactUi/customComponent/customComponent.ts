import { createContext, createElement } from "react";
import { NewReactComponent } from "../../shared/newReactComponent";

export type CustomContextParams<P, M> = {
    setMethods: (methods: M) => void,
    params: P,
    addCallback: (callback: (props: P) => void) => void,
}

export const CustomContext = createContext<CustomContextParams<any, any>>({
    setMethods: () => {},
    params: {} as any,
    addCallback: () => {}
});

export class CustomComponent<P, M> extends NewReactComponent {
    protected refreshProps!: (props: P) => void;

    protected providedMethods!: M;

    public addMethod(): void {
        // do nothing
    }

    protected createElement(reactComponent: any, props: P): any {
        return createElement(CustomContext.Provider, { value: {
            setMethods: methods => this.setMethods(methods),
            params: props,
            addCallback: callback => {
                this.refreshProps = callback;
            }
        } }, super.createElement(reactComponent, {}));
    }

    protected setMethods(methods: M): void {
        this.providedMethods = methods;
        this.getOptionalMethods().forEach(method => {
            const providedMethod = (this.providedMethods as any)[method];
            if (providedMethod) {
                super.addMethod(method, providedMethod);
            }
        });
    }

    protected getOptionalMethods(): string[] {
        return [];
    }
}