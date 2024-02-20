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
exports.WaterfallChartProxy = void 0;
var cartesianChartProxy_1 = require("./cartesianChartProxy");
var seriesTypeMapper_1 = require("../../utils/seriesTypeMapper");
var WaterfallChartProxy = /** @class */ (function (_super) {
    __extends(WaterfallChartProxy, _super);
    function WaterfallChartProxy(params) {
        return _super.call(this, params) || this;
    }
    WaterfallChartProxy.prototype.getAxes = function (params) {
        return [
            {
                type: this.getXAxisType(params),
                position: (0, seriesTypeMapper_1.isHorizontal)(this.chartType) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: (0, seriesTypeMapper_1.isHorizontal)(this.chartType) ? 'bottom' : 'left',
            },
        ];
    };
    WaterfallChartProxy.prototype.getSeries = function (params) {
        var _a;
        var _b = __read(params.categories, 1), category = _b[0];
        var _c = __read(params.fields, 1), firstField = _c[0];
        var firstSeries = {
            type: this.standaloneChartType,
            direction: (0, seriesTypeMapper_1.isHorizontal)(this.chartType) ? 'horizontal' : 'vertical',
            xKey: category.id,
            xName: category.name,
            yKey: firstField.colId,
            yName: (_a = firstField.displayName) !== null && _a !== void 0 ? _a : undefined
        };
        return [firstSeries]; // waterfall only supports a single series!
    };
    return WaterfallChartProxy;
}(cartesianChartProxy_1.CartesianChartProxy));
exports.WaterfallChartProxy = WaterfallChartProxy;
