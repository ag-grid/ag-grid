import {createApp, defineComponent} from 'vue';
import {Vue} from 'vue-class-component';
import {AgGridVue} from './AgGridVue';

export class VueComponentFactory {

    private static getComponentDefinition(component: any, parent: AgGridVue) {
        let componentDefinition: any;

        // when referencing components by name - ie: cellRendererFramework: 'MyComponent'
        if (typeof component === 'string') {
            // look up the definition in Vue
            componentDefinition = this.searchForComponentInstance(parent, component);
        } else {
            componentDefinition = {extends: defineComponent({...component})}
        }
        if (!componentDefinition) {
            console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
        }

        if (componentDefinition.extends && componentDefinition.extends.setup) {
            componentDefinition.setup = componentDefinition.extends.setup;
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
            ...componentDefinition,
            data: () => ({...componentParams, ...componentDefinition.data ? componentDefinition.data() : {}}),
            created() { // note: function - don't use arrow functions here (for the correct "this" to be used)
                componentInstance = (this as any).$root;
                if (componentDefinition.created) {
                    componentDefinition.created.bind(this)();
                }
            }
        });

        // with vue 3 we need to provide a container to mount into (not necessary in vue 2), so create a wrapper div here
        const container = document.createElement('div');
        const mountedComponent = createApp(extendedComponentDefinition);
        VueComponentFactory.addContext(mountedComponent, parent as any);
        (parent as any).plugins.forEach((plugin: any) => mountedComponent.use(plugin));
        mountedComponent.mount(container);

        // note that the component creation is synchronous so that componentInstance is set by this point
        return {mountedComponent, componentInstance};
    }

    public static searchForComponentInstance(parent: AgGridVue,
                                             component: any,
                                             maxDepth = 10,
                                             suppressError = false) {
        let componentInstance: any = null;

        let currentParent: Vue<any> = parent.$parent;
        let depth = 0;
        while (!componentInstance &&
        currentParent &&
        currentParent.$options &&
        (++depth < maxDepth)) {
            const currentParentAsThis = currentParent as any;
            componentInstance = currentParentAsThis.$options && currentParentAsThis.$options.components ? currentParentAsThis.$options.components![component as any] : null;
            currentParent = currentParent.$parent;
        }

        // then search in globally registered components of app
        if (!componentInstance) {
            const components = parent.$.appContext.components
            if (components && components[component]) {
                componentInstance = components[component];
            }
        }

        if (!componentInstance && !suppressError) {
            console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
            return null;
        }
        return componentInstance;
    }

    private static addContext(component: any, parent: any) {
        if (component._context && parent.$ && parent.$.appContext) {
            const contextProperties = [
                'config',
                'mixins',
                'components ',
                'directives ',
                'provides',
                'optionsCache',
                'propsCache',
                'emitsCache',
            ];

            contextProperties.forEach(property => component._context[property] = parent.$.appContext[property]);
        }
    }
}
