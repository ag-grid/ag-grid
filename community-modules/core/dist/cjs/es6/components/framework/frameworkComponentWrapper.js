/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseComponentWrapper = void 0;
class BaseComponentWrapper {
    wrap(OriginalConstructor, mandatoryMethodList, optionalMethodList = [], componentType) {
        const wrapper = this.createWrapper(OriginalConstructor, componentType);
        mandatoryMethodList.forEach((methodName => {
            this.createMethod(wrapper, methodName, true);
        }));
        optionalMethodList.forEach((methodName => {
            this.createMethod(wrapper, methodName, false);
        }));
        return wrapper;
    }
    unwrap(comp) {
        return comp;
    }
    createMethod(wrapper, methodName, mandatory) {
        wrapper.addMethod(methodName, this.createMethodProxy(wrapper, methodName, mandatory));
    }
    createMethodProxy(wrapper, methodName, mandatory) {
        return function () {
            if (wrapper.hasMethod(methodName)) {
                return wrapper.callMethod(methodName, arguments);
            }
            if (mandatory) {
                console.warn('AG Grid: Framework component is missing the method ' + methodName + '()');
            }
            return null;
        };
    }
}
exports.BaseComponentWrapper = BaseComponentWrapper;
