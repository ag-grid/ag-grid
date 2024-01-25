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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterComponent = void 0;
var customComponent_1 = require("./customComponent");
var FilterComponent = /** @class */ (function (_super) {
    __extends(FilterComponent, _super);
    function FilterComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.model = null;
        return _this;
    }
    FilterComponent.prototype.isFilterActive = function () {
        return this.model != null;
    };
    FilterComponent.prototype.doesFilterPass = function (params) {
        return this.providedMethods.doesFilterPass(params);
    };
    FilterComponent.prototype.getModel = function () {
        return this.model;
    };
    FilterComponent.prototype.setModel = function (model) {
        this.model = model;
        this.refreshProps();
    };
    FilterComponent.prototype.refresh = function (newParams) {
        this.sourceParams = newParams;
        this.refreshProps();
        return true;
    };
    FilterComponent.prototype.getOptionalMethods = function () {
        return ['afterGuiAttached', 'afterGuiDetached', 'onNewRowsLoaded', 'getModelAsString', 'onAnyFilterChanged'];
    };
    FilterComponent.prototype.updateModel = function (model) {
        var _this = this;
        this.setModel(model);
        setTimeout(function () {
            // ensure prop updates have happened
            _this.sourceParams.filterChangedCallback();
        });
    };
    FilterComponent.prototype.getProps = function () {
        var _this = this;
        var props = __assign(__assign({}, this.sourceParams), { model: this.model, onModelChange: function (model) { return _this.updateModel(model); }, onUiChange: function () { return _this.sourceParams.filterChangedCallback(); }, key: this.key });
        // remove props in IFilterParams but not CustomFilterProps
        delete props.filterChangedCallback;
        delete props.filterModifiedCallback;
        delete props.valueGetter;
        return props;
    };
    return FilterComponent;
}(customComponent_1.CustomComponent));
exports.FilterComponent = FilterComponent;
