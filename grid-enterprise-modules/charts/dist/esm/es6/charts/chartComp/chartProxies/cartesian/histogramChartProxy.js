import { CartesianChartProxy } from "./cartesianChartProxy";
export class HistogramChartProxy extends CartesianChartProxy {
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
