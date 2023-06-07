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
import { CartesianChartProxy } from "./cartesianChartProxy";
var AreaChartProxy = /** @class */ (function (_super) {
    __extends(AreaChartProxy, _super);
    function AreaChartProxy(params) {
        return _super.call(this, params) || this;
    }
    AreaChartProxy.prototype.getAxes = function (params) {
        var axes = [
            {
                type: this.getXAxisType(params),
                position: 'bottom',
            },
            {
                type: 'number',
                position: 'left',
            },
        ];
        // Add a default label formatter to show '%' for normalized charts if none is provided
        if (this.isNormalised()) {
            var numberAxis = axes[1];
            numberAxis.label = __assign(__assign({}, numberAxis.label), { formatter: function (params) { return Math.round(params.value) + '%'; } });
        }
        return axes;
    };
    AreaChartProxy.prototype.getSeries = function (params) {
        var _this = this;
        var series = params.fields.map(function (f) { return ({
            type: _this.standaloneChartType,
            xKey: params.category.id,
            xName: params.category.name,
            yKey: f.colId,
            yName: f.displayName,
            normalizedTo: _this.chartType === 'normalizedArea' ? 100 : undefined,
            stacked: ['normalizedArea', 'stackedArea'].includes(_this.chartType)
        }); });
        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    };
    AreaChartProxy.prototype.isNormalised = function () {
        return !this.crossFiltering && this.chartType === 'normalizedArea';
    };
    return AreaChartProxy;
}(CartesianChartProxy));
export { AreaChartProxy };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYUNoYXJ0UHJveHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9jaGFydFByb3hpZXMvY2FydGVzaWFuL2FyZWFDaGFydFByb3h5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFNUQ7SUFBb0Msa0NBQW1CO0lBRW5ELHdCQUFtQixNQUF3QjtlQUN2QyxrQkFBTSxNQUFNLENBQUM7SUFDakIsQ0FBQztJQUVNLGdDQUFPLEdBQWQsVUFBZSxNQUFvQjtRQUMvQixJQUFNLElBQUksR0FBNkI7WUFDbkM7Z0JBQ0ksSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO2dCQUMvQixRQUFRLEVBQUUsUUFBUTthQUNyQjtZQUNEO2dCQUNJLElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxNQUFNO2FBQ25CO1NBQ0osQ0FBQztRQUVGLHNGQUFzRjtRQUN0RixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRTtZQUNyQixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsVUFBVSxDQUFDLEtBQUsseUJBQVEsVUFBVSxDQUFDLEtBQUssS0FBRSxTQUFTLEVBQUUsVUFBQyxNQUFXLElBQUssT0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEVBQTlCLENBQThCLEdBQUUsQ0FBQztTQUMxRztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxrQ0FBUyxHQUFoQixVQUFpQixNQUFvQjtRQUFyQyxpQkFjQztRQWJHLElBQU0sTUFBTSxHQUEwQixNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQ3pEO1lBQ0ksSUFBSSxFQUFFLEtBQUksQ0FBQyxtQkFBbUI7WUFDOUIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN4QixLQUFLLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJO1lBQzNCLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSztZQUNiLEtBQUssRUFBRSxDQUFDLENBQUMsV0FBVztZQUNwQixZQUFZLEVBQUUsS0FBSSxDQUFDLFNBQVMsS0FBSyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ25FLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsU0FBUyxDQUFDO1NBRTFFLENBQUEsRUFWNEQsQ0FVNUQsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDaEcsQ0FBQztJQUVPLHFDQUFZLEdBQXBCO1FBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxnQkFBZ0IsQ0FBQztJQUN2RSxDQUFDO0lBQ0wscUJBQUM7QUFBRCxDQUFDLEFBOUNELENBQW9DLG1CQUFtQixHQThDdEQifQ==