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
exports.DateComponentWrapper = void 0;
var customComponentWrapper_1 = require("./customComponentWrapper");
var DateComponentWrapper = /** @class */ (function (_super) {
    __extends(DateComponentWrapper, _super);
    function DateComponentWrapper() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.date = null;
        _this.onDateChange = function (date) { return _this.updateDate(date); };
        return _this;
    }
    DateComponentWrapper.prototype.getDate = function () {
        return this.date;
    };
    DateComponentWrapper.prototype.setDate = function (date) {
        this.date = date;
        this.refreshProps();
    };
    DateComponentWrapper.prototype.refresh = function (params) {
        this.sourceParams = params;
        this.refreshProps();
    };
    DateComponentWrapper.prototype.getOptionalMethods = function () {
        return ['afterGuiAttached', 'setInputPlaceholder', 'setInputAriaLabel', 'setDisabled'];
    };
    DateComponentWrapper.prototype.updateDate = function (date) {
        this.setDate(date);
        // don't need to wait on `refreshProps` as not reliant on state maintained inside React
        this.sourceParams.onDateChanged();
    };
    DateComponentWrapper.prototype.getProps = function () {
        var props = _super.prototype.getProps.call(this);
        props.date = this.date;
        props.onDateChange = this.onDateChange;
        // remove props in IDataParams but not BaseDateParams
        delete props.onDateChanged;
        return props;
    };
    return DateComponentWrapper;
}(customComponentWrapper_1.CustomComponentWrapper));
exports.DateComponentWrapper = DateComponentWrapper;
