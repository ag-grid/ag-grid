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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoxPlotChartProxy = void 0;
var seriesTypeMapper_1 = require("../../utils/seriesTypeMapper");
var statisticalChartProxy_1 = require("./statisticalChartProxy");
var BoxPlotChartProxy = /** @class */ (function (_super) {
    __extends(BoxPlotChartProxy, _super);
    function BoxPlotChartProxy(params) {
        return _super.call(this, params) || this;
    }
    BoxPlotChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var _a = __read(params.categories, 1), category = _a[0];
        return params.fields.map(function (field, seriesIndex) {
            var _a;
            return ({
                type: _this.standaloneChartType,
                direction: (0, seriesTypeMapper_1.isHorizontal)(_this.chartType) ? 'horizontal' : 'vertical',
                // xKey/xName refer to category buckets
                xKey: category.id,
                xName: category.name,
                // yName is used to label the series
                yName: (_a = field.displayName) !== null && _a !== void 0 ? _a : undefined,
                // custom field labels shown in the tooltip
                minName: 'Min',
                q1Name: 'Q1',
                medianName: 'Median',
                q3Name: 'Q3',
                maxName: 'Max',
                // generated 'synthetic fields' from getData()
                minKey: "min:".concat(seriesIndex),
                q1Key: "q1:".concat(seriesIndex),
                medianKey: "median:".concat(seriesIndex),
                q3Key: "q3:".concat(seriesIndex),
                maxKey: "max:".concat(seriesIndex),
            });
        });
    };
    BoxPlotChartProxy.prototype.getData = function (params) {
        var _this = this;
        return this.computeSeriesStatistics(params, function (seriesValues) {
            var sortedValues = seriesValues.sort(function (a, b) { return a - b; });
            return {
                min: sortedValues[0],
                q1: _this.quantile(sortedValues, 0.25),
                median: _this.quantile(sortedValues, 0.5),
                q3: _this.quantile(sortedValues, 0.75),
                max: sortedValues[sortedValues.length - 1],
            };
        });
    };
    BoxPlotChartProxy.prototype.quantile = function (sortedValues, q) {
        var position = (sortedValues.length - 1) * q;
        var indexBelow = Math.floor(position);
        var aboveValue = position - indexBelow;
        if (sortedValues[indexBelow + 1] !== undefined) {
            return sortedValues[indexBelow] + aboveValue * (sortedValues[indexBelow + 1] - sortedValues[indexBelow]);
        }
        return sortedValues[indexBelow];
    };
    return BoxPlotChartProxy;
}(statisticalChartProxy_1.StatisticalChartProxy));
exports.BoxPlotChartProxy = BoxPlotChartProxy;
