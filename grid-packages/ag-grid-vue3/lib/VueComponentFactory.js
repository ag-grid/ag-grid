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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { createVNode, defineComponent, render } from 'vue';
var VueComponentFactory = /** @class */ (function () {
    function VueComponentFactory() {
    }
    VueComponentFactory.getComponentDefinition = function (component, parent) {
        var componentDefinition;
        // when referencing components by name - ie: cellRenderer: 'MyComponent'
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
    };
    VueComponentFactory.addParamsToProps = function (props) {
        if (!props || (Array.isArray(props) && props.indexOf('params') === -1)) {
            props = __spreadArrays(['params'], (props ? props : []));
        }
        else if (typeof props === 'object' && !props.params) {
            /* tslint:disable:no-string-literal */
            props['params'] = {
                type: Object
            };
        }
        return props;
    };
    VueComponentFactory.createAndMountComponent = function (component, params, parent) {
        var componentDefinition = VueComponentFactory.getComponentDefinition(component, parent);
        if (!componentDefinition) {
            return;
        }
        var _a = this.mount(componentDefinition, { params: Object.freeze(params) }, parent), vNode = _a.vNode, destroy = _a.destroy, el = _a.el;
        // note that the component creation is synchronous so that componentInstance is set by this point
        return {
            componentInstance: vNode.component.proxy,
            element: el,
            destroy: destroy,
        };
    };
    VueComponentFactory.mount = function (component, props, parent) {
        var vNode = createVNode(component, props);
        vNode.appContext = parent.$.appContext;
        vNode.appContext.provides = __assign(__assign({}, (vNode.appContext.provides ? vNode.appContext.provides : {})), (parent.$parent.$options.provide ? parent.$parent.$options.provide : {}));
        var el = document.createElement('div');
        render(vNode, el);
        var destroy = function () {
            if (el) {
                render(null, el);
            }
            el = null;
            vNode = null;
        };
        return { vNode: vNode, destroy: destroy, el: el };
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
    return VueComponentFactory;
}());
export { VueComponentFactory };
//# sourceMappingURL=VueComponentFactory.js.map