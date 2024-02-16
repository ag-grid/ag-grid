import Vue, {AsyncComponent, VueConstructor} from 'vue';
import {AgGridVue} from './AgGridVue';
import {Component} from 'vue/types/options';

export class VueComponentFactory {

    public static getComponentType(parent: AgGridVue, component: VueConstructor | string) {
        if (typeof component === 'string') {
            const componentInstance: VueConstructor =
                this.searchForComponentInstance(parent, component) as VueConstructor;
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

    public static searchForComponentInstance(parent: AgGridVue,
                                             component: VueConstructor | string,
                                             maxDepth = 10,
                                             suppressError = false) {
        let componentInstance: Component | AsyncComponent | null = null;

        let currentParent: Vue = parent.$parent;
        let depth = 0;
        while (!componentInstance &&
        currentParent &&
        currentParent.$options &&
        (++depth < maxDepth)) {
            componentInstance = (currentParent as any).$options.components![component as any];
            currentParent = currentParent.$parent;
        }

        if (!componentInstance && !suppressError) {
            console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
            return null;
        }
        return componentInstance;
    }
}
