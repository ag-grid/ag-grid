import { PieSeries, PolarChart, AgChart, AgPolarChartOptions } from "ag-charts-community";
import { PieSeriesOptions, PolarChartOptions } from "@ag-grid-community/core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";

export class PieChartProxy extends PolarChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options: PolarChartOptions<PieSeriesOptions>): PolarChart {
        options = options || this.chartOptions;
        const seriesDefaults = options.seriesDefaults;
        const agChartOptions = options as AgPolarChartOptions;

        agChartOptions.autoSize = true;
        agChartOptions.series = [{
            ...seriesDefaults,
            fills: seriesDefaults.fill.colors,
            fillOpacity: seriesDefaults.fill.opacity,
            strokes: seriesDefaults.stroke.colors,
            strokeOpacity: seriesDefaults.stroke.opacity,
            strokeWidth: seriesDefaults.stroke.width,
            type: 'pie'
        }];

        return AgChart.create(agChartOptions, this.chartProxyParams.parentElement);
    }

    public update(params: UpdateChartParams): void {
        const { chart } = this;

        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }

        const existingSeries = chart.series[0] as PieSeries;
        const existingSeriesId = existingSeries && existingSeries.angleKey;
        const pieSeriesField = params.fields[0];
        const { fills, strokes } = this.getPalette();
        const { seriesDefaults } = this.chartOptions;

        let pieSeries = existingSeries;
        let calloutColors = seriesDefaults.callout && seriesDefaults.callout.colors;

        if (existingSeriesId !== pieSeriesField.colId) {
            chart.removeSeries(existingSeries);

            pieSeries = AgChart.createComponent({
                ...seriesDefaults,
                type: 'pie',
                angleKey: pieSeriesField.colId,
                title: {
                    ...seriesDefaults.title,
                    text: seriesDefaults.title.text || params.fields[0].displayName,
                },
                fills: seriesDefaults.fill.colors,
                fillOpacity: seriesDefaults.fill.opacity,
                strokes: seriesDefaults.stroke.colors,
                strokeOpacity: seriesDefaults.stroke.opacity,
                strokeWidth: seriesDefaults.stroke.width,
            }, 'pie.series');
        }

        pieSeries.angleName = pieSeriesField.displayName;
        pieSeries.labelKey = params.category.id;
        pieSeries.labelName = params.category.name;
        pieSeries.data = params.data;
        pieSeries.fills = fills;
        pieSeries.strokes = strokes;

        if (calloutColors) {
            pieSeries.callout.colors = calloutColors;
        }

        chart.addSeries(pieSeries);
    }

    protected getDefaultOptions(): PolarChartOptions<PieSeriesOptions> {
        const { strokes } = this.getPredefinedPalette();
        const options = this.getDefaultChartOptions() as PolarChartOptions<PieSeriesOptions>;
        const fontOptions = this.getDefaultFontOptions();

        options.seriesDefaults = {
            ...options.seriesDefaults,
            title: {
                ...fontOptions,
                enabled: false,
                fontSize: 12,
                fontWeight: 'bold',
            },
            callout: {
                colors: strokes,
                length: 10,
                strokeWidth: 2,
            },
            label: {
                ...fontOptions,
                enabled: false,
                offset: 3,
                minRequiredAngle: 0,
            },
            tooltip: {
                enabled: true,
            },
            shadow: this.getDefaultDropShadowOptions(),
        };

        return options;
    }
}

// import { PieSeries, PolarChart, AgChart, AgPolarChartOptions } from "ag-charts-community";
// import { PieSeriesOptions, PolarChartOptions } from "@ag-grid-community/core";
// import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
// import { PolarChartProxy } from "./polarChartProxy";
//
// export class PieChartProxy extends PolarChartProxy {
//
//     public constructor(params: ChartProxyParams) {
//         super(params);
//
//         this.initChartOptions();
//         this.recreateChart();
//     }
//
//     protected createChart(chartOptions?: AgPolarChartOptions): PolarChart {
//         chartOptions = chartOptions || this.chartOptions as AgPolarChartOptions;
//         // const seriesDefaults = chartOptions.seriesDefaults;
//         const options: AgPolarChartOptions = chartOptions;
//         options.autoSize = true;
//         options.series = [{
//             type: 'pie',
//             // ...seriesDefaults,
//             // fills: seriesDefaults.fill.colors,
//             // fillOpacity: seriesDefaults.fill.opacity,
//             // strokes: seriesDefaults.stroke.colors,
//             // strokeOpacity: seriesDefaults.stroke.opacity,
//             // strokeWidth: seriesDefaults.stroke.width
//         }];
//
//         return AgChart.create(chartOptions, this.chartProxyParams.parentElement);
//     }
//
//     public update(params: UpdateChartParams): void {
//         const { chart } = this;
//
//         if (params.fields.length === 0) {
//             chart.removeAllSeries();
//             return;
//         }
//
//         const existingSeries = chart.series[0] as PieSeries;
//         const existingSeriesId = existingSeries && existingSeries.angleKey;
//         const pieSeriesField = params.fields[0];
//         const { fills, strokes } = this.getPalette();
//         // const { seriesDefaults } = this.chartOptions;
//
//         let pieSeries = existingSeries;
//         // let calloutColors = seriesDefaults.callout && seriesDefaults.callout.colors;
//
//         if (existingSeriesId !== pieSeriesField.colId) {
//             chart.removeSeries(existingSeries);
//
//             pieSeries = AgChart.createComponent({
//                 // ...seriesDefaults,
//                 type: 'pie',
//                 angleKey: pieSeriesField.colId,
//                 title: {
//                     // ...seriesDefaults.title,
//                     // text: seriesDefaults.title.text || params.fields[0].displayName,
//                 },
//                 // fills: seriesDefaults.fill.colors,
//                 // fillOpacity: seriesDefaults.fill.opacity,
//                 // strokes: seriesDefaults.stroke.colors,
//                 // strokeOpacity: seriesDefaults.stroke.opacity,
//                 // strokeWidth: seriesDefaults.stroke.width,
//             }, 'pie.series');
//         }
//
//         pieSeries.angleName = pieSeriesField.displayName;
//         pieSeries.labelKey = params.category.id;
//         pieSeries.labelName = params.category.name;
//         pieSeries.data = params.data;
//         pieSeries.fills = fills;
//         pieSeries.strokes = strokes;
//
//         // if (calloutColors) {
//         //     pieSeries.callout.colors = calloutColors;
//         // }
//
//         chart.addSeries(pieSeries);
//     }
//
//     protected getDefaultOptions(): AgPolarChartOptions {
//         const { strokes } = this.getPredefinedPalette();
//         const options = this.getDefaultChartOptions() as AgPolarChartOptions;
//         const fontOptions = this.getDefaultFontOptions();
//
//         // options.seriesDefaults = {
//         //     ...options.seriesDefaults,
//         //     title: {
//         //         ...fontOptions,
//         //         enabled: false,
//         //         fontSize: 12,
//         //         fontWeight: 'bold',
//         //     },
//         //     callout: {
//         //         colors: strokes,
//         //         length: 10,
//         //         strokeWidth: 2,
//         //     },
//         //     label: {
//         //         ...fontOptions,
//         //         enabled: false,
//         //         offset: 3,
//         //         minRequiredAngle: 0,
//         //     },
//         //     tooltip: {
//         //         enabled: true,
//         //     },
//         //     shadow: this.getDefaultDropShadowOptions(),
//         // };
//
//         return options;
//     }
// }
