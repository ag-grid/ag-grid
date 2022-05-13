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
import { AgChart, ChartAxisPosition } from "ag-charts-community";
import { _ } from "@ag-grid-community/core";
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
    ComboChartProxy.prototype.createChart = function () {
        return AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    };
    ComboChartProxy.prototype.update = function (params) {
        var category = params.category, data = params.data;
        var options = {
            data: this.transformData(data, category.id)
        };
        if (this.seriesChanged(params)) {
            options.series = this.getSeriesOptions(params);
            options.axes = this.getAxes(params);
        }
        AgChart.update(this.chart, options);
    };
    ComboChartProxy.prototype.seriesChanged = function (params) {
        var seriesChartTypes = params.seriesChartTypes;
        var seriesChartTypesChanged = !_.areEqual(this.prevSeriesChartTypes, seriesChartTypes, function (s1, s2) { return s1.colId === s2.colId && s1.chartType === s2.chartType && s1.secondaryAxis === s2.secondaryAxis; });
        // cache a cloned copy of `seriesChartTypes` for subsequent comparisons
        this.prevSeriesChartTypes = seriesChartTypes.map(function (s) { return (__assign({}, s)); });
        // check if any fields have changed
        var fields = params.fields.map(function (f) { return f.colId; }).join();
        var fieldsChanged = this.prevFields !== fields;
        this.prevFields = fields;
        // check if the category has changed
        var categoryId = params.category.id;
        var categoryChanged = this.prevCategoryId !== categoryId;
        this.prevCategoryId = categoryId;
        return seriesChartTypesChanged || fieldsChanged || categoryChanged;
    };
    ComboChartProxy.prototype.getSeriesOptions = function (params) {
        var _this = this;
        var fields = params.fields, category = params.category, seriesChartTypes = params.seriesChartTypes;
        return fields.map(function (field) {
            var seriesChartType = seriesChartTypes.find(function (s) { return s.colId === field.colId; });
            if (seriesChartType) {
                var chartType = seriesChartType.chartType;
                return __assign(__assign({}, _this.extractSeriesOverrides(seriesChartType)), { type: getSeriesType(chartType), xKey: category.id, yKey: field.colId, yName: field.displayName, grouped: ['groupedColumn', 'groupedBar', 'groupedArea'].includes(chartType), stacked: ['stackedArea', 'stackedColumn'].includes(chartType) });
            }
        });
    };
    ComboChartProxy.prototype.getAxes = function (updateParams) {
        var _this = this;
        this.xAxisType = updateParams.grouping ? 'groupedCategory' : 'category';
        var fields = updateParams ? updateParams.fields : [];
        var fieldsMap = new Map(fields.map(function (f) { return [f.colId, f]; }));
        var _a = this.getYKeys(fields, updateParams.seriesChartTypes), primaryYKeys = _a.primaryYKeys, secondaryYKeys = _a.secondaryYKeys;
        var _b = this.getAxisOptions(), bottomOptions = _b.bottomOptions, leftOptions = _b.leftOptions, rightOptions = _b.rightOptions;
        var axes = [
            __assign(__assign({}, bottomOptions), { type: this.xAxisType, position: ChartAxisPosition.Bottom, gridStyle: [
                    { strokeWidth: 0 },
                ] }),
        ];
        if (primaryYKeys.length > 0) {
            axes.push(__assign(__assign({}, leftOptions), { type: this.yAxisType, keys: primaryYKeys, position: ChartAxisPosition.Left, title: __assign({}, deepMerge(leftOptions.title, {
                    enabled: true,
                    text: primaryYKeys.map(function (key) {
                        var field = fieldsMap.get(key);
                        return field ? field.displayName : key;
                    }).join(' / '),
                })) }));
        }
        if (secondaryYKeys.length > 0) {
            secondaryYKeys.forEach(function (secondaryYKey, i) {
                var field = fieldsMap.get(secondaryYKey);
                var secondaryAxisIsVisible = field && field.colId === secondaryYKey;
                if (!secondaryAxisIsVisible) {
                    return;
                }
                var secondaryAxisOptions = __assign(__assign({}, rightOptions), { type: _this.yAxisType, keys: [secondaryYKey], position: ChartAxisPosition.Right, title: __assign({}, deepMerge(rightOptions.title, {
                        enabled: true,
                        text: field ? field.displayName : secondaryYKey,
                    })) });
                var primaryYAxis = primaryYKeys.some(function (primaryYKey) { return !!fieldsMap.get(primaryYKey); });
                var lastSecondaryAxis = i === secondaryYKeys.length - 1;
                if (!primaryYAxis && lastSecondaryAxis) {
                    // don't remove grid lines from the secondary axis closest to the chart, i.e. last supplied
                }
                else {
                    secondaryAxisOptions.gridStyle = [
                        { strokeWidth: 0 },
                    ];
                }
                axes.push(secondaryAxisOptions);
            });
        }
        return axes;
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
    ComboChartProxy.prototype.extractSeriesOverrides = function (seriesChartType) {
        var seriesOverrides = this.chartOptions[getSeriesType(seriesChartType.chartType)].series;
        // TODO: remove once `yKeys` and `yNames` have been removed from the options
        delete seriesOverrides.yKeys;
        delete seriesOverrides.yNames;
        return seriesOverrides;
    };
    return ComboChartProxy;
}(CartesianChartProxy));
export { ComboChartProxy };
//# sourceMappingURL=comboChartProxy.js.map