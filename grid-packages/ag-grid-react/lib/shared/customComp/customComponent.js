// ag-grid-react v31.0.3
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomComponent = exports.addOptionalMethods = void 0;
var customWrapperComp_1 = __importDefault(require("../../reactUi/customComp/customWrapperComp"));
var reactComponent_1 = require("../reactComponent");
function addOptionalMethods(optionalMethodNames, providedMethods, component) {
    optionalMethodNames.forEach(function (methodName) {
        var providedMethod = providedMethods[methodName];
        if (providedMethod) {
            component[methodName] = providedMethod;
        }
    });
}
exports.addOptionalMethods = addOptionalMethods;
var CustomComponent = /** @class */ (function (_super) {
    __extends(CustomComponent, _super);
    function CustomComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.wrapperComponent = customWrapperComp_1.default;
        return _this;
    }
    CustomComponent.prototype.init = function (params) {
        this.sourceParams = params;
        return _super.prototype.init.call(this, this.getProps());
    };
    CustomComponent.prototype.addMethod = function () {
        // do nothing
    };
    CustomComponent.prototype.getInstance = function () {
        var _this = this;
        return this.instanceCreated.then(function () { return _this.componentInstance; });
    };
    CustomComponent.prototype.getFrameworkComponentInstance = function () {
        return this;
    };
    CustomComponent.prototype.createElement = function (reactComponent, props) {
        var _this = this;
        return _super.prototype.createElement.call(this, this.wrapperComponent, {
            initialProps: props,
            CustomComponentClass: reactComponent,
            setMethods: function (methods) { return _this.setMethods(methods); },
            addUpdateCallback: function (callback) {
                _this.refreshProps = function () { return callback(_this.getProps()); };
            }
        });
    };
    CustomComponent.prototype.setMethods = function (methods) {
        this.providedMethods = methods;
        addOptionalMethods(this.getOptionalMethods(), this.providedMethods, this);
    };
    CustomComponent.prototype.getOptionalMethods = function () {
        return [];
    };
    CustomComponent.prototype.getProps = function () {
        return __assign(__assign({}, this.sourceParams), { key: this.key });
    };
    return CustomComponent;
}(reactComponent_1.ReactComponent));
exports.CustomComponent = CustomComponent;
