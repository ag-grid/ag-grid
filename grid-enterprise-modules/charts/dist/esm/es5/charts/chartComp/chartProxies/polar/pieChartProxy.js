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
import { ChartProxy } from '../chartProxy';
import { AgChart, } from 'ag-charts-community';
import { changeOpacity } from '../../utils/color';
import { deepMerge } from '../../utils/object';
var PieChartProxy = /** @class */ (function (_super) {
    __extends(PieChartProxy, _super);
    function PieChartProxy(params) {
        return _super.call(this, params) || this;
    }
    PieChartProxy.prototype.update = function (params) {
        var data = params.data, category = params.category;
        var options = __assign(__assign({}, this.getCommonChartOptions(params.updatedOverrides)), { data: this.crossFiltering ? this.getCrossFilterData(params) : this.transformData(data, category.id), series: this.getSeries(params) });
        AgChart.update(this.getChartRef(), options);
    };
    PieChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var numFields = params.fields.length;
        var offset = {
            currentOffset: 0,
            offsetAmount: numFields > 1 ? 20 : 40
        };
        var series = this.getFields(params).map(function (f) {
            var _a;
            // options shared by 'pie' and 'doughnut' charts
            var options = {
                type: _this.standaloneChartType,
                angleKey: f.colId,
                angleName: f.displayName,
                sectorLabelKey: f.colId,
                calloutLabelKey: params.category.id,
                calloutLabelName: params.category.name,
            };
            if (_this.chartType === 'doughnut') {
                var _b = PieChartProxy.calculateOffsets(offset), outerRadiusOffset = _b.outerRadiusOffset, innerRadiusOffset = _b.innerRadiusOffset;
                var title = f.displayName ? {
                    title: { text: f.displayName, showInLegend: numFields > 1 },
                } : undefined;
                // augment shared options with 'doughnut' specific options
                return __assign(__assign(__assign(__assign({}, options), { outerRadiusOffset: outerRadiusOffset, innerRadiusOffset: innerRadiusOffset }), title), { calloutLine: {
                        colors: (_a = _this.getChartPalette()) === null || _a === void 0 ? void 0 : _a.strokes,
                    } });
            }
            return options;
        });
        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    };
    PieChartProxy.prototype.getCrossFilterData = function (params) {
        var colId = params.fields[0].colId;
        var filteredOutColId = colId + "-filtered-out";
        return params.data.map(function (d) {
            var total = d[colId] + d[filteredOutColId];
            d[colId + "-total"] = total;
            d[filteredOutColId] = 1; // normalise to 1
            d[colId] = d[colId] / total; // fraction of 1
            return d;
        });
    };
    PieChartProxy.prototype.extractCrossFilterSeries = function (series) {
        var _this = this;
        var palette = this.getChartPalette();
        var primaryOptions = function (seriesOptions) {
            return __assign(__assign({}, seriesOptions), { calloutLabel: { enabled: false }, highlightStyle: { item: { fill: undefined } }, radiusKey: seriesOptions.angleKey, angleKey: seriesOptions.angleKey + '-total', radiusMin: 0, radiusMax: 1, listeners: {
                    nodeClick: _this.crossFilterCallback,
                } });
        };
        var filteredOutOptions = function (seriesOptions, angleKey) {
            var _a, _b;
            return __assign(__assign({}, deepMerge({}, primaryOpts)), { radiusKey: angleKey + '-filtered-out', fills: changeOpacity((_a = seriesOptions.fills) !== null && _a !== void 0 ? _a : palette.fills, 0.3), strokes: changeOpacity((_b = seriesOptions.strokes) !== null && _b !== void 0 ? _b : palette.strokes, 0.3), showInLegend: false });
        };
        // currently, only single 'doughnut' cross-filter series are supported
        var primarySeries = series[0];
        // update primary series
        var angleKey = primarySeries.angleKey;
        var primaryOpts = primaryOptions(primarySeries);
        return [
            filteredOutOptions(primarySeries, angleKey),
            primaryOpts,
        ];
    };
    PieChartProxy.calculateOffsets = function (offset) {
        var outerRadiusOffset = offset.currentOffset;
        offset.currentOffset -= offset.offsetAmount;
        var innerRadiusOffset = offset.currentOffset;
        offset.currentOffset -= offset.offsetAmount;
        return { outerRadiusOffset: outerRadiusOffset, innerRadiusOffset: innerRadiusOffset };
    };
    PieChartProxy.prototype.getFields = function (params) {
        return this.chartType === 'pie' ? params.fields.slice(0, 1) : params.fields;
    };
    PieChartProxy.prototype.crossFilteringReset = function () {
        // not required in pie charts
    };
    return PieChartProxy;
}(ChartProxy));
export { PieChartProxy };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGllQ2hhcnRQcm94eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2NoYXJ0UHJveGllcy9wb2xhci9waWVDaGFydFByb3h5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBbUQsTUFBTSxlQUFlLENBQUM7QUFDNUYsT0FBTyxFQUFFLE9BQU8sR0FBa0UsTUFBTSxxQkFBcUIsQ0FBQztBQUM5RyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBTy9DO0lBQW1DLGlDQUFVO0lBRXpDLHVCQUFtQixNQUF3QjtlQUN2QyxrQkFBTSxNQUFNLENBQUM7SUFDakIsQ0FBQztJQUVNLDhCQUFNLEdBQWIsVUFBYyxNQUFvQjtRQUN0QixJQUFBLElBQUksR0FBZSxNQUFNLEtBQXJCLEVBQUUsUUFBUSxHQUFLLE1BQU0sU0FBWCxDQUFZO1FBRWxDLElBQU0sT0FBTyx5QkFDTixJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEtBQ3RELElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFDbkcsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQ2pDLENBQUE7UUFFRCxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU8saUNBQVMsR0FBakIsVUFBa0IsTUFBb0I7UUFB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