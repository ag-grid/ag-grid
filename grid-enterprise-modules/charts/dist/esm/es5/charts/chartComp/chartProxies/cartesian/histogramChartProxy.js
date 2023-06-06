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
import { CartesianChartProxy } from "./cartesianChartProxy";
var HistogramChartProxy = /** @class */ (function (_super) {
    __extends(HistogramChartProxy, _super);
    function HistogramChartProxy(params) {
        return _super.call(this, params) || this;
    }
    HistogramChartProxy.prototype.getSeries = function (params) {
        var firstField = params.fields[0]; // multiple series are not supported!
        return [
            {
                type: this.standaloneChartType,
                xKey: firstField.colId,
                xName: firstField.displayName,
                yName: this.chartProxyParams.translate("histogramFrequency"),
                areaPlot: false, // only constant width is supported via integrated charts
            }
        ];
    };
    HistogramChartProxy.prototype.getAxes = function (_params) {
        return [
            {
                type: 'number',
                position: 'bottom',
            },
            {
                type: 'number',
                position: 'left',
            },
        ];
    };
    return HistogramChartProxy;
}(CartesianChartProxy));
export { HistogramChartProxy };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9ncmFtQ2hhcnRQcm94eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2NoYXJ0UHJveGllcy9jYXJ0ZXNpYW4vaGlzdG9ncmFtQ2hhcnRQcm94eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFFQSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUU1RDtJQUF5Qyx1Q0FBbUI7SUFFeEQsNkJBQW1CLE1BQXdCO2VBQ3ZDLGtCQUFNLE1BQU0sQ0FBQztJQUNqQixDQUFDO0lBRU0sdUNBQVMsR0FBaEIsVUFBaUIsTUFBb0I7UUFDakMsSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFDQUFxQztRQUMxRSxPQUFPO1lBQ0g7Z0JBQ0ksSUFBSSxFQUFFLElBQUksQ0FBQyxtQkFBbUI7Z0JBQzlCLElBQUksRUFBRSxVQUFVLENBQUMsS0FBSztnQkFDdEIsS0FBSyxFQUFFLFVBQVUsQ0FBQyxXQUFXO2dCQUM3QixLQUFLLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztnQkFDNUQsUUFBUSxFQUFFLEtBQUssRUFBRSx5REFBeUQ7YUFDakQ7U0FDaEMsQ0FBQztJQUNOLENBQUM7SUFFTSxxQ0FBTyxHQUFkLFVBQWUsT0FBcUI7UUFDaEMsT0FBTztZQUNIO2dCQUNJLElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxRQUFRO2FBQ3JCO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLE1BQU07YUFDbkI7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUVMLDBCQUFDO0FBQUQsQ0FBQyxBQWhDRCxDQUF5QyxtQkFBbUIsR0FnQzNEIn0=