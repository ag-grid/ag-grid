"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cartesianChart_1 = require("./cartesianChart");
const array_1 = require("../util/array");
const chartAxis_1 = require("./chartAxis");
const value_1 = require("../util/value");
class GroupedCategoryChart extends cartesianChart_1.CartesianChart {
    updateAxes() {
        this.axes.forEach(axis => {
            const { direction, boundSeries } = axis;
            const domains = [];
            let isNumericX = undefined;
            boundSeries.filter(s => s.visible).forEach(series => {
                if (direction === chartAxis_1.ChartAxisDirection.X) {
                    if (isNumericX === undefined) {
                        // always add first X domain
                        const domain = series.getDomain(direction);
                        domains.push(domain);
                        isNumericX = typeof domain[0] === 'number';
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
            const domain = new Array().concat(...domains);
            axis.domain = array_1.extent(domain, value_1.isContinuous) || domain;
            axis.update();
        });
    }
}
exports.GroupedCategoryChart = GroupedCategoryChart;
GroupedCategoryChart.className = 'GroupedCategoryChart';
GroupedCategoryChart.type = 'groupedCategory';
//# sourceMappingURL=groupedCategoryChart.js.map