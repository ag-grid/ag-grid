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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeChartProxy = void 0;
var statisticalChartProxy_1 = require("./statisticalChartProxy");
var RangeChartProxy = /** @class */ (function (_super) {
    __extends(RangeChartProxy, _super);
    function RangeChartProxy(params) {
        return _super.call(this, params) || this;
    }
    RangeChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var _a = __read(params.categories, 1), category = _a[0];
        return params.fields.map(function (field, seriesIndex) {
            var _a;
            return ({
                type: _this.standaloneChartType,
                // xKey/xName refer to category buckets
                xKey: category.id,
                xName: category.name,
                // yName is used to label the series
                yName: (_a = field.displayName) !== null && _a !== void 0 ? _a : undefined,
                // custom field labels shown in the tooltip
                yLowName: 'Min',
                yHighName: 'Max',
                // generated 'synthetic fields' from getData()
                yLowKey: "min:".concat(seriesIndex),
                yHighKey: "max:".concat(seriesIndex),
            });
        });
    };
    RangeChartProxy.prototype.getData = function (params) {
        return this.computeSeriesStatistics(params, function (seriesValues) {
            return {
                min: Math.min.apply(Math, __spreadArray([], __read(seriesValues), false)),
                max: Math.max.apply(Math, __spreadArray([], __read(seriesValues), false)),
            };
        });
    };
    return RangeChartProxy;
}(statisticalChartProxy_1.StatisticalChartProxy));
exports.RangeChartProxy = RangeChartProxy;
