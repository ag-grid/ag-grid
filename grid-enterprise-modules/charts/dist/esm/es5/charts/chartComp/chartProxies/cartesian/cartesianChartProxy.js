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
        var options = __assign(__assign({}, this.getCommonChartOptions(params.updatedOverrides)), { data: this.getData(params, axes), axes: axes, series: this.getSeries(params) });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydGVzaWFuQ2hhcnRQcm94eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2NoYXJ0UHJveGllcy9jYXJ0ZXNpYW4vY2FydGVzaWFuQ2hhcnRQcm94eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQWtDLE1BQU0sZUFBZSxDQUFDO0FBQzNFLE9BQU8sRUFLSCxPQUFPLEdBRVYsTUFBTSxxQkFBcUIsQ0FBQztBQUU3QjtJQUFrRCx1Q0FBVTtJQUl4RCw2QkFBc0IsTUFBd0I7UUFBOUMsWUFDSSxrQkFBTSxNQUFNLENBQUMsU0FDaEI7UUFMUyw2QkFBdUIsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQzVDLGtDQUE0QixHQUFhLEVBQUUsQ0FBQzs7SUFJdEQsQ0FBQztJQUtNLG9DQUFNLEdBQWIsVUFBYyxNQUFvQjtRQUM5QixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWxDLElBQU0sT0FBTyx5QkFDTixJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEtBQ3RELElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFDaEMsSUFBSSxNQUFBLEVBQ0osTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQ2pDLENBQUM7UUFFRixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU8scUNBQU8sR0FBZixVQUFnQixNQUFvQixFQUFFLElBQThCOztRQUNoRSxJQUFNLHNCQUFzQixHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJ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