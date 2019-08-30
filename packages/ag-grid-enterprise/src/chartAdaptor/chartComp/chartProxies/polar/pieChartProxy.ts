import {ChartBuilder} from "../../../builder/chartBuilder";
import {ChartType, PieChartOptions, PieSeriesOptions} from "ag-grid-community";
import {ChartProxyParams, UpdateChartParams} from "../chartProxy";
import {PolarChart} from "../../../../charts/chart/polarChart";
import {PieSeries} from "../../../../charts/chart/series/pieSeries";
import {CaptionOptions, LegendPosition} from "ag-grid-community/src/ts/interfaces/iChartOptions";
import {PolarChartProxy} from "./polarChartProxy";

export class PieChartProxy extends PolarChartProxy<PieChartOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions(ChartType.Pie, this.defaultOptions());
        this.chart = ChartBuilder.createPolarChart(this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const pieChart = this.chart as PolarChart;

        const existingSeries = pieChart.series[0] as PieSeries;
        const existingSeriesId = existingSeries && existingSeries.angleField as string;

        const pieSeriesId = params.fields[0].colId;
        const pieSeriesName = params.fields[0].displayName;

        let pieSeries = existingSeries;
        let calloutColors: string[] | undefined = undefined;
        if (existingSeriesId !== pieSeriesId) {
            pieChart.removeSeries(existingSeries);

            const seriesOptions = this.chartOptions.seriesDefaults as PieSeriesOptions;

            // Use `Object.create` to prevent mutating the original user config that is possibly reused.
            const title = (seriesOptions.title ? Object.create(seriesOptions.title) : {}) as CaptionOptions;
            title.text = pieSeriesName;
            seriesOptions.title = title;

            seriesOptions.angleField = pieSeriesId;
            calloutColors = seriesOptions.calloutColors;

            pieSeries = ChartBuilder.createSeries(seriesOptions) as PieSeries;
        }

        pieSeries.labelField = params.category.id;
        pieSeries.data = params.data;

        const palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();

        pieSeries.fills = palette.fills;
        pieSeries.strokes = palette.strokes;
        if (calloutColors) {
            pieSeries.calloutColors = calloutColors;
        }

        if (!existingSeries) {
            pieChart.addSeries(pieSeries);
        }
    }

    private defaultOptions() {
        const palette = this.chartProxyParams.getSelectedPalette();

        return {
            background: {
                fill: this.getBackgroundColor()
            },
            padding: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            },
            legendPosition: 'right' as LegendPosition,
            legendPadding: 20,
            legend: {
                enabled: true,
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerStrokeWidth: 1
            },
            seriesDefaults: {
                type: 'pie',
                fills: palette.fills,
                strokes: palette.strokes,
                strokeWidth: 1,
                strokeOpacity: 1,
                fillOpacity: 1,
                calloutColors: palette.strokes,
                calloutLength: 10,
                calloutStrokeWidth: 1,
                labelOffset: 3,
                labelEnabled: false,
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelMinAngle: 0,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: {
                    enabled: false,
                    blur: 5,
                    xOffset: 3,
                    yOffset: 3,
                    color: 'rgba(0,0,0,0.5)'
                },
                title: {
                    enabled: false,
                    font: 'bold 12px Verdana, sans-serif',
                    color: 'black'
                }
            }
        };
    }
}
