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
import { ChartAxisPosition } from "ag-charts-community";
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { getSeriesType } from "../../utils/seriesTypeMapper";
var ComboChartProxy = /** @class */ (function (_super) {
    __extends(ComboChartProxy, _super);
    function ComboChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        _this.yAxisType = 'number';
        _this.recreateChart();
        return _this;
    }
    ComboChartProxy.prototype.getData = function (params) {
        return this.getDataTransformedData(params);
    };
    ComboChartProxy.prototype.getAxes = function (params) {
        var _this = this;
        var _a;
        var fields = params ? params.fields : [];
        var fieldsMap = new Map(fields.map(function (f) { return [f.colId, f]; }));
        var _b = this.getYKeys(fields, params.seriesChartTypes), primaryYKeys = _b.primaryYKeys, secondaryYKeys = _b.secondaryYKeys;
        var _c = this.getAxisOptions(), bottomOptions = _c.bottomOptions, leftOptions = _c.leftOptions, rightOptions = _c.rightOptions;
        var axes = [
            __assign(__assign({}, bottomOptions), { type: this.xAxisType, position: ChartAxisPosition.Bottom, gridStyle: [{ stroke: undefined }] }),
        ];
        if (primaryYKeys.length > 0) {
            axes.push(__assign(__assign({}, leftOptions), { type: this.yAxisType, keys: primaryYKeys, position: ChartAxisPosition.Left, title: __assign({}, deepMerge(leftOptions.title, {
                    enabled: (_a = leftOptions.title) === null || _a === void 0 ? void 0 : _a.enabled,
                    text: primaryYKeys.map(function (key) {
                        var field = fieldsMap.get(key);
                        return field ? field.displayName : key;
                    }).join(' / '),
                })) }));
        }
        if (secondaryYKeys.length > 0) {
            secondaryYKeys.forEach(function (secondaryYKey, i) {
                var _a;
                var field = fieldsMap.get(secondaryYKey);
                var secondaryAxisIsVisible = field && field.colId === secondaryYKey;
                if (!secondaryAxisIsVisible) {
                    return;
                }
                var secondaryAxisOptions = __assign(__assign({}, rightOptions), { type: _this.yAxisType, keys: [secondaryYKey], position: ChartAxisPosition.Right, title: __assign({}, deepMerge(rightOptions.title, {
                        enabled: (_a = rightOptions.title) === null || _a === void 0 ? void 0 : _a.enabled,
                        text: field ? field.displayName : secondaryYKey,
                    })) });
                var primaryYAxis = primaryYKeys.some(function (primaryYKey) { return !!fieldsMap.get(primaryYKey); });
                var lastSecondaryAxis = i === secondaryYKeys.length - 1;
                if (!primaryYAxis && lastSecondaryAxis) {
                    // don't remove grid lines from the secondary axis closest to the chart, i.e. last supplied
                }
                else {
                    secondaryAxisOptions.gridStyle = [{ stroke: undefined }];
                }
                axes.push(secondaryAxisOptions);
            });
        }
        return axes;
    };
    ComboChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var fields = params.fields, category = params.category, seriesChartTypes = params.seriesChartTypes;
        return fields.map(function (field) {
            var seriesChartType = seriesChartTypes.find(function (s) { return s.colId === field.colId; });
            if (seriesChartType) {
                var chartType = seriesChartType.chartType;
                return __assign(__assign({}, _this.extractSeriesOverrides(getSeriesType(seriesChartType.chartType))), { type: getSeriesType(chartType), xKey: category.id, yKey: field.colId, yName: field.displayName, grouped: ['groupedColumn', 'groupedBar', 'groupedArea'].includes(chartType), stacked: ['stackedArea', 'stackedColumn'].includes(chartType) });
            }
        });
    };
    ComboChartProxy.prototype.getAxisOptions = function () {
        var axisOptions = this.getAxesOptions('cartesian');
        return {
            bottomOptions: deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
            leftOptions: deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
            rightOptions: deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].right),
        };
    };
    ComboChartProxy.prototype.getYKeys = function (fields, seriesChartTypes) {
        var primaryYKeys = [];
        var secondaryYKeys = [];
        fields.forEach(function (field) {
            var colId = field.colId;
            var seriesChartType = seriesChartTypes.find(function (s) { return s.colId === colId; });
            if (seriesChartType) {
                seriesChartType.secondaryAxis ? secondaryYKeys.push(colId) : primaryYKeys.push(colId);
            }
        });
        return { primaryYKeys: primaryYKeys, secondaryYKeys: secondaryYKeys };
    };
    return ComboChartProxy;
}(CartesianChartProxy));
export { ComboChartProxy };
