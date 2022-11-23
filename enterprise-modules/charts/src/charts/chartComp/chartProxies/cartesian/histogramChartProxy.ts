import { AgCartesianAxisOptions, AgHistogramSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class HistogramChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.supportsAxesUpdates = false;
        this.xAxisType = 'number';
        this.yAxisType = 'number';
    }

    public getData(params: UpdateChartParams): any[] {
        return this.getDataTransformedData(params);
    }

    public getSeries(params: UpdateChartParams): AgHistogramSeriesOptions[] {
        const firstField = params.fields[0]; // multiple series are not supported!
        return [
            {
                type: this.standaloneChartType,
                xKey: firstField.colId,
                xName: firstField.displayName,
                yName: this.chartProxyParams.translate("histogramFrequency"),
                areaPlot: false, // only constant width is supported via integrated charts
            } as AgHistogramSeriesOptions
        ];
    }

    public getAxes(): AgCartesianAxisOptions[] {
        return [
            {
                type: this.xAxisType,
                position: 'bottom',
            },
            {
                type: this.yAxisType,
                position: 'left',
            },
        ];
    }

}