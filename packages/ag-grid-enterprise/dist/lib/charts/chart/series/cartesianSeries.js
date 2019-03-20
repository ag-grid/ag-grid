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
var CartesianSeries = /** @class */ (function (_super) {
    __extends(CartesianSeries, _super);
    function CartesianSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fieldPropertiesX = ['xField'];
        _this.fieldPropertiesY = ['yField'];
        _this._xField = null;
        _this._yField = null;
        return _this;
        // protected _xAxis: CartesianAxis | null = null;
        // protected _yAxis: CartesianAxis | null = null;
    }
    return CartesianSeries;
}(series_1.Series));
exports.CartesianSeries = CartesianSeries;
