import { AgHistogramSeriesOptions, ChartAxisPosition } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";

export class HistogramChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.xAxisType = 'number';
        this.yAxisType = 'number';

        this.recreateChart();
    }

    public update(params: UpdateChartParams): void {
        this.updateChart({
            data: this.transformData(params.data, params.category.id),
            axes: this.getAxes(),
            series: this.getSeries(params)
        });
    }

    private getSeries(params: UpdateChartParams): AgHistogramSeriesOptions[] {
        const firstField = params.fields[0]; // multiple series are not supported!
        return [{
            ...this.extractSeriesOverrides(),
            type: this.standaloneChartType,
            xKey: firstField.colId,
            xName: firstField.displayName,
            areaPlot: false, // only constant width is supported via integrated charts
        }];
    }

    private getAxes() {
        const axisOptions = this.getAxesOptions();
        return [
            {
                ...deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
                type: this.xAxisType,
                position: ChartAxisPosition.Bottom,
            },
            {
                ...deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
                type: this.yAxisType,
                position: ChartAxisPosition.Left,
            },
        ];
    }

}