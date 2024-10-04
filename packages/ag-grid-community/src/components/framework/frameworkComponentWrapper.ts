import type { IComponent } from '../../interfaces/iComponent';
import type { ComponentType } from '../../interfaces/iUserCompDetails';
import { _logWarn } from '../../validation/logging';

/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 */
export interface FrameworkComponentWrapper {
    wrap<A extends IComponent<any>>(
        frameworkComponent: { new (): any } | null,
        mandatoryMethods: string[] | undefined,
        optionalMethods: string[] | undefined,
        componentType: ComponentType
    ): A;
}

export interface WrappableInterface {
    hasMethod(name: string): boolean;

    callMethod(name: string, args: IArguments): void;

    addMethod(name: string, callback: (...args: any[]) => any): void;
}

export abstract class BaseComponentWrapper<F extends WrappableInterface> implements FrameworkComponentWrapper {
    public wrap<A extends IComponent<any>>(
        OriginalConstructor: { new (): any },
        mandatoryMethods: string[] | undefined,
        optionalMethods: string[] | undefined,
        componentType: ComponentType
    ): A {
        const wrapper: F = this.createWrapper(OriginalConstructor, componentType);

        mandatoryMethods?.forEach((methodName) => {
            this.createMethod(wrapper, methodName, true);
        });

        optionalMethods?.forEach((methodName) => {
            this.createMethod(wrapper, methodName, false);
        });

        return wrapper as any as A;
    }

    protected abstract createWrapper(OriginalConstructor: { new (): any }, componentType: ComponentType): F;

    private createMethod(wrapper: F, methodName: string, mandatory: boolean): void {
        wrapper.addMethod(methodName, this.createMethodProxy(wrapper, methodName, mandatory));
    }

    protected createMethodProxy(wrapper: F, methodName: string, mandatory: boolean): (...args: any[]) => any {
        return function () {
            if (wrapper.hasMethod(methodName)) {
                // eslint-disable-next-line
                return wrapper.callMethod(methodName, arguments);
            }

            if (mandatory) {
                _logWarn(49, { methodName });
            }
            // multiple features rely on this returning `null` rather than `undefined`,
            // so that they can differentiate whether the underlying component has implemented a void method or not
            return null;
        };
    }
}
