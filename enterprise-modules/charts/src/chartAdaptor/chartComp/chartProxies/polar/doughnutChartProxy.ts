import { ChartBuilder, PieSeries, PieSeriesOptions as PieSeriesInternalOptions, PolarChart } from "ag-charts-community";
import { _, PieSeriesOptions, PolarChartOptions } from "@ag-grid-community/core";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";

export class DoughnutChartProxy extends PolarChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options?: PolarChartOptions<PieSeriesOptions>): PolarChart {
        return ChartBuilder.createDoughnutChart(this.chartProxyParams.parentElement, options || this.chartOptions);
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

        const { seriesDefaults } = this.chartOptions;
        const { fills, strokes } = this.getPalette();
        let offset = 0;

        params.fields.forEach((f, index) => {
            const existingSeries = seriesMap[f.colId];

            const seriesOptions: PieSeriesInternalOptions = {
                ...seriesDefaults,
                type: "pie",
                field: {
                    angleKey: f.colId,
                },
                showInLegend: index === 0, // show legend items for the first series only
                title: {
                    ...seriesDefaults.title,
                    text: seriesDefaults.title.text || f.displayName,
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
                    if (doughnutChart) {
                        doughnutChart.series.forEach(series => {
                            (series as PieSeries).seriesItemEnabled[itemId] = enabled;
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
                pieSeries.callout.colors = calloutColors;
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
        const { strokes } = this.getPredefinedPalette();
        const options = this.getDefaultChartOptions() as PolarChartOptions<PieSeriesOptions>;
        const fontOptions = this.getDefaultFontOptions();

        options.seriesDefaults = {
            ...options.seriesDefaults,
            title: {
                ...fontOptions,
                enabled: true,
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
