import { BaseComponentWrapper, Bean, WrapableInterface } from 'ag-grid-community';
import { AgGridVue } from "./AgGridVue";
import { VueComponentFactory } from "./VueComponentFactory";

@Bean('frameworkComponentWrapper')
export class VueFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> {
    private parent: AgGridVue;

    constructor(parent: AgGridVue) {
        super();

        this.parent = parent;
    }

    createWrapper(component: any): WrapableInterface {
        let that = this;

        class DynamicComponent extends VueComponent<any, any> implements WrapableInterface {
            public init(params: any): void {
                super.init(params);
            }

            protected createComponent(params: any): any {
                return that.createComponent(component, params);
            }

            hasMethod(name: string): boolean {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            }

            callMethod(name: string, args: IArguments): void {
                const componentInstance = this.getFrameworkComponentInstance();
                return wrapper.getFrameworkComponentInstance()[name].apply(componentInstance, args)

            }

            addMethod(name: string, callback: Function): void {
                (wrapper as any)[name] = callback
            }
        }

        const wrapper = new DynamicComponent();
        return wrapper;
    }

    public createComponent<T>(component: any, params: any): any {
        const componentType = VueComponentFactory.getComponentType(this.parent, component);
        if (!componentType) {
            return;
        }
        return VueComponentFactory.createAndMountComponent(params, componentType, this.parent);
    }
}

abstract class VueComponent<P, T> {
    private component: any;

    protected init(params: P): void {
        this.component = this.createComponent(params);
    }

    public getGui(): HTMLElement {
        return this.component.$el;
    }

    public destroy(): void {
        this.component.$destroy();
    }

    public getFrameworkComponentInstance(): any {
        return this.component;
    }

    protected abstract createComponent(params: P): any;
}
