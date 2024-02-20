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
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { isHorizontal } from "../../utils/seriesTypeMapper";
import { ChartDataModel } from "../../model/chartDataModel";
var StatisticalChartProxy = /** @class */ (function (_super) {
    __extends(StatisticalChartProxy, _super);
    function StatisticalChartProxy(params) {
        return _super.call(this, params) || this;
    }
    StatisticalChartProxy.prototype.getAxes = function (params) {
        return [
            {
                type: this.getXAxisType(params),
                position: isHorizontal(this.chartType) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: isHorizontal(this.chartType) ? 'bottom' : 'left',
            },
        ];
    };
    StatisticalChartProxy.prototype.computeSeriesStatistics = function (params, computeStatsFn) {
        var data = params.data, fields = params.fields;
        var _a = __read(params.categories, 1), category = _a[0];
        var categoryKey = category.id || ChartDataModel.DEFAULT_CATEGORY;
        var groupedData = this.groupDataByCategory(categoryKey, data);
        return Array.from(groupedData).map(function (_a) {
            var _b;
            var _c = __read(_a, 2), categoryValue = _c[0], categoryData = _c[1];
            var categoryResult = (_b = {}, _b[category.id] = categoryValue, _b);
            fields.forEach(function (field, seriesIndex) {
                // `null` & `NaN` values are omitted from calculations
                var seriesValues = categoryData
                    .map(function (datum) { return datum[field.colId]; })
                    .filter(function (value) { return typeof value === 'number' && !isNaN(value); });
                Object.entries(computeStatsFn(seriesValues)).forEach(function (_a) {
                    var _b = __read(_a, 2), statKey = _b[0], value = _b[1];
                    var propertyKey = "".concat(statKey, ":").concat(seriesIndex);
                    // when no data exists, stat properties are added to results with `null` values!
                    categoryResult[propertyKey] = seriesValues.length > 0 ? value : null;
                });
            });
            return categoryResult;
        });
    };
    StatisticalChartProxy.prototype.groupDataByCategory = function (categoryKey, data) {
        var getCategory = function (datum) {
            if (categoryKey === ChartDataModel.DEFAULT_CATEGORY) {
                return 1;
            }
            var categoryValue = datum[categoryKey];
            if (categoryValue === null || categoryValue === undefined) {
                return ''; // use a blank category for `null` or `undefined` values
            }
            return categoryValue instanceof Date ? categoryValue.getTime() : categoryValue;
        };
        return data.reduce(function (acc, datum) {
            var category = getCategory(datum);
            var existingCategoryData = acc.get(category);
            if (existingCategoryData) {
                existingCategoryData.push(datum);
            }
            else {
                acc.set(category, [datum]);
            }
            return acc;
        }, new Map());
    };
    return StatisticalChartProxy;
}(CartesianChartProxy));
export { StatisticalChartProxy };
