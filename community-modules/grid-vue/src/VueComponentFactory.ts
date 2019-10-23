import Vue, { VueConstructor } from 'vue';
import { AgGridVue } from './AgGridVue';

export class VueComponentFactory {

    public static getComponentType(parent: AgGridVue, component: VueConstructor) {
        if (typeof component === 'string') {
            const componentInstance: VueConstructor = parent.$parent.$options.components![component] as VueConstructor;
            if (!componentInstance) {
                console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
                return null;
            }
            return Vue.extend(componentInstance);
        } else {
            // assume a type
            return component;
        }
    }

    public static createAndMountComponent(params: any, componentType: any, parent: AgGridVue) {
        const details = {
            data: {
                params: Object.freeze(params),
            },
            parent,
        };

        if (parent.componentDependencies) {
            parent.componentDependencies.forEach((dependency) =>
                (details as any)[dependency] = (parent as any)[dependency],
            );
        }

        const component = new componentType(details);
        component.$mount();
        return component;
    }
}
