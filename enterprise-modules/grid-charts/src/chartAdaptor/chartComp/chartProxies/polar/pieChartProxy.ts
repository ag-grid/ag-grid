import { ChartBuilder } from "../../../../charts/chartBuilder";
import { PieSeriesOptions, PolarChartOptions } from "@ag-community/grid-core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PieSeries } from "../../../../charts/chart/series/pieSeries";
import { PolarChartProxy } from "./polarChartProxy";
import { PieSeriesOptions as PieSeriesInternalOptions } from "../../../../charts/chartOptions";

export class PieChartProxy extends PolarChartProxy {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.chart = ChartBuilder.createPieChart(params.parentElement, this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const chart = this.chart;
        const existingSeries = chart.series[0] as PieSeries;
        const existingSeriesId = existingSeries && existingSeries.angleKey;
        const pieSeriesField = params.fields[0];
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();
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
                    text: params.fields[0].displayName,
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

        if (!existingSeries) {
            chart.addSeries(pieSeries);
        }
    }

    protected getDefaultOptions(): PolarChartOptions<PieSeriesOptions> {
        const { strokes } = this.chartProxyParams.getSelectedPalette();
        const options = this.getDefaultChartOptions() as PolarChartOptions<PieSeriesOptions>;

        options.seriesDefaults = {
            ...options.seriesDefaults,
            callout: {
                colors: strokes,
                length: 10,
                strokeWidth: 1,
            },
            label: {
                ...this.getDefaultFontOptions(),
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
