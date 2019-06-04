import { ChartBuilder } from "../../builder/chartBuilder";
import { DoughnutChartOptions, PieSeriesOptions } from "ag-grid-community";
import { ChartProxy, ChartProxyParams, UpdateChartParams } from "./chartProxy";
import { PolarChart } from "../../../charts/chart/polarChart";
import { PieSeries } from "../../../charts/chart/series/pieSeries";
import { CaptionOptions } from "ag-grid-community/src/ts/interfaces/iChartOptions";

export class DoughnutChartProxy extends ChartProxy {
    private readonly chartOptions: DoughnutChartOptions;

    public constructor(params: ChartProxyParams) {
        super(params);

        this.chartOptions = this.getChartOptions('doughnut', this.defaultOptions()) as DoughnutChartOptions;
        this.chart = ChartBuilder.createDoughnutChart(this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const doughnutChart = this.chart as PolarChart;
        const fieldIds = params.fields.map(f => f.colId);

        const existingSeriesMap: { [id: string]: PieSeries } = {};
        doughnutChart.series.forEach(series => {
            const pieSeries = (series as PieSeries);
            const id = pieSeries.angleField as string;
            fieldIds.indexOf(id) > -1 ? existingSeriesMap[id] = pieSeries : doughnutChart.removeSeries(pieSeries);
        });

        const seriesOptions = this.chartOptions.seriesDefaults as PieSeriesOptions;
        // Use `Object.create` to prevent mutating the original user config that is possibly reused.
        const title = (seriesOptions.title ? Object.create(seriesOptions.title) : {}) as CaptionOptions;
        seriesOptions.title = title;

        let offset = 0;
        params.fields.forEach((f: { colId: string, displayName: string }, index: number) => {
            const existingSeries = existingSeriesMap[f.colId];

            title.text = f.displayName;

            seriesOptions.angleField = f.colId;
            seriesOptions.showInLegend = index === 0; // show legend items for the first series only
            const calloutColors = seriesOptions.calloutColors;

            const pieSeries = existingSeries ? existingSeries : ChartBuilder.createSeries(seriesOptions) as PieSeries;

            pieSeries.labelField = params.categoryId;
            pieSeries.data = params.data;
            // Normally all series provide legend items for every slice.
            // For our use case, where all series have the same number of slices in the same order with the same labels
            // (all of which can be different in other use cases) we don't want to show repeating labels in the legend,
            // so we only show legend items for the first series, and then when the user toggles the slices of the
            // first series in the legend, we programmatically toggle the corresponding slices of other series.
            if (index === 0) {
                pieSeries.toggleSeriesItem = (itemId: any, enabled: boolean) => {
                    const chart = pieSeries.chart;
                    if (chart) {
                        chart.series.forEach(series => {
                            (series as PieSeries).enabled[itemId] = enabled;
                        });
                    }
                    pieSeries.scheduleData();
                };
            }

            pieSeries.outerRadiusOffset = offset;
            offset -= 20;
            pieSeries.innerRadiusOffset = offset;
            offset -= 20;

            const palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();

            pieSeries.fills = palette.fills;
            pieSeries.strokes = palette.strokes;
            if (calloutColors) {
                pieSeries.calloutColors = calloutColors;
            }

            if (!existingSeries) {
                doughnutChart.addSeries(pieSeries);
            }
        });
    }

    private defaultOptions() {
        const palette = this.chartProxyParams.getSelectedPalette();

        return {
            parent: this.chartProxyParams.parentElement,
            width: this.chartProxyParams.width,
            height: this.chartProxyParams.height,
            padding: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            },
            legend: {
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerLineWidth: 1
            },
            seriesDefaults: {
                type: 'pie',
                fills: palette.fills,
                strokes: palette.strokes,
                lineWidth: 1,
                calloutColors: palette.strokes,
                calloutWidth: 2,
                calloutLength: 10,
                calloutPadding: 3,
                labelEnabled: false,
                labelFont: '12px Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelMinAngle: 20,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: undefined,
                title: {
                    enabled: false,
                    font: 'bold 12px Verdana, sans-serif',
                    color: 'black'
                }
            }
        };
    }
}
