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
exports.CellEditorComponent = void 0;
var ag_grid_community_1 = require("ag-grid-community");
var customComponent_1 = require("./customComponent");
var CellEditorComponent = /** @class */ (function () {
    function CellEditorComponent(cellEditorParams, refreshProps) {
        var _this = this;
        this.cellEditorParams = cellEditorParams;
        this.refreshProps = refreshProps;
        this.instanceCreated = new ag_grid_community_1.AgPromise(function (resolve) {
            _this.resolveInstanceCreated = resolve;
        });
        this.value = cellEditorParams.value;
    }
    CellEditorComponent.prototype.getProps = function () {
        var _this = this;
        return __assign(__assign({}, this.cellEditorParams), { initialValue: this.cellEditorParams.value, value: this.value, onValueChange: function (value) { return _this.updateValue(value); } });
    };
    CellEditorComponent.prototype.getValue = function () {
        return this.value;
    };
    CellEditorComponent.prototype.refresh = function (params) {
        this.cellEditorParams = params;
        this.refreshProps();
    };
    CellEditorComponent.prototype.setMethods = function (methods) {
        customComponent_1.addOptionalMethods(this.getOptionalMethods(), methods, this);
    };
    CellEditorComponent.prototype.getInstance = function () {
        var _this = this;
        return this.instanceCreated.then(function () { return _this.componentInstance; });
    };
    CellEditorComponent.prototype.setRef = function (componentInstance) {
        var _a;
        this.componentInstance = componentInstance;
        (_a = this.resolveInstanceCreated) === null || _a === void 0 ? void 0 : _a.call(this);
        this.resolveInstanceCreated = undefined;
    };
    CellEditorComponent.prototype.getOptionalMethods = function () {
        return ['isPopup', 'isCancelBeforeStart', 'isCancelAfterEnd', 'getPopupPosition', 'focusIn', 'focusOut', 'afterGuiAttached'];
    };
    CellEditorComponent.prototype.updateValue = function (value) {
        this.value = value;
        this.refreshProps();
    };
    return CellEditorComponent;
}());
exports.CellEditorComponent = CellEditorComponent;
