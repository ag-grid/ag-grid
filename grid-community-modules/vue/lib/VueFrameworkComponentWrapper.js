var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BaseComponentWrapper, Bean } from '@ag-grid-community/core';
import { VueComponentFactory } from './VueComponentFactory';
let VueFrameworkComponentWrapper = class VueFrameworkComponentWrapper extends BaseComponentWrapper {
    constructor(parent) {
        super();
        this.parent = parent;
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
        const componentType = VueComponentFactory.getComponentType(this.parent, component);
        if (!componentType) {
            return;
        }
        return VueComponentFactory.createAndMountComponent(params, componentType, this.parent);
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
};
VueFrameworkComponentWrapper = __decorate([
    Bean('frameworkComponentWrapper')
], VueFrameworkComponentWrapper);
export { VueFrameworkComponentWrapper };
class VueComponent {
    getGui() {
        return this.component.$el;
    }
    destroy() {
        if (this.getFrameworkComponentInstance() &&
            typeof this.getFrameworkComponentInstance().destroy === 'function') {
            this.getFrameworkComponentInstance().destroy();
        }
        this.component.$destroy();
    }
    getFrameworkComponentInstance() {
        return this.component;
    }
    init(params) {
        this.component = this.createComponent(params);
    }
}
