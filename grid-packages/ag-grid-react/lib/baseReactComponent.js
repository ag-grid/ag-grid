// ag-grid-react v23.0.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BaseReactComponent = /** @class */ (function () {
    function BaseReactComponent() {
    }
    BaseReactComponent.prototype.hasMethod = function (name) {
        var frameworkComponentInstance = this.getFrameworkComponentInstance();
        if (frameworkComponentInstance == null) {
            return false;
        }
        return frameworkComponentInstance[name] != null;
    };
    BaseReactComponent.prototype.callMethod = function (name, args) {
        var _this = this;
        var frameworkComponentInstance = this.getFrameworkComponentInstance();
        // this should never happen now that AgGridReact.waitForInstance is in use
        if (frameworkComponentInstance == null) {
            window.setTimeout(function () { return _this.callMethod(name, args); }, 100);
        }
        else {
            var method = this.getFrameworkComponentInstance()[name];
            if (method == null)
                return;
            return method.apply(frameworkComponentInstance, args);
        }
    };
    BaseReactComponent.prototype.addMethod = function (name, callback) {
        this[name] = callback;
    };
    return BaseReactComponent;
}());
exports.BaseReactComponent = BaseReactComponent;
