import { BarChartOptions, ChartType, _ } from "ag-grid-community";
import { ChartBuilder } from "../../../builder/chartBuilder";
import { BarSeries } from "../../../../charts/chart/series/barSeries";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import { CartesianChartProxy } from "./cartesianChartProxy";

export type BarSeriesProperty = 'strokeWidth' | 'strokeOpacity' | 'fillOpacity' | 'tooltipEnabled';
export type BarSeriesFontProperty = 'labelEnabled' | 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';

export class BarChartProxy extends CartesianChartProxy<BarChartOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        let builderFunction: keyof typeof ChartBuilder;

        if (this.isBarChart()) {
            builderFunction = params.grouping ? "createGroupedBarChart" : "createBarChart";
        } else {
            builderFunction = params.grouping ? "createGroupedColumnChart" : "createColumnChart";
        }

        this.chart = ChartBuilder[builderFunction](this.chartOptions);

        const barSeries = ChartBuilder.createSeries(this.chartOptions.seriesDefaults!);

        if (barSeries) { this.chart.addSeries(barSeries); }
    }

    public update(params: UpdateChartParams): void {
        const chart = this.chart as CartesianChart;
        const barSeries = chart.series[0] as BarSeries;
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();

        barSeries.data = params.data;
        barSeries.xField = params.category.id;
        barSeries.yFields = params.fields.map(f => f.colId);
        barSeries.yFieldNames = params.fields.map(f => f.displayName);
        barSeries.fills = fills;
        barSeries.strokes = strokes;

        const shouldOverrideLabelRotation = this.overrideLabelRotation(params.category.id);

        if (this.isBarChart()) {
            chart.yAxis.labelRotation = shouldOverrideLabelRotation ? 0 : this.chartOptions.yAxis.labelRotation!;
        } else {
            chart.xAxis.labelRotation = shouldOverrideLabelRotation ? 0 : this.chartOptions.xAxis.labelRotation!;
        }
    }

    public setSeriesProperty(property: BarSeriesProperty | BarSeriesFontProperty, value: any): void {
        const series = this.getChart().series as BarSeries[];
        series.forEach(s => (s[property] as any) = value);

        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }
        (this.chartOptions.seriesDefaults as any)[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesProperty(property: BarSeriesProperty | BarSeriesFontProperty): string {
        const { seriesDefaults } = this.chartOptions;

        return seriesDefaults ? `${seriesDefaults[property]}` : "";
    }

    public getTooltipsEnabled(): boolean {
        const { seriesDefaults } = this.chartOptions;

        return seriesDefaults ? !!seriesDefaults.tooltipEnabled : false;
    }

    public getLabelEnabled(): boolean {
        const { seriesDefaults } = this.chartOptions;

        return seriesDefaults ? !!seriesDefaults.labelEnabled : false;
    }

    private isBarChart = () => _.includes([ ChartType.GroupedBar, ChartType.StackedBar, ChartType.NormalizedBar ], this.chartType);

    protected getDefaultOptions(): BarChartOptions {
        const { fills, strokes } = this.chartProxyParams.getSelectedPalette();
        const labelColor = this.getLabelColor();
        const stroke = this.getAxisGridColor();
        const chartType = this.chartType;
        const isGrouped = chartType === ChartType.GroupedColumn || chartType === ChartType.GroupedBar;
        const isNormalized = chartType === ChartType.NormalizedColumn || chartType === ChartType.NormalizedBar;

        return {
            parent: this.chartProxyParams.parentElement,
            background: {
                fill: this.getBackgroundColor()
            },
            width: 800,
            height: 400,
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
                labelColor,
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
                labelColor,
                labelRotation: 335,
                tickColor: 'rgba(195, 195, 195, 1)',
                tickSize: 6,
                tickWidth: 1,
                tickPadding: 5,
                lineColor: 'rgba(195, 195, 195, 1)',
                lineWidth: 1,
                gridStyle: [{
                    stroke,
                    lineDash: [4, 2]
                }]
            },
            yAxis: {
                type: 'number',
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor,
                labelRotation: 0,
                tickColor: 'rgba(195, 195, 195, 1)',
                tickSize: 6,
                tickWidth: 1,
                tickPadding: 5,
                lineColor: 'rgba(195, 195, 195, 1)',
                lineWidth: 1,
                gridStyle: [{
                    stroke,
                    lineDash: [4, 2]
                }]
            },
            seriesDefaults: {
                type: 'bar',
                fills,
                strokes,
                grouped: isGrouped,
                normalizedTo: isNormalized ? 100 : undefined,
                strokeWidth: 1,
                tooltipEnabled: true,
                labelEnabled: false,
                labelFontStyle: undefined,
                labelFontWeight: 'normal',
                labelFontSize: 12,
                labelFontFamily: 'Verdana, sans-serif',
                labelColor,
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
