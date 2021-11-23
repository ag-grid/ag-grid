import { BaseComponentWrapper, Bean, WrappableInterface } from '@ag-grid-community/core';
import { AgGridVue } from './AgGridVue';
import { VueComponentFactory } from './VueComponentFactory';

interface VueWrappableInterface extends WrappableInterface {
    overrideProcessing(methodName: string): boolean;

    processMethod(methodName: string, args: IArguments): any;
}

@Bean('frameworkComponentWrapper')
export class VueFrameworkComponentWrapper extends BaseComponentWrapper<WrappableInterface> {
    private parent: AgGridVue | null;

    constructor(parent: AgGridVue) {
        super();

        this.parent = parent;
    }

    public createWrapper(component: any): WrappableInterface {
        const that = this;

        class DynamicComponent extends VueComponent<any, any> implements WrappableInterface {
            public init(params: any): void {
                super.init(params);
            }

            public hasMethod(name: string): boolean {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            }

            public callMethod(name: string, args: IArguments): any {
                const componentInstance = this.getFrameworkComponentInstance();
                const frameworkComponentInstance = wrapper.getFrameworkComponentInstance();
                return frameworkComponentInstance[name].apply(componentInstance, args);
            }

            public addMethod(name: string, callback: () => any): void {
                (wrapper as any)[name] = callback;
            }

            public overrideProcessing(methodName: string): boolean {
                return that.parent!.autoParamsRefresh && methodName === 'refresh';
            }

            public processMethod(methodName: string, args: IArguments): any {
                if (methodName === 'refresh') {
                    this.getFrameworkComponentInstance().params = args[0];
                }

                if (this.hasMethod(methodName)) {
                    return this.callMethod(methodName, args);
                }

                return methodName === 'refresh';
            }

            protected createComponent(params: any): any {
                return that.createComponent(component, params);
            }
        }

        const wrapper = new DynamicComponent();
        return wrapper;
    }

    public createComponent<T>(component: any, params: any): any {
        const componentType = VueComponentFactory.getComponentType(this.parent!, component);
        if (!componentType) {
            return;
        }
        return VueComponentFactory.createAndMountComponent(params, componentType, this.parent!);
    }

    protected createMethodProxy(wrapper: VueWrappableInterface, methodName: string, mandatory: boolean): () => any {
        return function() {
            if (wrapper.overrideProcessing(methodName)) {
                return wrapper.processMethod(methodName, arguments);
            }

            if (wrapper.hasMethod(methodName)) {
                return wrapper.callMethod(methodName, arguments);
            }

            if (mandatory) {
                console.warn('AG Grid: Framework component is missing the method ' + methodName + '()');
            }
            return null;
        };
    }

    protected destroy() {
        this.parent = null;
    }
}

abstract class VueComponent<P, T> {
    private component: any;

    public getGui(): HTMLElement {
        return this.component.$el;
    }

    public destroy(): void {
        if (this.getFrameworkComponentInstance() &&
            typeof this.getFrameworkComponentInstance().destroy === 'function') {
            this.getFrameworkComponentInstance().destroy();
        }
        this.component.$destroy();
    }

    public getFrameworkComponentInstance(): any {
        return this.component;
    }

    protected init(params: P): void {
        this.component = this.createComponent(params);
    }

    protected abstract createComponent(params: P): any;
}
