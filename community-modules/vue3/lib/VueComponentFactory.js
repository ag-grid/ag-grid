var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { createApp, defineComponent } from 'vue';
var VueComponentFactory = /** @class */ (function () {
    function VueComponentFactory() {
    }
    VueComponentFactory.getComponentDefinition = function (component, parent) {
        var componentDefinition;
        // when referencing components by name - ie: cellRendererFramework: 'MyComponent'
        if (typeof component === 'string') {
            // look up the definition in Vue
            componentDefinition = this.searchForComponentInstance(parent, component);
        }
        else {
            componentDefinition = { extends: defineComponent(__assign({}, component)) };
        }
        if (!componentDefinition) {
            console.error("Could not find component with name of " + component + ". Is it in Vue.components?");
        }
        if (componentDefinition.extends && componentDefinition.extends.setup) {
            componentDefinition.setup = componentDefinition.extends.setup;
        }
        return componentDefinition;
    };
    VueComponentFactory.createComponentParams = function (params, parent) {
        var extendedParams = {
            params: Object.freeze(params),
            parent: parent,
        };
        if (parent.componentDependencies) {
            parent.componentDependencies.forEach(function (dependency) {
                return extendedParams[dependency] = parent[dependency];
            });
        }
        return extendedParams;
    };
    VueComponentFactory.createAndMountComponent = function (component, params, parent) {
        var componentDefinition = VueComponentFactory.getComponentDefinition(component, parent);
        if (!componentDefinition) {
            return;
        }
        var componentParams = VueComponentFactory.createComponentParams(params, parent);
        // the inner defineComponent allows us to re-declare the component, with the outer one allowing us to
        // provide the grid's params and capture the resulting component instance
        var componentInstance = null;
        var extendedComponentDefinition = defineComponent(__assign(__assign({}, componentDefinition), { data: function () { return (__assign(__assign({}, componentParams), componentDefinition.data ? componentDefinition.data() : {})); }, created: function () {
                componentInstance = this.$root;
                if (componentDefinition.created) {
                    componentDefinition.created.bind(this)();
                }
            } }));
        // with vue 3 we need to provide a container to mount into (not necessary in vue 2), so create a wrapper div here
        var container = document.createElement('div');
        var mountedComponent = createApp(extendedComponentDefinition);
        VueComponentFactory.addContext(mountedComponent, parent);
        parent.plugins.forEach(function (plugin) { return mountedComponent.use(plugin); });
        mountedComponent.mount(container);
        // note that the component creation is synchronous so that componentInstance is set by this point
        return { mountedComponent: mountedComponent, componentInstance: componentInstance };
    };
    VueComponentFactory.searchForComponentInstance = function (parent, component, maxDepth, suppressError) {
        if (maxDepth === void 0) { maxDepth = 10; }
        if (suppressError === void 0) { suppressError = false; }
        var componentInstance = null;
        var currentParent = parent.$parent;
        var depth = 0;
        while (!componentInstance &&
            currentParent &&
            currentParent.$options &&
            (++depth < maxDepth)) {
            var currentParentAsThis = currentParent;
            componentInstance = currentParentAsThis.$options && currentParentAsThis.$options.components ? currentParentAsThis.$options.components[component] : null;
            currentParent = currentParent.$parent;
        }
        // then search in globally registered components of app
        if (!componentInstance) {
            var components = parent.$.appContext.components;
            if (components && components[component]) {
                componentInstance = components[component];
            }
        }
        if (!componentInstance && !suppressError) {
            console.error("Could not find component with name of " + component + ". Is it in Vue.components?");
            return null;
        }
        return componentInstance;
    };
    VueComponentFactory.addContext = function (component, parent) {
        if (component._context && parent.$ && parent.$.appContext) {
            var contextProperties = [
                'config',
                'mixins',
                'components ',
                'directives ',
                'provides',
                'optionsCache',
                'propsCache',
                'emitsCache',
            ];
            contextProperties.forEach(function (property) { return component._context[property] = parent.$.appContext[property]; });
        }
    };
    return VueComponentFactory;
}());
export { VueComponentFactory };
