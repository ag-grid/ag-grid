/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BaseComponentWrapper = /** @class */ (function () {
    function BaseComponentWrapper() {
    }
    BaseComponentWrapper.prototype.wrap = function (OriginalConstructor, mandatoryMethodList, optionalMethodList, componentName) {
        var _this = this;
        if (optionalMethodList === void 0) { optionalMethodList = []; }
        var wrapper = this.createWrapper(OriginalConstructor, componentName);
        mandatoryMethodList.forEach((function (methodName) {
            _this.createMethod(wrapper, methodName, true);
        }));
        optionalMethodList.forEach((function (methodName) {
            _this.createMethod(wrapper, methodName, false);
        }));
        return wrapper;
    };
    BaseComponentWrapper.prototype.createMethod = function (wrapper, methodName, mandatory) {
        wrapper.addMethod(methodName, this.createMethodProxy(wrapper, methodName, mandatory));
    };
    BaseComponentWrapper.prototype.createMethodProxy = function (wrapper, methodName, mandatory) {
        return function () {
            if (wrapper.hasMethod(methodName)) {
                return wrapper.callMethod(methodName, arguments);
            }
            if (mandatory) {
                console.warn('ag-Grid: Framework component is missing the method ' + methodName + '()');
            }
            return null;
        };
    };
    return BaseComponentWrapper;
}());
exports.BaseComponentWrapper = BaseComponentWrapper;
