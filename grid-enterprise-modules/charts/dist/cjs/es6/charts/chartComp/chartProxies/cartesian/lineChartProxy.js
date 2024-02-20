"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineChartProxy = void 0;
const cartesianChartProxy_1 = require("./cartesianChartProxy");
class LineChartProxy extends cartesianChartProxy_1.CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(params) {
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
    }
    getSeries(params) {
        const [category] = params.categories;
        const series = params.fields.map(f => ({
            type: this.standaloneChartType,
            xKey: category.id,
            xName: category.name,
            yKey: f.colId,
            yName: f.displayName
        }));
        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    }
}
exports.LineChartProxy = LineChartProxy;
