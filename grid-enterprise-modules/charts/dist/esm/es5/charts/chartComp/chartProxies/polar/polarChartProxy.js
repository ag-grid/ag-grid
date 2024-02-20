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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { ChartProxy } from '../chartProxy';
import { AgCharts } from 'ag-charts-community';
var PolarChartProxy = /** @class */ (function (_super) {
    __extends(PolarChartProxy, _super);
    function PolarChartProxy(params) {
        return _super.call(this, params) || this;
    }
    PolarChartProxy.prototype.getAxes = function (_) {
        var radialBar = this.standaloneChartType === 'radial-bar';
        return [
            { type: radialBar ? 'angle-number' : 'angle-category' },
            { type: radialBar ? 'radius-category' : 'radius-number' },
        ];
    };
    PolarChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var fields = params.fields;
        var _a = __read(params.categories, 1), category = _a[0];
        var radialBar = this.standaloneChartType === 'radial-bar';
        return fields.map(function (f) {
            var _a, _b;
            return ({
                type: _this.standaloneChartType,
                angleKey: radialBar ? f.colId : category.id,
                angleName: radialBar ? ((_a = f.displayName) !== null && _a !== void 0 ? _a : undefined) : category.name,
                radiusKey: radialBar ? category.id : f.colId,
                radiusName: radialBar ? category.name : ((_b = f.displayName) !== null && _b !== void 0 ? _b : undefined),
            });
        });
    };
    PolarChartProxy.prototype.update = function (params) {
        var axes = this.getAxes(params);
        var options = __assign(__assign({}, this.getCommonChartOptions(params.updatedOverrides)), { data: this.getData(params, axes), axes: axes, series: this.getSeries(params) });
        AgCharts.update(this.getChartRef(), options);
    };
    PolarChartProxy.prototype.getData = function (params, axes) {
        var isCategoryAxis = axes.some(function (axis) { return axis.type === 'angle-category' || axis.type === 'radius-category'; });
        return this.getDataTransformedData(params, isCategoryAxis);
    };
    PolarChartProxy.prototype.getDataTransformedData = function (params, isCategoryAxis) {
        var _a = __read(params.categories, 1), category = _a[0];
        return this.transformData(params.data, category.id, isCategoryAxis);
    };
    PolarChartProxy.prototype.crossFilteringReset = function () {
        // cross filtering is not currently supported in polar charts
    };
    return PolarChartProxy;
}(ChartProxy));
export { PolarChartProxy };
