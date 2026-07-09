import type { IComponent } from 'ag-stack';

import type { ComponentType } from '../../interfaces/iUserCompDetails';
import { _warnForGrid } from '../../validation/logging';

/**
 * B the business interface (ie IHeader)
 * A the agGridComponent interface (ie IHeaderComp). The final object acceptable by ag-grid
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface FrameworkComponentWrapper {
    wrap<A extends IComponent<any>>(
        frameworkComponent: (new () => any) | null,
        mandatoryMethods: string[] | undefined,
        optionalMethods: string[] | undefined,
        componentType: ComponentType
    ): A;
    /**
     * Attributes diagnostics from this wrapper's method proxies to the given grid. Optional because a
     * delegating wrapper (master/detail) forwards its wrapping to another wrapper and sets nothing of its
     * own — so a detail grid's framework-component diagnostics are attributed to the master grid.
     */
    setGridId?(gridId: string): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface WrappableInterface {
    hasMethod(name: string): boolean;

    callMethod(name: string, args: IArguments): void;

    addMethod(name: string, callback: (...args: any[]) => any): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class BaseComponentWrapper<F extends WrappableInterface> implements FrameworkComponentWrapper {
    protected gridId?: string;

    public setGridId(gridId: string): void {
        this.gridId = gridId;
    }

    public wrap<A extends IComponent<any>>(
        OriginalConstructor: new () => any,
        mandatoryMethods: string[] | undefined,
        optionalMethods: string[] | undefined,
        componentType: ComponentType
    ): A {
        const wrapper: F = this.createWrapper(OriginalConstructor, componentType);

        for (const methodName of mandatoryMethods ?? []) {
            this.createMethod(wrapper, methodName, true);
        }

        for (const methodName of optionalMethods ?? []) {
            this.createMethod(wrapper, methodName, false);
        }

        return wrapper as any as A;
    }

    protected abstract createWrapper(OriginalConstructor: new () => any, componentType: ComponentType): F;

    private createMethod(wrapper: F, methodName: string, mandatory: boolean): void {
        wrapper.addMethod(methodName, this.createMethodProxy(wrapper, methodName, mandatory));
    }

    protected createMethodProxy(wrapper: F, methodName: string, mandatory: boolean): (...args: any[]) => any {
        // Grid ID is always set at this point
        const gridId = this.gridId!;
        return function () {
            if (wrapper.hasMethod(methodName)) {
                // eslint-disable-next-line
                return wrapper.callMethod(methodName, arguments);
            }

            if (mandatory) {
                _warnForGrid(gridId, 49, { methodName });
            }
            // multiple features rely on this returning `null` rather than `undefined`,
            // so that they can differentiate whether the underlying component has implemented a void method or not
            return null;
        };
    }
}
