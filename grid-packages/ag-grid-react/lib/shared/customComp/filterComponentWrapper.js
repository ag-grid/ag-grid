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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterComponentWrapper = void 0;
var customComponentWrapper_1 = require("./customComponentWrapper");
var FilterComponentWrapper = /** @class */ (function (_super) {
    __extends(FilterComponentWrapper, _super);
    function FilterComponentWrapper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.model = null;
        _this.onModelChange = function (model) { return _this.updateModel(model); };
        _this.onUiChange = function () { return _this.sourceParams.filterChangedCallback(); };
        return _this;
    }
    FilterComponentWrapper.prototype.isFilterActive = function () {
        return this.model != null;
    };
    FilterComponentWrapper.prototype.doesFilterPass = function (params) {
        return this.providedMethods.doesFilterPass(params);
    };
    FilterComponentWrapper.prototype.getModel = function () {
        return this.model;
    };
    FilterComponentWrapper.prototype.setModel = function (model) {
        this.model = model;
        return this.refreshProps();
    };
    FilterComponentWrapper.prototype.refresh = function (newParams) {
        this.sourceParams = newParams;
        this.refreshProps();
        return true;
    };
    FilterComponentWrapper.prototype.getOptionalMethods = function () {
        return ['afterGuiAttached', 'afterGuiDetached', 'onNewRowsLoaded', 'getModelAsString', 'onAnyFilterChanged'];
    };
    FilterComponentWrapper.prototype.updateModel = function (model) {
        var _this = this;
        this.setModel(model).then(function () { return _this.sourceParams.filterChangedCallback(); });
    };
    FilterComponentWrapper.prototype.getProps = function () {
        var props = _super.prototype.getProps.call(this);
        props.model = this.model;
        props.onModelChange = this.onModelChange;
        props.onUiChange = this.onUiChange;
        // remove props in IFilterParams but not CustomFilterProps
        delete props.filterChangedCallback;
        delete props.filterModifiedCallback;
        delete props.valueGetter;
        return props;
    };
    return FilterComponentWrapper;
}(customComponentWrapper_1.CustomComponentWrapper));
exports.FilterComponentWrapper = FilterComponentWrapper;
