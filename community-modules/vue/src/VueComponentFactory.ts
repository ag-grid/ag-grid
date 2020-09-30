import {createApp, defineComponent} from 'vue';
import {Vue} from 'vue-class-component';
import {AgGridVue} from './AgGridVue';

export class VueComponentFactory {

    private static getComponentDefinition(component: any, parent: AgGridVue) {
        let componentDefinition: any = null;
        if (typeof component === 'string') {
            componentDefinition = this.searchForComponentInstance(parent, component);
        } else {
            componentDefinition = component;
        }
        if (!componentDefinition) {
            console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
        }
        return componentDefinition;
    }

    private static createComponentParams(params: any, parent: AgGridVue) {
        const extendedParams = {
            params: Object.freeze(params),
            parent,
        };

        if (parent.componentDependencies) {
            parent.componentDependencies.forEach((dependency) =>
                (extendedParams as any)[dependency] = (parent as any)[dependency],
            );
        }

        return extendedParams;
    }

    public static createAndMountComponent(component: any, params: any, parent: AgGridVue) {
        const componentDefinition = VueComponentFactory.getComponentDefinition(component, parent);
        if (!componentDefinition) {
            return;
        }

        const componentParams = VueComponentFactory.createComponentParams(params, parent);

        // the inner defineComponent allows us to re-declare the component, with the outer one allowing us to
        // provide the grid's params and capture the resulting component instance
        let componentInstance: any = null;
        const extendedComponentDefinition = defineComponent({
            extends: defineComponent({...component}),
            data: () => componentParams,
            created: function () { // note: function - don't use arrow functions here (for the correct "this" to be used)
                componentInstance = (this as any).$root;
            }
        });

        // with vue 3 we need to provide a container to mount into (not necessary in vue 2), so create a wrapper div here
        const container = document.createElement('div');
        createApp(extendedComponentDefinition).mount(container);

        // note that the component creation is synchronous so that componentInstance is set by this point
        return componentInstance;
    }

    private static searchForComponentInstance(parent: AgGridVue, component: any, maxDepth = 10) {
        let componentInstance: any = null;

        let currentParent: Vue<any> = parent.$parent;
        let depth = 0;
        while (!componentInstance &&
        currentParent &&
        currentParent.$options &&
        (++depth < maxDepth)) {
            componentInstance = (currentParent as any).$options.components![component as any];
            currentParent = currentParent.$parent;
        }

        if (!componentInstance) {
            console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
            return null;
        }
        return componentInstance;
    }
}
