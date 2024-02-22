// ag-grid-react v31.1.1
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
exports.CustomComponentWrapper = exports.addOptionalMethods = void 0;
var ag_grid_community_1 = require("ag-grid-community");
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
var CustomComponentWrapper = /** @class */ (function (_super) {
    __extends(CustomComponentWrapper, _super);
    function CustomComponentWrapper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.awaitUpdateCallback = new ag_grid_community_1.AgPromise(function (resolve) {
            _this.resolveUpdateCallback = resolve;
        });
        _this.wrapperComponent = customWrapperComp_1.default;
        return _this;
    }
    CustomComponentWrapper.prototype.init = function (params) {
        this.sourceParams = params;
        return _super.prototype.init.call(this, this.getProps());
    };
    CustomComponentWrapper.prototype.addMethod = function () {
        // do nothing
    };
    CustomComponentWrapper.prototype.getInstance = function () {
        var _this = this;
        return this.instanceCreated.then(function () { return _this.componentInstance; });
    };
    CustomComponentWrapper.prototype.getFrameworkComponentInstance = function () {
        return this;
    };
    CustomComponentWrapper.prototype.createElement = function (reactComponent, props) {
        var _this = this;
        return _super.prototype.createElement.call(this, this.wrapperComponent, {
            initialProps: props,
            CustomComponentClass: reactComponent,
            setMethods: function (methods) { return _this.setMethods(methods); },
            addUpdateCallback: function (callback) {
                // this hooks up `CustomWrapperComp` to allow props updates to be pushed to the custom component
                _this.updateCallback = function () {
                    callback(_this.getProps());
                    return new ag_grid_community_1.AgPromise(function (resolve) {
                        // ensure prop updates have happened
                        setTimeout(function () {
                            resolve();
                        });
                    });
                };
                _this.resolveUpdateCallback();
            }
        });
    };
    CustomComponentWrapper.prototype.setMethods = function (methods) {
        this.providedMethods = methods;
        addOptionalMethods(this.getOptionalMethods(), this.providedMethods, this);
    };
    CustomComponentWrapper.prototype.getOptionalMethods = function () {
        return [];
    };
    CustomComponentWrapper.prototype.getProps = function () {
        return __assign(__assign({}, this.sourceParams), { key: this.key, ref: this.ref });
    };
    CustomComponentWrapper.prototype.refreshProps = function () {
        var _this = this;
        if (this.updateCallback) {
            return this.updateCallback();
        }
        // `refreshProps` is assigned in an effect. It's possible it hasn't been run before the first usage, so wait.
        return new ag_grid_community_1.AgPromise(function (resolve) { return _this.awaitUpdateCallback.then(function () {
            _this.updateCallback().then(function () { return resolve(); });
        }); });
    };
    return CustomComponentWrapper;
}(reactComponent_1.ReactComponent));
exports.CustomComponentWrapper = CustomComponentWrapper;
