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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cartesianChart_1 = require("./cartesianChart");
var array_1 = require("../util/array");
var chartAxis_1 = require("./chartAxis");
var value_1 = require("../util/value");
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
                if (direction === chartAxis_1.ChartAxisDirection.X) {
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
            var domain = (_a = new Array()).concat.apply(_a, __spread(domains));
            axis.domain = array_1.extent(domain, value_1.isContinuous) || domain;
            axis.update();
        });
    };
    GroupedCategoryChart.className = 'GroupedCategoryChart';
    GroupedCategoryChart.type = 'groupedCategory';
    return GroupedCategoryChart;
}(cartesianChart_1.CartesianChart));
exports.GroupedCategoryChart = GroupedCategoryChart;
//# sourceMappingURL=groupedCategoryChart.js.map