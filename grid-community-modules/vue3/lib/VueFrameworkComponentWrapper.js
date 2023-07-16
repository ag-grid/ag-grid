import { BaseComponentWrapper } from '@ag-grid-community/core';
import { VueComponentFactory } from './VueComponentFactory';
export class VueFrameworkComponentWrapper extends BaseComponentWrapper {
    constructor(parent, provides) {
        super();
        this.parent = parent;
        // when using master detail things provides to the master (like urlql) will not be available to the child components
        // we capture the parent provides here (the first one will be the parent) - and re-use this when creating child components in VueComponentFactory
        if (!VueFrameworkComponentWrapper.provides) {
            VueFrameworkComponentWrapper.provides = provides;
        }
    }
    createWrapper(component) {
        const that = this;
        class DynamicComponent extends VueComponent {
            init(params) {
                super.init(params);
            }
            hasMethod(name) {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            }
            callMethod(name, args) {
                const componentInstance = this.getFrameworkComponentInstance();
                const frameworkComponentInstance = wrapper.getFrameworkComponentInstance();
                return frameworkComponentInstance[name].apply(componentInstance, args);
            }
            addMethod(name, callback) {
                wrapper[name] = callback;
            }
            overrideProcessing(methodName) {
                return that.parent.autoParamsRefresh && methodName === 'refresh';
            }
            processMethod(methodName, args) {
                if (methodName === 'refresh') {
                    this.getFrameworkComponentInstance().params = args[0];
                }
                if (this.hasMethod(methodName)) {
                    return this.callMethod(methodName, args);
                }
                return methodName === 'refresh';
            }
            createComponent(params) {
                return that.createComponent(component, params);
            }
        }
        const wrapper = new DynamicComponent();
        return wrapper;
    }
    createComponent(component, params) {
        return VueComponentFactory.createAndMountComponent(component, params, this.parent, VueFrameworkComponentWrapper.provides);
    }
    createMethodProxy(wrapper, methodName, mandatory) {
        return function () {
            if (wrapper.overrideProcessing(methodName)) {
                return wrapper.processMethod(methodName, arguments);
            }
            if (wrapper.hasMethod(methodName)) {
                return wrapper.callMethod(methodName, arguments);
            }
            if (mandatory) {
                console.warn('AG Grid: Framework component is missing the method ' + methodName + '()');
            }
            return null;
        };
    }
    destroy() {
        this.parent = null;
    }
}
class VueComponent {
    getGui() {
        return this.element;
    }
    destroy() {
        if (this.getFrameworkComponentInstance() && typeof this.getFrameworkComponentInstance().destroy === 'function') {
            this.getFrameworkComponentInstance().destroy();
        }
        this.unmount();
    }
    getFrameworkComponentInstance() {
        return this.componentInstance;
    }
    init(params) {
        const { componentInstance, element, destroy: unmount } = this.createComponent(params);
        this.componentInstance = componentInstance;
        this.unmount = unmount;
        // the element is the parent div we're forced to created when dynamically creating vnodes
        // the first child is the user supplied component
        this.element = element.firstElementChild;
    }
}
