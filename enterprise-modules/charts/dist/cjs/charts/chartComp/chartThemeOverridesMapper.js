"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
function getChartThemeOverridesObjectName(chartType) {
    switch (chartType) {
        case core_1.ChartType.Bar:
        case core_1.ChartType.GroupedBar:
        case core_1.ChartType.StackedBar:
        case core_1.ChartType.NormalizedBar:
            return 'bar';
        case core_1.ChartType.Column:
        case core_1.ChartType.GroupedColumn:
        case core_1.ChartType.StackedColumn:
        case core_1.ChartType.NormalizedColumn:
            return 'column';
        case core_1.ChartType.Line:
            return 'line';
        case core_1.ChartType.Area:
        case core_1.ChartType.StackedArea:
        case core_1.ChartType.NormalizedArea:
            return 'area';
        case core_1.ChartType.Scatter:
        case core_1.ChartType.Bubble:
            return 'scatter';
        case core_1.ChartType.Histogram:
            return 'histogram';
        case core_1.ChartType.Pie:
        case core_1.ChartType.Doughnut:
            return 'pie';
        default:
            return 'cartesian';
    }
}
exports.getChartThemeOverridesObjectName = getChartThemeOverridesObjectName;
//# sourceMappingURL=chartThemeOverridesMapper.js.map