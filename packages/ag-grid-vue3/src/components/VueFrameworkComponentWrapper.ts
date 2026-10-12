import { proxyRefs } from 'vue';

import type { ComponentType, WrappableInterface } from 'ag-grid-community';
import { BaseComponentWrapper, _warnForGrid } from 'ag-grid-community';

import { VueComponentFactory } from './VueComponentFactory';

interface VueWrappableInterface extends WrappableInterface {
    processMethod(methodName: string, args: IArguments): any;
}

export class VueFrameworkComponentWrapper extends BaseComponentWrapper<WrappableInterface> {
    private parent: any | null;
    private readonly provides: any | null;

    constructor(parent: any, provides?: any) {
        super();

        this.parent = parent;
        this.provides = provides;
    }

    protected createWrapper(component: any, componentType?: ComponentType): WrappableInterface {
        const that = this;
        const propertyName = componentType?.name;

        class DynamicComponent extends VueComponent<any> implements WrappableInterface {
            public override init(params: any): void {
                super.init(params);
            }

            public hasMethod(name: string): boolean {
                const componentInstance = this.getVueInstance();
                if (!componentInstance[name]) {
                    return (
                        componentInstance.$.exposed?.[name] != null ||
                        componentInstance.exposed?.[name] != null ||
                        componentInstance.$.setupState[name] != null
                    );
                } else {
                    return true;
                }
            }

            public callMethod(name: string, args: IArguments): any {
                const componentInstance = this.getVueInstance();
                if (componentInstance[name]) {
                    return componentInstance[name](...args);
                } else {
                    const fn =
                        componentInstance.$.exposed?.[name] ||
                        componentInstance.exposed?.[name] ||
                        componentInstance.$.setupState[name];
                    return fn?.apply(componentInstance, args);
                }
            }

            public addMethod(name: string, callback: () => any): void {
                (wrapper as any)[name] = callback;
            }

            public processMethod(methodName: string, args: IArguments): any {
                if (methodName === 'refresh') {
                    // Freeze params to prevent components from accidentally mutating shared objects
                    this.getFrameworkComponentInstance().params = Object.freeze(args[0]);
                }

                if (this.hasMethod(methodName)) {
                    return this.callMethod(methodName, args);
                }

                return methodName === 'refresh';
            }

            protected createComponent(params: any): any {
                return that.createComponent(component, params, propertyName);
            }
        }

        const wrapper = new DynamicComponent();
        return wrapper;
    }

    public createComponent(component: any, params: any, propertyName?: string): any {
        return VueComponentFactory.createAndMountComponent(
            component,
            params,
            this.parent!,
            this.provides!,
            this.gridId,
            propertyName
        );
    }

    protected override createMethodProxy(
        wrapper: VueWrappableInterface,
        methodName: string,
        mandatory: boolean
    ): () => any {
        // Grid ID is always set at this point
        const gridId = this.gridId!;
        return function () {
            if (wrapper.hasMethod(methodName)) {
                // eslint-disable-next-line prefer-rest-params
                return wrapper.callMethod(methodName, arguments);
            }

            if (mandatory) {
                _warnForGrid(gridId, 233, { methodName });
            }
            return null;
        };
    }

    protected destroy() {
        this.parent = null;
    }
}

abstract class VueComponent<P> {
    private componentInstance: any;
    private exposedInstance: any;
    private element!: HTMLElement;
    private unmount: any;

    public getGui(): HTMLElement {
        return this.element;
    }

    public destroy(): void {
        const componentInstance = this.getVueInstance();
        if (componentInstance && typeof componentInstance.destroy === 'function') {
            componentInstance.destroy();
        }
        this.unmount?.();
    }

    /**
     * The instance handed to users via the grid API. Vue's public instance proxy does not include members
     * exposed via `expose()` / `defineExpose()`, so when a component exposes members they are added as a fallback.
     */
    public getFrameworkComponentInstance(): any {
        const componentInstance = this.componentInstance;
        const exposed = componentInstance?.$.exposed;
        if (!exposed) {
            return componentInstance;
        }

        if (this.exposedInstance) {
            return this.exposedInstance;
        }

        // unwraps refs on read and assigns to a ref's value on write, as Vue's own template ref proxy does
        const exposedRefs = proxyRefs(exposed);
        this.exposedInstance = new Proxy(componentInstance, {
            get(target, key, receiver) {
                // read the Vue proxy unconditionally, as it reports keys such as `__v_skip` that its `has` trap does not
                const value = Reflect.get(target, key, receiver);
                if (value !== undefined || !(key in exposed)) {
                    return value;
                }
                return exposedRefs[key];
            },
            set(target, key, value) {
                if (!(key in target) && key in exposed) {
                    exposedRefs[key] = value;
                    return true;
                }
                return Reflect.set(target, key, value);
            },
            has(target, key) {
                return key in target || key in exposed;
            },
        });
        return this.exposedInstance;
    }

    protected getVueInstance(): any {
        return this.componentInstance;
    }

    protected init(params: P): void {
        const { componentInstance, element, destroy: unmount } = this.createComponent(params);

        this.componentInstance = componentInstance;
        this.unmount = unmount;

        // the element is the parent div we're forced to created when dynamically creating vnodes
        // the first child is the user supplied component
        this.element = element.firstElementChild ?? element;
    }

    protected abstract createComponent(params: P): any;
}
