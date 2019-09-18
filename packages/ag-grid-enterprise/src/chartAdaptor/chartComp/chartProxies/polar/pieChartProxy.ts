import { ChartBuilder } from "../../../builder/chartBuilder";
import { PieChartOptions, CaptionOptions } from "ag-grid-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChart } from "../../../../charts/chart/polarChart";
import { PieSeries } from "../../../../charts/chart/series/pieSeries";
import { PolarChartProxy } from "./polarChartProxy";

export class PieChartProxy extends PolarChartProxy<PieChartOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.chart = ChartBuilder.createPolarChart(this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const pieChart = this.chart as PolarChart;
        const existingSeries = pieChart.series[0] as PieSeries;
        const existingSeriesId = existingSeries && existingSeries.angleField;
        const pieSeriesId = params.fields[0].colId;
        const pieSeriesName = params.fields[0].displayName;
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();

        let pieSeries = existingSeries;
        let calloutColors: string[] | undefined = undefined;
        
        if (existingSeriesId !== pieSeriesId) {
            pieChart.removeSeries(existingSeries);

            const seriesOptions = this.chartOptions.seriesDefaults!;

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
        pieSeries.fills = fills;
        pieSeries.strokes = strokes;

        if (calloutColors) {
            pieSeries.calloutColors = calloutColors;
        }

        if (!existingSeries) {
            pieChart.addSeries(pieSeries);
        }
    }

    protected getDefaultOptions(): PieChartOptions {
        const { fills, strokes } = this.chartProxyParams.getSelectedPalette();
        const labelColor = this.getLabelColor();

        return {
            background: {
                fill: this.getBackgroundColor()
            },
            width: 800,
            height: 400,
            padding: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            },
            legendPosition: 'right',
            legendPadding: 20,
            legend: {
                enabled: true,
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor,
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerStrokeWidth: 1
            },
            seriesDefaults: {
                type: 'pie',
                fills,
                strokes,
                strokeWidth: 1,
                strokeOpacity: 1,
                fillOpacity: 1,
                calloutColors: strokes,
                calloutLength: 10,
                calloutStrokeWidth: 1,
                labelOffset: 3,
                labelEnabled: false,
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor,
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
                }
            }
        };
    }
}
