import { createContext, useContext } from "react";
import { NewReactComponent } from "../newReactComponent";

export function useGridCustomComponent<M>(methods: M): void {
    const { setMethods } = useContext(CustomContext);
    setMethods(methods);
}

export type CustomContextParams<M> = {
    setMethods: (methods: M) => void,
}

export type WrapperParams<P, M> = {
    initialProps: P;
    CustomComponentClass: any;
    setMethods: (methods: M) => void;
    addUpdateCallback: (callback: (props: P) => void) => void;
}

export const CustomContext = createContext<CustomContextParams<any>>({
    setMethods: () => {},
});

export class CustomComponent<P, M> extends NewReactComponent {
    protected refreshProps!: (props: P) => void;

    protected providedMethods!: M;

    protected wrapperComponent: any;

    public addMethod(): void {
        // do nothing
    }

    protected createElement(reactComponent: any, props: P): any {
        return super.createElement(this.wrapperComponent, {
            initialProps: props,
            CustomComponentClass: reactComponent,
            setMethods: (methods: M) => this.setMethods(methods),
            addUpdateCallback: (callback: (props: P) => void) => {
                this.refreshProps = callback;
            }
        });
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