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
exports.SunburstChartProxy = void 0;
var hierarchicalChartProxy_1 = require("./hierarchicalChartProxy");
var SunburstChartProxy = /** @class */ (function (_super) {
    __extends(SunburstChartProxy, _super);
    function SunburstChartProxy(params) {
        return _super.call(this, params) || this;
    }
    SunburstChartProxy.prototype.getSeries = function (params, labelKey) {
        var _a, _b;
        var fields = params.fields;
        // Sunburst charts support up to two input series, corresponding to size and color respectively
        var _c = __read(fields, 2), sizeField = _c[0], colorField = _c[1];
        // Combine the size and color series into a single composite series
        return [
            {
                type: this.standaloneChartType,
                // The label key is generated internally by the hierarchy processing and is not user-configurable
                labelKey: labelKey,
                // Size and color fields are inferred from the range data
                sizeKey: sizeField === null || sizeField === void 0 ? void 0 : sizeField.colId,
                sizeName: (_a = sizeField === null || sizeField === void 0 ? void 0 : sizeField.displayName) !== null && _a !== void 0 ? _a : undefined,
                colorKey: colorField === null || colorField === void 0 ? void 0 : colorField.colId,
                colorName: (_b = colorField === null || colorField === void 0 ? void 0 : colorField.displayName) !== null && _b !== void 0 ? _b : undefined,
            },
        ];
    };
    SunburstChartProxy.prototype.getChartThemeDefaults = function () {
        return {
            sunburst: {
                gradientLegend: {
                    gradient: {
                        preferredLength: 200,
                    },
                },
            },
        };
    };
    SunburstChartProxy.prototype.transformData = function (data, categoryKey, categoryAxis) {
        // Ignore the base implementation as it assumes only a single category axis
        // (this method is never actually invoked)
        return data;
    };
    SunburstChartProxy.prototype.crossFilteringReset = function () {
        // cross filtering is not currently supported in sunburst charts
    };
    return SunburstChartProxy;
}(hierarchicalChartProxy_1.HierarchicalChartProxy));
exports.SunburstChartProxy = SunburstChartProxy;
