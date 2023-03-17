"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
exports.AreaChartProxy = void 0;
var cartesianChartProxy_1 = require("./cartesianChartProxy");
var AreaChartProxy = /** @class */ (function (_super) {
    __extends(AreaChartProxy, _super);
    function AreaChartProxy(params) {
        return _super.call(this, params) || this;
    }
    AreaChartProxy.prototype.getAxes = function (params) {
        var axes = [
            {
                type: this.getXAxisType(params),
                position: 'bottom',
            },
            {
                type: 'number',
                position: 'left',
            },
        ];
        // Add a default label formatter to show '%' for normalized charts if none is provided
        if (this.isNormalised()) {
            var numberAxis = axes[1];
            numberAxis.label = __assign(__assign({}, numberAxis.label), { formatter: function (params) { return Math.round(params.value) + '%'; } });
        }
        return axes;
    };
    AreaChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var series = params.fields.map(function (f) { return ({
            type: _this.standaloneChartType,
            xKey: params.category.id,
            xName: params.category.name,
            yKey: f.colId,
            yName: f.displayName,
            normalizedTo: _this.chartType === 'normalizedArea' ? 100 : undefined,
            stacked: ['normalizedArea', 'stackedArea'].includes(_this.chartType)
        }); });
        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    };
    AreaChartProxy.prototype.isNormalised = function () {
        return !this.crossFiltering && this.chartType === 'normalizedArea';
    };
    return AreaChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.AreaChartProxy = AreaChartProxy;
