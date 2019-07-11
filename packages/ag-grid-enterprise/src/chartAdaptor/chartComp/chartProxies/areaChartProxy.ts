import { ChartBuilder } from "../../builder/chartBuilder";
import { AreaChartOptions, AreaSeriesOptions, ChartType } from "ag-grid-community";
import { AreaSeries } from "../../../charts/chart/series/areaSeries";
import { ChartProxy, ChartProxyParams, UpdateChartParams } from "./chartProxy";
import { CartesianChart } from "../../../charts/chart/cartesianChart";
import { CategoryAxis } from "../../../charts/chart/axis/categoryAxis";

export class AreaChartProxy extends ChartProxy {
    private readonly chartOptions: AreaChartOptions;

    public constructor(params: ChartProxyParams) {
        super(params);

        this.chartOptions = this.getChartOptions(params.chartType, this.defaultOptions()) as AreaChartOptions;

        this.chart = ChartBuilder.createAreaChart(this.chartOptions);

        this.setAxisPadding(this.chart as CartesianChart);

        const areaSeries = ChartBuilder.createSeries(this.chartOptions.seriesDefaults as AreaSeriesOptions);
        if (areaSeries) { this.chart.addSeries(areaSeries); }
    }

    private setAxisPadding(chart: CartesianChart) {
        const xAxis = chart.xAxis;
        if (xAxis instanceof CategoryAxis) {
            xAxis.scale.paddingInner = 1;
            xAxis.scale.paddingOuter = 0;
        }
    }

    public update(params: UpdateChartParams): void {
        const areaSeries = this.chart.series[0] as AreaSeries;

        areaSeries.data = params.data;
        areaSeries.xField = params.categoryId;
        areaSeries.yFields = params.fields.map(f => f.colId);
        areaSeries.yFieldNames = params.fields.map(f => f.displayName);

        const palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();

        areaSeries.fills = palette.fills;
        areaSeries.strokes = palette.strokes;
    }

    private defaultOptions(): AreaChartOptions {
        const palette = this.chartProxyParams.getSelectedPalette();

        return {
            parent: this.chartProxyParams.parentElement,
            width: this.chartProxyParams.width,
            height: this.chartProxyParams.height,
            background: {
                fill: this.getBackgroundColor()
            },
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            xAxis: {
                type: 'category',
                labelFontStyle: undefined,
                labelFontWeight: undefined,
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 0,
                tickSize: 6,
                tickWidth: 1,
                tickPadding: 5,
                lineColor: 'rgba(195, 195, 195, 1)',
                lineWidth: 1,
                gridStyle: [{
                    stroke: this.getAxisGridColor(),
                    lineDash: [4, 2]
                }]
            },
            yAxis: {
                type: 'number',
                labelFontStyle: undefined,
                labelFontWeight: undefined,
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 0,
                tickSize: 6,
                tickWidth: 1,
                tickPadding: 5,
                lineColor: 'rgba(195, 195, 195, 1)',
                lineWidth: 1,
                gridStyle: [{
                    stroke: this.getAxisGridColor(),
                    lineDash: [4, 2]
                }]
            },
            legend: {
                labelFontStyle: undefined,
                labelFontWeight: undefined,
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
                type: 'area',
                fills: palette.fills,
                strokes: palette.strokes,
                normalizedTo: this.chartProxyParams.chartType === ChartType.NormalizedArea ? 100 : undefined,
                strokeWidth: 3,
                marker: true,
                markerSize: 6,
                markerStrokeWidth: 1,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: undefined
            }
        };
    }
}
