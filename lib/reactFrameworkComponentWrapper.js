// ag-grid-react v12.0.0
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_1 = require("ag-grid");
var agReactComponent_1 = require("./agReactComponent");
var ReactFrameworkComponentWrapper = (function (_super) {
    __extends(ReactFrameworkComponentWrapper, _super);
    function ReactFrameworkComponentWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReactFrameworkComponentWrapper.prototype.createWrapper = function (ReactComponent) {
        var DynamicAgReactComponent = (function (_super) {
            __extends(DynamicAgReactComponent, _super);
            function DynamicAgReactComponent() {
                return _super.call(this, ReactComponent) || this;
            }
            DynamicAgReactComponent.prototype.init = function (params) {
                _super.prototype.init.call(this, params);
            };
            DynamicAgReactComponent.prototype.hasMethod = function (name) {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            };
            DynamicAgReactComponent.prototype.callMethod = function (name, args) {
                var componentRef = this.getFrameworkComponentInstance();
                return wrapper.getFrameworkComponentInstance()[name].apply(componentRef, args);
            };
            DynamicAgReactComponent.prototype.addMethod = function (name, callback) {
                wrapper[name] = callback;
            };
            return DynamicAgReactComponent;
        }(agReactComponent_1.AgReactComponent));
        var wrapper = new DynamicAgReactComponent();
        return wrapper;
    };
    return ReactFrameworkComponentWrapper;
}(ag_grid_1.BaseComponentWrapper));
ReactFrameworkComponentWrapper = __decorate([
    ag_grid_1.Bean('frameworkComponentWrapper')
], ReactFrameworkComponentWrapper);
exports.ReactFrameworkComponentWrapper = ReactFrameworkComponentWrapper;
