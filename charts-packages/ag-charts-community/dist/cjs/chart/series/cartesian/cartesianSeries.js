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
var series_1 = require("../series");
var chartAxis_1 = require("../../chartAxis");
var seriesMarker_1 = require("../seriesMarker");
var CartesianSeries = /** @class */ (function (_super) {
    __extends(CartesianSeries, _super);
    function CartesianSeries() {
        var _a;
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.directionKeys = (_a = {},
            _a[chartAxis_1.ChartAxisDirection.X] = ['xKey'],
            _a[chartAxis_1.ChartAxisDirection.Y] = ['yKey'],
            _a);
        return _this;
    }
    return CartesianSeries;
}(series_1.Series));
exports.CartesianSeries = CartesianSeries;
var CartesianSeriesMarker = /** @class */ (function (_super) {
    __extends(CartesianSeriesMarker, _super);
    function CartesianSeriesMarker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CartesianSeriesMarker;
}(seriesMarker_1.SeriesMarker));
exports.CartesianSeriesMarker = CartesianSeriesMarker;
//# sourceMappingURL=cartesianSeries.js.map