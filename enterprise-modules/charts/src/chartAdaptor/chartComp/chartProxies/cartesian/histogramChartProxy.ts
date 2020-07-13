import { _, HistogramSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import {
    CartesianChart,
    AgChart, AgCartesianChartOptions, AgHistogramSeriesOptions
} from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export class HistogramChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options?: AgCartesianChartOptions): CartesianChart {
        const { parentElement } = this.chartProxyParams;
        const seriesDefaults = this.getSeriesDefaults();

        options = options || this.chartOptions as AgCartesianChartOptions;
        options.autoSize = true;
        options.axes = [{
            // ...options.xAxis,
            position: 'bottom',
            type: 'number'
        }, {
            // ...options.yAxis,
            position: 'left',
            type: 'number'
        }];
        options.series = [{
            ...seriesDefaults,
            // fill: seriesDefaults.fill.color,
            // fillOpacity: seriesDefaults.fill.opacity,
            // stroke: seriesDefaults.stroke.color,
            // strokeOpacity: seriesDefaults.stroke.opacity,
            // strokeWidth: seriesDefaults.stroke.width,
            type: 'histogram'
        }];

        return AgChart.create(options, parentElement);
    }

    public update(params: UpdateChartParams): void {
        const [xField] = params.fields;
        const options: any = this.chartOptions;
        const series = options.series[0];

        // options.theme = this.getTheme();

        series.data = params.data;
        series.xKey = xField.colId;
        series.xName = xField.displayName;

        // for now, only constant width is supported via integrated charts
        series.areaPlot = false;

        AgChart.update(this.chart, options, this.chartProxyParams.parentElement);
    }

    protected getDefaultOptions(): AgCartesianChartOptions {

        const fontOptions = this.getDefaultFontOptions();
        const options = this.getDefaultCartesianChartOptions();

        // options.xAxis.label.rotation = 0;
        // options.yAxis.label.rotation = 0;

        // options.seriesDefaults = {
        //     ...options.seriesDefaults,
        //     tooltip: {
        //         enabled: true,
        //     },
        //     label: {
        //         ...fontOptions,
        //         enabled: false,
        //     },
        //     shadow: this.getDefaultDropShadowOptions(),
        //     binCount: 10
        // };

        return options;
    }

    private getSeriesDefaults(): AgHistogramSeriesOptions {

        return {
            // ...this.chartOptions.seriesDefaults,
            type: 'histogram'
        };
    }
}
