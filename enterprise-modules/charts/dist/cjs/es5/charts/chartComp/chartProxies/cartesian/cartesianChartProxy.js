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
var chartProxy_1 = require("../chartProxy");
var ag_charts_community_1 = require("ag-charts-community");
var CartesianChartProxy = /** @class */ (function (_super) {
    __extends(CartesianChartProxy, _super);
    function CartesianChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.supportsAxesUpdates = true;
        _this.axisTypeToClassMap = {
            number: ag_charts_community_1.NumberAxis,
            category: ag_charts_community_1.CategoryAxis,
            groupedCategory: ag_charts_community_1.GroupedCategoryAxis,
            time: ag_charts_community_1.TimeAxis,
        };
        _this.crossFilteringAllPoints = new Set();
        _this.crossFilteringSelectedPoints = [];
        return _this;
    }
    CartesianChartProxy.prototype.createChart = function () {
        return ag_charts_community_1.AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    };
    CartesianChartProxy.prototype.update = function (params) {
        if (this.supportsAxesUpdates) {
            this.updateAxes(params);
        }
        var options = __assign(__assign({}, this.getCommonChartOptions()), { data: this.getData(params), axes: this.getAxes(params), series: this.getSeries(params) });
        if (this.crossFiltering) {
            options = this.addCrossFilterOptions(options);
        }
        ag_charts_community_1.AgChart.update(this.chart, options);
    };
    CartesianChartProxy.prototype.getDataTransformedData = function (params) {
        var isCategoryAxis = this.xAxisType === 'category';
        return this.transformData(params.data, params.category.id, isCategoryAxis);
    };
    CartesianChartProxy.prototype.addCrossFilterOptions = function (options) {
        var _this = this;
        var seriesOverrides = this.extractSeriesOverrides();
        options.tooltip = __assign(__assign({}, options.tooltip), { delay: 500 });
        options.legend = __assign(__assign(__assign({}, options.legend), seriesOverrides.legend), { listeners: {
                legendItemClick: function (e) {
                    _this.chart.series.forEach(function (s) {
                        s.toggleSeriesItem(e.itemId, e.enabled);
                        s.toggleSeriesItem(e.itemId + "-filtered-out", e.enabled);
                    });
                }
            } });
        return options;
    };
    CartesianChartProxy.prototype.extractSeriesOverrides = function (chartSeriesType) {
        var seriesOverrides = this.chartOptions[chartSeriesType ? chartSeriesType : this.standaloneChartType].series;
        // TODO: remove once `yKeys` and `yNames` have been removed from the options
        delete seriesOverrides.yKeys;
        delete seriesOverrides.yNames;
        return seriesOverrides;
    };
    CartesianChartProxy.prototype.updateAxes = function (params) {
        // when grouping recreate chart if the axis is not a 'groupedCategory', otherwise return
        if (params.grouping) {
            if (!(this.axisTypeToClassMap[this.xAxisType] === ag_charts_community_1.GroupedCategoryAxis)) {
                this.xAxisType = 'groupedCategory';
                this.recreateChart();
            }
            return;
        }
        // only update axis has changed and recreate the chart, i.e. switching from 'category' to 'time' axis
        var newXAxisType = CartesianChartProxy.isTimeAxis(params) ? 'time' : 'category';
        if (newXAxisType !== this.xAxisType) {
            this.xAxisType = newXAxisType;
            this.recreateChart();
        }
    };
    CartesianChartProxy.prototype.getAxesOptions = function (chartSeriesType) {
        if (chartSeriesType === void 0) { chartSeriesType = this.standaloneChartType; }
        return this.chartOptions[chartSeriesType].axes;
    };
    CartesianChartProxy.isTimeAxis = function (params) {
        if (params.category && params.category.chartDataType) {
            return params.category.chartDataType === 'time';
        }
        var testDatum = params.data[0];
        return (testDatum && testDatum[params.category.id]) instanceof Date;
    };
    CartesianChartProxy.prototype.crossFilteringReset = function () {
        this.crossFilteringSelectedPoints = [];
        this.crossFilteringAllPoints.clear();
    };
    CartesianChartProxy.prototype.crossFilteringPointSelected = function (point) {
        return this.crossFilteringSelectedPoints.length == 0 || this.crossFilteringSelectedPoints.includes(point);
    };
    CartesianChartProxy.prototype.crossFilteringDeselectedPoints = function () {
        return this.crossFilteringSelectedPoints.length > 0 &&
            this.crossFilteringAllPoints.size !== this.crossFilteringSelectedPoints.length;
    };
    CartesianChartProxy.prototype.extractLineAreaCrossFilterSeries = function (series, params) {
        var _this = this;
        var getYKey = function (yKey) {
            if (_this.standaloneChartType === 'area') {
                var lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
                return (lastSelectedChartId === params.chartId) ? yKey + '-total' : yKey;
            }
            return yKey + '-total';
        };
        return series.map(function (s) {
            var seriesOverrides = _this.extractSeriesOverrides();
            s.yKey = getYKey(s.yKey);
            s.listeners = __assign(__assign({}, seriesOverrides.listeners), { nodeClick: function (e) {
                    var value = e.datum[s.xKey];
                    var multiSelection = e.event.metaKey || e.event.ctrlKey;
                    _this.crossFilteringAddSelectedPoint(multiSelection, value);
                    _this.crossFilterCallback(e);
                } });
            s.marker = {
                formatter: function (p) {
                    var category = p.datum[params.category.id];
                    return {
                        fill: p.highlighted ? 'yellow' : p.fill,
                        size: p.highlighted ? 14 : _this.crossFilteringPointSelected(category) ? 8 : 0,
                    };
                }
            };
            if (_this.standaloneChartType === 'area') {
                s.fillOpacity = _this.crossFilteringDeselectedPoints() ? 0.3 : 1;
            }
            if (_this.standaloneChartType === 'line') {
                s.strokeOpacity = _this.crossFilteringDeselectedPoints() ? 0.3 : 1;
            }
            return s;
        });
    };
    CartesianChartProxy.prototype.getLineAreaCrossFilterData = function (params) {
        var _this = this;
        this.crossFilteringAllPoints.clear();
        var colId = params.fields[0].colId;
        var filteredOutColId = colId + "-filtered-out";
        var lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
        return params.data.map(function (d) {
            var category = d[params.category.id];
            _this.crossFilteringAllPoints.add(category);
            var pointSelected = _this.crossFilteringPointSelected(category);
            if (_this.standaloneChartType === 'area' && lastSelectedChartId === params.chartId) {
                d[colId + "-total"] = pointSelected ? d[colId] : d[colId] + d[filteredOutColId];
            }
            if (_this.standaloneChartType === 'line') {
                d[colId + "-total"] = pointSelected ? d[colId] : d[colId] + d[filteredOutColId];
            }
            return d;
        });
    };
    CartesianChartProxy.prototype.crossFilteringAddSelectedPoint = function (multiSelection, value) {
        multiSelection ? this.crossFilteringSelectedPoints.push(value) : this.crossFilteringSelectedPoints = [value];
    };
    return CartesianChartProxy;
}(chartProxy_1.ChartProxy));
exports.CartesianChartProxy = CartesianChartProxy;
