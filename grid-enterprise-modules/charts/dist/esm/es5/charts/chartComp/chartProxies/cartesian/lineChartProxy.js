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
var LineChartProxy = /** @class */ (function (_super) {
    __extends(LineChartProxy, _super);
    function LineChartProxy(params) {
        return _super.call(this, params) || this;
    }
    LineChartProxy.prototype.getAxes = function (params) {
        return [
            {
                type: this.getXAxisType(params),
                position: 'bottom'
            },
            {
                type: 'number',
                position: 'left'
            },
        ];
    };
    LineChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var series = params.fields.map(function (f) { return ({
            type: _this.standaloneChartType,
            xKey: params.category.id,
            xName: params.category.name,
            yKey: f.colId,
            yName: f.displayName
        }); });
        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    };
    return LineChartProxy;
}(CartesianChartProxy));
export { LineChartProxy };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZUNoYXJ0UHJveHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9jaGFydFByb3hpZXMvY2FydGVzaWFuL2xpbmVDaGFydFByb3h5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUVBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRTVEO0lBQW9DLGtDQUFtQjtJQUVuRCx3QkFBbUIsTUFBd0I7ZUFDdkMsa0JBQU0sTUFBTSxDQUFDO0lBQ2pCLENBQUM7SUFFTSxnQ0FBTyxHQUFkLFVBQWUsTUFBb0I7UUFDL0IsT0FBTztZQUNIO2dCQUNJLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztnQkFDL0IsUUFBUSxFQUFFLFFBQVE7YUFDckI7WUFDRDtnQkFDSSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsTUFBTTthQUNuQjtTQUNKLENBQUM7SUFDTixDQUFDO0lBRU0sa0NBQVMsR0FBaEIsVUFBaUIsTUFBb0I7UUFBckMsaUJBWUM7UUFYRyxJQUFNLE1BQU0sR0FBMEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUN6RDtZQUNJLElBQUksRUFBRSxLQUFJLENBQUMsbUJBQW1CO1lBQzlCLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDeEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtZQUMzQixJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUs7WUFDYixLQUFLLEVBQUUsQ0FBQyxDQUFDLFdBQVc7U0FFM0IsQ0FBQSxFQVI0RCxDQVE1RCxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNoRyxDQUFDO0lBQ0wscUJBQUM7QUFBRCxDQUFDLEFBaENELENBQW9DLG1CQUFtQixHQWdDdEQifQ==