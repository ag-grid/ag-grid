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
        // modify by yuanjinyong 2021-07-26 begin
        // use the same appContext with ag-grid-vue component, then we can use this.$http, this.$store and globally registered components
        mountedComponent._context.config = parent.$.appContext.config
        mountedComponent._context.mixins = parent.$.appContext.mixins
        mountedComponent._context.components = parent.$.appContext.components
        mountedComponent._context.directives = parent.$.appContext.directives
        mountedComponent._context.provides = parent.$.appContext.provides
        mountedComponent._context.optionsCache = parent.$.appContext.optionsCache
        mountedComponent._context.propsCache = parent.$.appContext.propsCache
        mountedComponent._context.emitsCache = parent.$.appContext.emitsCache
        // modify by yuanjinyong 2021-07-26 end
        mountedComponent.mount(container);

        // note that the component creation is synchronous so that componentInstance is set by this point
        return {mountedComponent, componentInstance};
    }

    public static searchForComponentInstance(parent: AgGridVue,
                                             component: any,
                                             maxDepth = 10,
                                             suppressError = false) {
        // modify by yuanjinyong 2021-07-26 begin
        // first search in locally registered components of ag-grid-vue
        let components = parent.$parent?.$options.components;
        if (components && components[component]) {
            return components[component];
        }

        // then search in globally registered components of app
        components = parent.$.appContext.components
        if (components && components[component]) {
            return components[component];
        }

        if (!suppressError) {
            console.error("Could not find component with name of " + component + ". Is it in locally registered components or globally registered components?");
        }
        return null;
        // modify by yuanjinyong 2021-07-26 end
    }
}
