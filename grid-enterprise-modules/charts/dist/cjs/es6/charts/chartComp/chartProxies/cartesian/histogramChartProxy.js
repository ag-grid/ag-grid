"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistogramChartProxy = void 0;
const cartesianChartProxy_1 = require("./cartesianChartProxy");
class HistogramChartProxy extends cartesianChartProxy_1.CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getSeries(params) {
        const firstField = params.fields[0]; // multiple series are not supported!
        return [
            {
                type: this.standaloneChartType,
                xKey: firstField.colId,
                xName: firstField.displayName,
                yName: this.chartProxyParams.translate("histogramFrequency"),
                areaPlot: false,
            }
        ];
    }
    getAxes(_params) {
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
    }
}
exports.HistogramChartProxy = HistogramChartProxy;
