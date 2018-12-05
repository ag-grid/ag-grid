/* tslint:disable */
import {Bean} from 'ag-grid-community';

import {VueComponentFactory} from './VueComponentFactory';

@Bean('frameworkComponentWrapper')
export class VueFrameworkComponentWrapper {
    private _parent: any;

    constructor(parent: any) {
        this._parent = parent;
    }

    public wrap(component: any, methodList: string[], optionalMethods: string[]): any {
        const parent = this._parent;
        const componentType = VueComponentFactory.getComponentType(parent, component);
        if (!componentType) {
            return;
        }

        class DynamicComponent {
            private component: any;

            public init(params: any) {
                this.component = VueComponentFactory.createAndMountComponent(params, componentType, parent);
            }

            public getGui() {
                return this.component.$el;
            }

            public destroy() {
                this.component.$destroy();
            }

            public getFrameworkComponentInstance() {
                return this.component;
            }
        }

        const wrapper = new DynamicComponent();
        methodList.forEach(((methodName: string) => {
            (wrapper as any)[methodName] = function() {
                if (wrapper.getFrameworkComponentInstance()[methodName]) {
                    const componentRef = this.getFrameworkComponentInstance();
                    return wrapper.getFrameworkComponentInstance()[methodName].apply(componentRef, arguments);
                } else {
                    console.warn('ag-Grid: Vue component is missing the method ' + methodName + '()');
                    return null;
                }
            };
        }));
        optionalMethods.forEach(((methodName: string) => {
            (wrapper as any)[methodName] = function() {
                if (wrapper.getFrameworkComponentInstance()[methodName]) {
                    const componentRef = this.getFrameworkComponentInstance();
                    return wrapper.getFrameworkComponentInstance()[methodName].apply(componentRef, arguments);
                }
            };
        }));

        return wrapper;
    }
}
