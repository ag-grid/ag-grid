import Vue from 'vue';
var VueComponentFactory = /** @class */ (function () {
    function VueComponentFactory() {
    }
    VueComponentFactory.getComponentType = function (parent, component) {
        if (typeof component === 'string') {
            var componentInstance = parent.$parent.$options.components[component];
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
    return VueComponentFactory;
}());
export { VueComponentFactory };
