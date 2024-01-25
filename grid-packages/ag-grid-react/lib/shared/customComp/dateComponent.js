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
exports.DateComponent = void 0;
var customComponent_1 = require("./customComponent");
var DateComponent = /** @class */ (function (_super) {
    __extends(DateComponent, _super);
    function DateComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.date = null;
        return _this;
    }
    DateComponent.prototype.getDate = function () {
        return this.date;
    };
    DateComponent.prototype.setDate = function (date) {
        this.date = date;
        this.refreshProps();
    };
    DateComponent.prototype.refresh = function (params) {
        this.sourceParams = params;
        this.refreshProps();
    };
    DateComponent.prototype.getOptionalMethods = function () {
        return ['afterGuiAttached', 'setInputPlaceholder', 'setInputAriaLabel', 'setDisabled'];
    };
    DateComponent.prototype.updateDate = function (date) {
        this.setDate(date);
        this.sourceParams.onDateChanged();
    };
    DateComponent.prototype.getProps = function () {
        var _this = this;
        var props = __assign(__assign({}, this.sourceParams), { date: this.date, onDateChange: function (date) { return _this.updateDate(date); }, key: this.key });
        // remove props in IDataParams but not BaseDateParams
        delete props.onDateChanged;
        return props;
    };
    return DateComponent;
}(customComponent_1.CustomComponent));
exports.DateComponent = DateComponent;
