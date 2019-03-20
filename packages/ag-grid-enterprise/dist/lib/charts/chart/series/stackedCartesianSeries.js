// ag-grid-enterprise v20.2.0
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var series_1 = require("./series");
var StackedCartesianSeries = /** @class */ (function (_super) {
    __extends(StackedCartesianSeries, _super);
    function StackedCartesianSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fieldPropertiesX = ['xField'];
        _this.fieldPropertiesY = ['yFields'];
        _this._xField = null;
        _this._yFields = [];
        _this._yFieldNames = [];
        _this._fullStack = false;
        // abstract set fullStack(value: boolean);
        // abstract get fullStack(): boolean;
        _this._fullStackTotal = 100;
        return _this;
        // abstract set fullStackTotal(value: number);
        // abstract get fullStackTotal(): number;
    }
    return StackedCartesianSeries;
}(series_1.Series));
exports.StackedCartesianSeries = StackedCartesianSeries;
