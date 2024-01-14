import Vue from 'vue';
export class VueComponentFactory {
    static getComponentType(parent, component) {
        if (typeof component === 'string') {
            const componentInstance = this.searchForComponentInstance(parent, component);
            if (!componentInstance) {
                console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
                return null;
            }
            return Vue.extend(componentInstance);
        }
        else {
            // assume a type
            return component;
        }
    }
    static createAndMountComponent(params, componentType, parent) {
        const details = {
            data: {
                params: Object.freeze(params),
            },
            parent,
        };
        if (parent.componentDependencies) {
            parent.componentDependencies.forEach((dependency) => details[dependency] = parent[dependency]);
        }
        const component = new componentType(details);
        component.$mount();
        return component;
    }
    static searchForComponentInstance(parent, component, maxDepth = 10, suppressError = false) {
        let componentInstance = null;
        let currentParent = parent.$parent;
        let depth = 0;
        while (!componentInstance &&
            currentParent &&
            currentParent.$options &&
            (++depth < maxDepth)) {
            componentInstance = currentParent.$options.components[component];
            currentParent = currentParent.$parent;
        }
        if (!componentInstance && !suppressError) {
            console.error(`Could not find component with name of ${component}. Is it in Vue.components?`);
            return null;
        }
        return componentInstance;
    }
}
