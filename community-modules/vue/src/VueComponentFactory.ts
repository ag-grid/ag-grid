import {createApp, defineComponent} from 'vue';
import {Vue} from 'vue-class-component';
import {AgGridVue} from './AgGridVue';

export class VueComponentFactory {

    public static getComponentType(component: any, params: any, parent: AgGridVue) {
        let componentDefinition: any = null;
        if (typeof component === 'string') {
            componentDefinition =  this.searchForComponentInstance(parent, component);
            if (!componentDefinition) {
                console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
                return null;
            }
        } else {
            componentDefinition = component;
        }

        // the inner defineComponent allows us to re-declare the component, with the outer one allowing us to provide the grid's params

        let componentInstance:any = null;
        componentDefinition = defineComponent({ extends: defineComponent({ ...component }), data: () => ({params: params}), created: function() { componentInstance = (this as any).$root }});
        return createApp(componentDefinition);
    }

    public static createAndMountComponent(component: any, params: any, parent: AgGridVue) {
        // const componentType = VueComponentFactory.getComponentType(component, params, parent);
        // if (!componentType) {
        //     return;
        // }

        let componentDefinition: any = null;
        if (typeof component === 'string') {
            componentDefinition =  this.searchForComponentInstance(parent, component);
            if (!componentDefinition) {
                console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
                return null;
            }
        } else {
            componentDefinition = component;
        }

        // the inner defineComponent allows us to re-declare the component, with the outer one allowing us to provide the grid's params

        let componentInstance:any = null;
        componentDefinition = defineComponent({ extends: defineComponent({ ...component }), data: () => ({params: params}), created: function() { componentInstance = (this as any).$root }});

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

        const container = document.createElement('div');

        createApp(componentDefinition).mount(container);

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
