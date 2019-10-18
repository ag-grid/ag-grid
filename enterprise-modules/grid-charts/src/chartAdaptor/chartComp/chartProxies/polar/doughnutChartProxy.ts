import { ChartBuilder } from "../../../../charts/chartBuilder";
import { _, PolarChartOptions, PieSeriesOptions } from "@ag-community/grid-core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PieSeries } from "../../../../charts/chart/series/pieSeries";
import { PolarChartProxy } from "./polarChartProxy";
import { PieSeriesOptions as PieSeriesInternalOptions } from "../../../../charts/chartOptions";

export class DoughnutChartProxy extends PolarChartProxy {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.chart = ChartBuilder.createDoughnutChart(params.parentElement, this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const doughnutChart = this.chart;
        const fieldIds = params.fields.map(f => f.colId);
        const seriesMap: { [id: string]: PieSeries } = {};

        doughnutChart.series.forEach(series => {
            const pieSeries = series as PieSeries;
            const id = pieSeries.angleKey;

            if (_.includes(fieldIds, id)) {
                seriesMap[id] = pieSeries;
            }
        });

        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();
        let offset = 0;

        params.fields.forEach((f, index) => {
            const existingSeries = seriesMap[f.colId];

            const seriesOptions: PieSeriesInternalOptions = {
                ...this.chartOptions.seriesDefaults,
                type: "pie",
                field: {
                    angleKey: f.colId,
                },
                showInLegend: index === 0, // show legend items for the first series only
                title: {
                    ...this.chartOptions.seriesDefaults.title,
                    text: f.displayName,
                }
            };

            const calloutColors = seriesOptions.callout && seriesOptions.callout.colors;
            const pieSeries = existingSeries || ChartBuilder.createSeries(seriesOptions) as PieSeries;

            pieSeries.angleName = f.displayName;
            pieSeries.labelKey = params.category.id;
            pieSeries.labelName = params.category.name;
            pieSeries.data = params.data;
            pieSeries.fills = fills;
            pieSeries.strokes = strokes;

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
                            (series as PieSeries).dataEnabled[itemId] = enabled;
                        });
                    }

                    pieSeries.scheduleData();
                };
            }

            pieSeries.outerRadiusOffset = offset;
            offset -= 20;
            pieSeries.innerRadiusOffset = offset;
            offset -= 20;

            if (calloutColors) {
                pieSeries.calloutColors = calloutColors;
            }

            if (!existingSeries) {
                seriesMap[f.colId] = pieSeries;
            }
        });

        // Because repaints are automatic, it's important to remove/add/update series at once,
        // so that we don't get painted twice.
        doughnutChart.series = _.values(seriesMap);
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
