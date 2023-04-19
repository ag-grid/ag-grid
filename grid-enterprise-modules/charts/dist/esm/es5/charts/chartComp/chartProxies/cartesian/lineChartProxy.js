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
