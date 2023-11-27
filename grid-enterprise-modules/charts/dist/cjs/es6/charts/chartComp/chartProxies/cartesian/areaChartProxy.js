"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaChartProxy = void 0;
const cartesianChartProxy_1 = require("./cartesianChartProxy");
class AreaChartProxy extends cartesianChartProxy_1.CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(params) {
        const axes = [
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
            const numberAxis = axes[1];
            numberAxis.label = Object.assign(Object.assign({}, numberAxis.label), { formatter: (params) => Math.round(params.value) + '%' });
        }
        return axes;
    }
    getSeries(params) {
        const series = params.fields.map(f => ({
            type: this.standaloneChartType,
            xKey: params.category.id,
            xName: params.category.name,
            yKey: f.colId,
            yName: f.displayName,
            normalizedTo: this.chartType === 'normalizedArea' ? 100 : undefined,
            stacked: ['normalizedArea', 'stackedArea'].includes(this.chartType)
        }));
        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    }
    isNormalised() {
        return !this.crossFiltering && this.chartType === 'normalizedArea';
    }
}
exports.AreaChartProxy = AreaChartProxy;
