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
import { CartesianChart } from "./cartesianChart";
import { numericExtent } from "../util/array";
import { ChartAxisDirection } from "./chartAxis";
var GroupedCategoryChart = /** @class */ (function (_super) {
    __extends(GroupedCategoryChart, _super);
    function GroupedCategoryChart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GroupedCategoryChart.prototype.updateAxes = function () {
        this.axes.forEach(function (axis) {
            var _a;
            var direction = axis.direction, boundSeries = axis.boundSeries;
            var domains = [];
            var isNumericX = undefined;
            boundSeries.filter(function (s) { return s.visible; }).forEach(function (series) {
                if (direction === ChartAxisDirection.X) {
                    if (isNumericX === undefined) {
                        // always add first X domain
                        var domain_1 = series.getDomain(direction);
                        domains.push(domain_1);
                        isNumericX = typeof domain_1[0] === 'number';
                    }
                    else if (isNumericX) {
                        // only add further X domains if the axis is numeric
                        domains.push(series.getDomain(direction));
                    }
                }
                else {
                    domains.push(series.getDomain(direction));
                }
            });
            var domain = (_a = new Array()).concat.apply(_a, domains);
            axis.domain = numericExtent(domain) || domain;
            axis.update();
        });
    };
    return GroupedCategoryChart;
}(CartesianChart));
export { GroupedCategoryChart };
