import {ChartBuilder, PieSeries, PieSeriesOptions as PieSeriesInternalOptions, PolarChart} from "ag-charts-community";
import {PieSeriesOptions, PolarChartOptions} from "@ag-grid-community/core";
import {ChartProxyParams, UpdateChartParams} from "../chartProxy";
import {PolarChartProxy} from "./polarChartProxy";

export class PieChartProxy extends PolarChartProxy {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options?: PolarChartOptions<PieSeriesOptions>): PolarChart {
        return ChartBuilder.createPieChart(this.chartProxyParams.parentElement, options || this.chartOptions);
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

            const seriesOptions: PieSeriesInternalOptions = {
                ...seriesDefaults,
                type: "pie",
                field: {
                    angleKey: pieSeriesField.colId,
                },
                title: {
                    ...seriesDefaults.title,
                    text: seriesDefaults.title.text || params.fields[0].displayName,
                }
            };

            pieSeries = ChartBuilder.createSeries(seriesOptions) as PieSeries;
        }

        pieSeries.angleName = pieSeriesField.displayName;
        pieSeries.labelKey = params.category.id;
        pieSeries.labelName = params.category.name;
        pieSeries.data = params.data;
        pieSeries.fills = fills;
        pieSeries.strokes = strokes;

        if (calloutColors) {
            pieSeries.calloutColors = calloutColors;
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
