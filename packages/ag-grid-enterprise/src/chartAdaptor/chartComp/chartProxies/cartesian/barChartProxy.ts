import {BarChartOptions, BarSeriesOptions, ChartType} from "ag-grid-community";
import {ChartBuilder} from "../../../builder/chartBuilder";
import {BarSeries} from "../../../../charts/chart/series/barSeries";
import {ChartProxyParams, UpdateChartParams} from "../chartProxy";
import {CartesianChart} from "../../../../charts/chart/cartesianChart";
import {CartesianChartProxy} from "./cartesianChartProxy";

export type BarSeriesProperty = 'strokeWidth' | 'strokeOpacity' | 'fillOpacity' | 'tooltipEnabled';
export type BarSeriesFontProperty = 'labelEnabled' | 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';

export class BarChartProxy extends CartesianChartProxy<BarChartOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions(params.chartType, this.defaultOptions());

        if (params.grouping) {
            this.chart = BarChartProxy.isBarChart(params.chartType) ?
                ChartBuilder.createGroupedBarChart(this.chartOptions) : ChartBuilder.createGroupedColumnChart(this.chartOptions);
        } else {
            this.chart = BarChartProxy.isBarChart(params.chartType) ?
                ChartBuilder.createBarChart(this.chartOptions) : ChartBuilder.createColumnChart(this.chartOptions);
        }

        const barSeries = ChartBuilder.createSeries(this.chartOptions.seriesDefaults as BarSeriesOptions);
        if (barSeries) { this.chart.addSeries(barSeries); }
    }

    public update(params: UpdateChartParams): void {
        const chart = this.chart as CartesianChart;
        const barSeries = chart.series[0] as BarSeries;
        barSeries.data = params.data;
        barSeries.xField = params.category.id;
        barSeries.yFields = params.fields.map(f => f.colId);
        barSeries.yFieldNames = params.fields.map(f => f.displayName);

        if (BarChartProxy.isBarChart(this.chartProxyParams.chartType)) {
            chart.yAxis.labelRotation = this.overrideLabelRotation(params.category.id) ? 0 : this.chartOptions.yAxis.labelRotation as number;
        } else {
            chart.xAxis.labelRotation = this.overrideLabelRotation(params.category.id) ? 0 : this.chartOptions.xAxis.labelRotation as number;
        }

        const palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();
        barSeries.fills = palette.fills;
        barSeries.strokes = palette.strokes;
    }

    public setSeriesProperty(property: BarSeriesProperty | BarSeriesFontProperty, value: any): void {
        const series = this.getChart().series as BarSeries[];
        series.forEach(s => (s[property] as any) = value);

        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }
        this.chartOptions.seriesDefaults[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesProperty(property: BarSeriesProperty | BarSeriesFontProperty): string {
        return this.chartOptions.seriesDefaults ? `${this.chartOptions.seriesDefaults[property]}` : '';
    }

    public getTooltipsEnabled(): boolean {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.tooltipEnabled : false;
    }

    public getLabelEnabled(): boolean {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.labelEnabled : false;
    }

    private static isBarChart(type: ChartType) {
        return type === ChartType.GroupedBar || type === ChartType.StackedBar || type === ChartType.NormalizedBar;
    }

    private defaultOptions(): BarChartOptions {
        const palette = this.chartProxyParams.getSelectedPalette();
        const chartType = this.chartProxyParams.chartType;

        return {
            parent: this.chartProxyParams.parentElement,
            background: {
                fill: this.getBackgroundColor()
            },
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            legendPosition: 'right',
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
            xAxis: {
                type: 'category',
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 335,
                tickColor: 'rgba(195, 195, 195, 1)',
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
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                labelRotation: 0,
                tickColor: 'rgba(195, 195, 195, 1)',
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
            seriesDefaults: {
                type: 'bar',
                fills: palette.fills,
                strokes: palette.strokes,
                grouped: chartType === ChartType.GroupedColumn || chartType === ChartType.GroupedBar,
                normalizedTo: (chartType === ChartType.NormalizedColumn || chartType === ChartType.NormalizedBar) ? 100 : undefined,
                strokeWidth: 1,
                tooltipEnabled: true,
                labelEnabled: false,
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor: this.getLabelColor(),
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: {
                    enabled: false,
                    blur: 5,
                    xOffset: 3,
                    yOffset: 3,
                    color: 'rgba(0,0,0,0.5)'
                },
                strokeOpacity: 1,
                fillOpacity: 1
            }
        };
    }
}
