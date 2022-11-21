import { AgCartesianAxisOptions, AgHistogramSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";

export class HistogramChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.supportsAxesUpdates = false;
        this.xAxisType = 'number';
        this.yAxisType = 'number';

        this.recreateChart();
    }

    public getData(params: UpdateChartParams): any[] {
        return this.getDataTransformedData(params);
    }

    public getSeries(params: UpdateChartParams): AgHistogramSeriesOptions[] {
        const firstField = params.fields[0]; // multiple series are not supported!
        return [{
            ...this.extractSeriesOverrides(),
            type: this.standaloneChartType,
            xKey: firstField.colId,
            xName: firstField.displayName,
            yName: this.chartProxyParams.translate("histogramFrequency"),
            areaPlot: false, // only constant width is supported via integrated charts
        }];
    }

    public getAxes(): AgCartesianAxisOptions[] {
        const axisOptions = this.getAxesOptions();
        return [
            {
                ...(axisOptions ? deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType]?.bottom) : {}),
                type: this.xAxisType,
                position: 'bottom',
            },
            {
                ...(axisOptions ? deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType]?.left) : {}),
                type: this.yAxisType,
                position: 'left',
            },
        ];
    }

}