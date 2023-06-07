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
import { _ } from "@ag-grid-community/core";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { hexToRGBA } from "../../utils/color";
var BarChartProxy = /** @class */ (function (_super) {
    __extends(BarChartProxy, _super);
    function BarChartProxy(params) {
        return _super.call(this, params) || this;
    }
    BarChartProxy.prototype.getAxes = function (params) {
        var isBar = this.standaloneChartType === 'bar';
        var axes = [
            {
                type: this.getXAxisType(params),
                position: isBar ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: isBar ? 'bottom' : 'left',
            },
        ];
        // Add a default label formatter to show '%' for normalized charts if none is provided
        if (this.isNormalised()) {
            var numberAxis = axes[1];
            numberAxis.label = __assign(__assign({}, numberAxis.label), { formatter: function (params) { return Math.round(params.value) + '%'; } });
        }
        return axes;
    };
    BarChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var groupedCharts = ['groupedColumn', 'groupedBar'];
        var isGrouped = !this.crossFiltering && _.includes(groupedCharts, this.chartType);
        var series = params.fields.map(function (f) { return ({
            type: _this.standaloneChartType,
            grouped: isGrouped,
            normalizedTo: _this.isNormalised() ? 100 : undefined,
            xKey: params.category.id,
            xName: params.category.name,
            yKey: f.colId,
            yName: f.displayName
        }); });
        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    };
    BarChartProxy.prototype.extractCrossFilterSeries = function (series) {
        var _this = this;
        var palette = this.getChartPalette();
        var updatePrimarySeries = function (seriesOptions, index) {
            return __assign(__assign({}, seriesOptions), { highlightStyle: { item: { fill: undefined } }, fill: palette === null || palette === void 0 ? void 0 : palette.fills[index], stroke: palette === null || palette === void 0 ? void 0 : palette.strokes[index], listeners: {
                    nodeClick: _this.crossFilterCallback
                } });
        };
        var updateFilteredOutSeries = function (seriesOptions) {
            var yKey = seriesOptions.yKey + '-filtered-out';
            return __assign(__assign({}, deepMerge({}, seriesOptions)), { yKey: yKey, fill: hexToRGBA(seriesOptions.fill, '0.3'), stroke: hexToRGBA(seriesOptions.stroke, '0.3'), hideInLegend: [yKey] });
        };
        var allSeries = [];
        for (var i = 0; i < series.length; i++) {
            // update primary series
            var primarySeries = updatePrimarySeries(series[i], i);
            allSeries.push(primarySeries);
            // add 'filtered-out' series
            allSeries.push(updateFilteredOutSeries(primarySeries));
        }
        return allSeries;
    };
    BarChartProxy.prototype.isNormalised = function () {
        var normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return !this.crossFiltering && _.includes(normalisedCharts, this.chartType);
    };
    return BarChartProxy;
}(CartesianChartProxy));
export { BarChartProxy };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyQ2hhcnRQcm94eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2NoYXJ0UHJveGllcy9jYXJ0ZXNpYW4vYmFyQ2hhcnRQcm94eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUc1QyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDL0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTlDO0lBQW1DLGlDQUFtQjtJQUVsRCx1QkFBbUIsTUFBd0I7ZUFDdkMsa0JBQU0sTUFBTSxDQUFDO0lBQ2pCLENBQUM7SUFFTSwrQkFBTyxHQUFkLFVBQWUsTUFBb0I7UUFDL0IsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixLQUFLLEtBQUssQ0FBQztRQUNqRCxJQUFNLElBQUksR0FBNkI7WUFDbkM7Z0JBQ0ksSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO2dCQUMvQixRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVE7YUFDdEM7WUFDRDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU07YUFDdEM7U0FDSixDQUFDO1FBQ0Ysc0ZBQXNGO1FBQ3RGLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFO1lBQ3JCLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixVQUFVLENBQUMsS0FBSyx5QkFBUSxVQUFVLENBQUMsS0FBSyxLQUFFLFNBQVMsRUFBRSxVQUFDLE1BQVcsSUFBSyxPQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBOUIsQ0FBOEIsR0FBRSxDQUFDO1NBQzFHO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLGlDQUFTLEdBQWhCLFVBQWlCLE1BQW9CO1FBQXJDLGlCQWlCQztRQWhCRyxJQUFNLGFBQWEsR0FBRyxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN0RCxJQUFNLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXBGLElBQU0sTUFBTSxHQUF5QixNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQ3hEO1lBQ0ksSUFBSSxFQUFFLEtBQUksQ0FBQyxtQkFBbUI7WUFDOUIsT0FBTyxFQUFFLFNBQVM7WUFDbEIsWUFBWSxFQUFFLEtBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ25ELElBQUksRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDeEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtZQUMzQixJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUs7WUFDYixLQUFLLEVBQUUsQ0FBQyxDQUFDLFdBQVc7U0FFM0IsQ0FBQSxFQVYyRCxDQVUzRCxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ2hGLENBQUM7SUFFTyxnREFBd0IsR0FBaEMsVUFBaUMsTUFBNEI7UUFBN0QsaUJBb0NDO1FBbkNHLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV2QyxJQUFNLG1CQUFtQixHQUFHLFVBQUMsYUFBaUMsRUFBRSxLQUFhO1lBQ3pFLDZCQUNPLGFBQWEsS0FDaEIsY0FBYyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQzdDLElBQUksRUFBRSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUMzQixNQUFNLEVBQUUsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFDL0IsU0FBUyxFQUFFO29CQUNQLFNBQVMsRUFBRSxLQUFJLENBQUMsbUJBQW1CO2lCQUN0QyxJQUNKO1FBQ0wsQ0FBQyxDQUFBO1FBRUQsSUFBTSx1QkFBdUIsR0FBRyxVQUFDLGFBQWlDO1lBQzlELElBQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLEdBQUcsZUFBZSxDQUFDO1lBQ2xELDZCQUNPLFNBQVMsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLEtBQy9CLElBQUksTUFBQSxFQUNKLElBQUksRUFBRSxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUssRUFBRSxLQUFLLENBQUMsRUFDM0MsTUFBTSxFQUFFLFNBQVMsQ0FBQyxhQUFhLENBQUMsTUFBTyxFQUFFLEtBQUssQ0FBQyxFQUMvQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFDdkI7UUFDTCxDQUFDLENBQUE7UUFFRCxJQUFNLFNBQVMsR0FBeUIsRUFBRSxDQUFDO1FBQzNDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3BDLHdCQUF3QjtZQUN4QixJQUFNLGFBQWEsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUU5Qiw0QkFBNEI7WUFDNUIsU0FBUyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1NBQzFEO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVPLG9DQUFZLEdBQXBCO1FBQ0ksSUFBTSxnQkFBZ0IsR0FBRyxDQUFDLGtCQUFrQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFDTCxvQkFBQztBQUFELENBQUMsQUF4RkQsQ0FBbUMsbUJBQW1CLEdBd0ZyRCJ9