import { createVNode, defineComponent, render } from 'vue';
export class VueComponentFactory {
    static getComponentDefinition(component, parent) {
        let componentDefinition;
        // when referencing components by name - ie: cellRenderer: 'MyComponent'
        if (typeof component === 'string') {
            // look up the definition in Vue
            componentDefinition = this.searchForComponentInstance(parent, component);
        }
        else {
            componentDefinition = { extends: defineComponent(Object.assign({}, component)) };
        }
        if (!componentDefinition) {
            console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
        }
        if (componentDefinition.extends) {
            if (componentDefinition.extends.setup) {
                componentDefinition.setup = componentDefinition.extends.setup;
            }
            componentDefinition.extends.props = this.addParamsToProps(componentDefinition.extends.props);
        }
        else {
            componentDefinition.props = this.addParamsToProps(componentDefinition.props);
        }
        return componentDefinition;
    }
    static addParamsToProps(props) {
        if (!props || (Array.isArray(props) && props.indexOf('params') === -1)) {
            props = ['params', ...(props ? props : [])];
        }
        else if (typeof props === 'object' && !props.params) {
            /* tslint:disable:no-string-literal */
            props['params'] = {
                type: Object
            };
        }
        return props;
    }
    static createAndMountComponent(component, params, parent) {
        const componentDefinition = VueComponentFactory.getComponentDefinition(component, parent);
        if (!componentDefinition) {
            return;
        }
        const { vNode, destroy, el } = this.mount(componentDefinition, { params: Object.freeze(params) }, parent);
        // note that the component creation is synchronous so that componentInstance is set by this point
        return {
            componentInstance: vNode.component.proxy,
            element: el,
            destroy,
        };
    }
    static mount(component, props, parent) {
        let vNode = createVNode(component, props);
        vNode.appContext = parent.$.appContext;
        vNode.appContext.provides = Object.assign(Object.assign({}, (vNode.appContext.provides ? vNode.appContext.provides : {})), (parent.$parent.$options.provide ? parent.$parent.$options.provide : {}));
        let el = document.createElement('div');
        render(vNode, el);
        const destroy = () => {
            if (el) {
                render(null, el);
            }
            el = null;
            vNode = null;
        };
        return { vNode, destroy, el };
    }
    static searchForComponentInstance(parent, component, maxDepth = 10, suppressError = false) {
        let componentInstance = null;
        let currentParent = parent.$parent;
        let depth = 0;
        while (!componentInstance &&
            currentParent &&
            currentParent.$options &&
            (++depth < maxDepth)) {
            const currentParentAsThis = currentParent;
            componentInstance = currentParentAsThis.$options && currentParentAsThis.$options.components ? currentParentAsThis.$options.components[component] : null;
            currentParent = currentParent.$parent;
        }
        // then search in globally registered components of app
        if (!componentInstance) {
            const components = parent.$.appContext.components;
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
}
//# sourceMappingURL=VueComponentFactory.js.map