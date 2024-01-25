// ag-grid-react v31.0.3
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingFilterComponent = void 0;
var ag_grid_community_1 = require("ag-grid-community");
var customComponent_1 = require("./customComponent");
var FloatingFilterComponent = /** @class */ (function () {
    function FloatingFilterComponent(floatingFilterParams, refreshProps) {
        this.floatingFilterParams = floatingFilterParams;
        this.refreshProps = refreshProps;
        this.model = null;
    }
    FloatingFilterComponent.prototype.getProps = function () {
        var _this = this;
        return __assign(__assign({}, this.floatingFilterParams), { model: this.model, onModelChange: function (model) { return _this.updateModel(model); } });
    };
    FloatingFilterComponent.prototype.onParentModelChanged = function (parentModel) {
        this.model = parentModel;
        this.refreshProps();
    };
    FloatingFilterComponent.prototype.refresh = function (params) {
        this.floatingFilterParams = params;
        this.refreshProps();
    };
    FloatingFilterComponent.prototype.setMethods = function (methods) {
        customComponent_1.addOptionalMethods(this.getOptionalMethods(), methods, this);
    };
    FloatingFilterComponent.prototype.getOptionalMethods = function () {
        return ['afterGuiAttached'];
    };
    FloatingFilterComponent.prototype.updateModel = function (model) {
        var _this = this;
        this.model = model;
        this.refreshProps();
        this.floatingFilterParams.parentFilterInstance(function (instance) {
            (instance.setModel(model) || ag_grid_community_1.AgPromise.resolve()).then(function () {
                _this.floatingFilterParams.filterParams.filterChangedCallback();
            });
        });
    };
    return FloatingFilterComponent;
}());
exports.FloatingFilterComponent = FloatingFilterComponent;
