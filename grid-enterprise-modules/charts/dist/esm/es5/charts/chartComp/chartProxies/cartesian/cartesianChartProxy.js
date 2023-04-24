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
import { ChartProxy } from "../chartProxy";
import { AgChart, } from "ag-charts-community";
var CartesianChartProxy = /** @class */ (function (_super) {
    __extends(CartesianChartProxy, _super);
    function CartesianChartProxy(params) {
        var _this = _super.call(this, params) || this;
        _this.crossFilteringAllPoints = new Set();
        _this.crossFilteringSelectedPoints = [];
        return _this;
    }
    CartesianChartProxy.prototype.update = function (params) {
        var axes = this.getAxes(params);
        var options = __assign(__assign({}, this.getCommonChartOptions()), { data: this.getData(params, axes), axes: axes, series: this.getSeries(params) });
        AgChart.update(this.getChartRef(), options);
    };
    CartesianChartProxy.prototype.getData = function (params, axes) {
        var _a;
        var supportsCrossFiltering = ['area', 'line'].includes(this.standaloneChartType);
        var xPosition = this.standaloneChartType === 'bar' ? 'left' : 'bottom';
        var xAxisIsCategory = ((_a = axes.find(function (o) { return o.position === xPosition; })) === null || _a === void 0 ? void 0 : _a.type) === 'category';
        return this.crossFiltering && supportsCrossFiltering ?
            this.getCrossFilterData(params) :
            this.getDataTransformedData(params, xAxisIsCategory);
    };
    CartesianChartProxy.prototype.getDataTransformedData = function (params, isCategoryAxis) {
        return this.transformData(params.data, params.category.id, isCategoryAxis);
    };
    CartesianChartProxy.prototype.getXAxisType = function (params) {
        if (params.grouping) {
            return 'groupedCategory';
        }
        else if (CartesianChartProxy.isTimeAxis(params)) {
            return 'time';
        }
        return 'category';
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
            s.yKey = getYKey(s.yKey);
            s.listeners = {
                nodeClick: function (e) {
                    var value = e.datum[s.xKey];
                    var multiSelection = e.event.metaKey || e.event.ctrlKey;
                    _this.crossFilteringAddSelectedPoint(multiSelection, value);
                    _this.crossFilterCallback(e);
                }
            };
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
    CartesianChartProxy.prototype.getCrossFilterData = function (params) {
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
}(ChartProxy));
export { CartesianChartProxy };
