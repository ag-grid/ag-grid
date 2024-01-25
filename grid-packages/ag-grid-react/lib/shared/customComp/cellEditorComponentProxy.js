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
exports.CellEditorComponentProxy = void 0;
var ag_grid_community_1 = require("ag-grid-community");
var customComponentWrapper_1 = require("./customComponentWrapper");
var CellEditorComponentProxy = /** @class */ (function () {
    function CellEditorComponentProxy(cellEditorParams, refreshProps) {
        var _this = this;
        this.cellEditorParams = cellEditorParams;
        this.refreshProps = refreshProps;
        this.instanceCreated = new ag_grid_community_1.AgPromise(function (resolve) {
            _this.resolveInstanceCreated = resolve;
        });
        this.value = cellEditorParams.value;
    }
    CellEditorComponentProxy.prototype.getProps = function () {
        var _this = this;
        return __assign(__assign({}, this.cellEditorParams), { initialValue: this.cellEditorParams.value, value: this.value, onValueChange: function (value) { return _this.updateValue(value); } });
    };
    CellEditorComponentProxy.prototype.getValue = function () {
        return this.value;
    };
    CellEditorComponentProxy.prototype.refresh = function (params) {
        this.cellEditorParams = params;
        this.refreshProps();
    };
    CellEditorComponentProxy.prototype.setMethods = function (methods) {
        customComponentWrapper_1.addOptionalMethods(this.getOptionalMethods(), methods, this);
    };
    CellEditorComponentProxy.prototype.getInstance = function () {
        var _this = this;
        return this.instanceCreated.then(function () { return _this.componentInstance; });
    };
    CellEditorComponentProxy.prototype.setRef = function (componentInstance) {
        var _a;
        this.componentInstance = componentInstance;
        (_a = this.resolveInstanceCreated) === null || _a === void 0 ? void 0 : _a.call(this);
        this.resolveInstanceCreated = undefined;
    };
    CellEditorComponentProxy.prototype.getOptionalMethods = function () {
        return ['isPopup', 'isCancelBeforeStart', 'isCancelAfterEnd', 'getPopupPosition', 'focusIn', 'focusOut', 'afterGuiAttached'];
    };
    CellEditorComponentProxy.prototype.updateValue = function (value) {
        this.value = value;
        this.refreshProps();
    };
    return CellEditorComponentProxy;
}());
exports.CellEditorComponentProxy = CellEditorComponentProxy;
