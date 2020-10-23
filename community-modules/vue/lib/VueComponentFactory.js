import Vue from 'vue';
var VueComponentFactory = /** @class */ (function () {
    function VueComponentFactory() {
    }
    VueComponentFactory.getComponentType = function (parent, component) {
        if (typeof component === 'string') {
            var componentInstance = this.searchForComponentInstance(parent, component);
            if (!componentInstance) {
                console.error("Could not find component with name of " + component + ". Is it in Vue.components?");
                return null;
            }
            return Vue.extend(componentInstance);
        }
        else {
            // assume a type
            return component;
        }
    };
    VueComponentFactory.createAndMountComponent = function (params, componentType, parent) {
        var details = {
            data: {
                params: Object.freeze(params),
            },
            parent: parent,
        };
        if (parent.componentDependencies) {
            parent.componentDependencies.forEach(function (dependency) {
                return details[dependency] = parent[dependency];
            });
        }
        var component = new componentType(details);
        component.$mount();
        return component;
    };
    VueComponentFactory.searchForComponentInstance = function (parent, component, maxDepth) {
        if (maxDepth === void 0) { maxDepth = 10; }
        var componentInstance = null;
        var currentParent = parent.$parent;
        var depth = 0;
        while (!componentInstance &&
            currentParent &&
            currentParent.$options &&
            (++depth < maxDepth)) {
            componentInstance = currentParent.$options.components[component];
            currentParent = currentParent.$parent;
        }
        if (!componentInstance) {
            console.error("Could not find component with name of " + component + ". Is it in Vue.components?");
            return null;
        }
        return componentInstance;
    };
    return VueComponentFactory;
}());
export { VueComponentFactory };
