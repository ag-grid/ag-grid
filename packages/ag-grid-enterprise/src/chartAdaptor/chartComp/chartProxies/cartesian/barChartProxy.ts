import { BarChartOptions, ChartType, _ } from "ag-grid-community";
import { ChartBuilder } from "../../../builder/chartBuilder";
import { BarSeries } from "../../../../charts/chart/series/barSeries";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export type BarSeriesProperty = 'strokeWidth' | 'strokeOpacity' | 'fillOpacity' | 'tooltipEnabled';
export type BarSeriesFontProperty = 'labelEnabled' | 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';

export class BarChartProxy extends CartesianChartProxy<BarChartOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();

        this.chart = ChartBuilder[this.isColumnChart() ? "createColumnChart" : "createBarChart"](this.chartOptions);

        const barSeries = ChartBuilder.createSeries(this.chartOptions.seriesDefaults!);

        if (barSeries) { this.chart.addSeries(barSeries); }
    }

    public update(params: UpdateChartParams): void {
        const chart = this.chart;
        const barSeries = chart.series[0] as BarSeries;
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();

        barSeries.data = params.data;
        barSeries.xField = params.category.id;
        barSeries.yFields = params.fields.map(f => f.colId);
        barSeries.yFieldNames = params.fields.map(f => f.displayName);
        barSeries.fills = fills;
        barSeries.strokes = strokes;

        const shouldOverrideLabelRotation = this.overrideLabelRotation(params.category.id);

        if (this.isColumnChart()) {
            chart.xAxis.labelRotation = shouldOverrideLabelRotation ? 0 : this.chartOptions.xAxis.labelRotation!;
        } else {
            chart.yAxis.labelRotation = shouldOverrideLabelRotation ? 0 : this.chartOptions.yAxis.labelRotation!;
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

    private isColumnChart = () => _.includes([ ChartType.GroupedColumn, ChartType.StackedColumn, ChartType.NormalizedColumn ], this.chartType);

    protected getDefaultOptions(): BarChartOptions {
        const { fills, strokes } = this.chartProxyParams.getSelectedPalette();
        const labelColor = this.getLabelColor();
        const stroke = this.getAxisGridColor();
        const chartType = this.chartType;
        const isColumnChart = this.isColumnChart();
        const isGrouped = chartType === ChartType.GroupedColumn || chartType === ChartType.GroupedBar;
        const isNormalized = chartType === ChartType.NormalizedColumn || chartType === ChartType.NormalizedBar;
        const labelFontWeight = 'normal';
        const labelFontSize = 12;
        const labelFontFamily = 'Verdana, sans-serif';
        const axisColor = 'rgba(195, 195, 195, 1)';
        const axisOptions = {
            labelFontWeight,
            labelFontSize,
            labelFontFamily,
            labelColor,
            labelPadding: 5,
            tickColor: axisColor,
            tickSize: 6,
            tickWidth: 1,
            lineColor: axisColor,
            lineWidth: 1,
            gridStyle: [{
                stroke,
                lineDash: [4, 2]
            }]
        };

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
                labelFontWeight,
                labelFontSize,
                labelFontFamily,
                labelColor,
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerPadding: 4,
                markerSize: 14,
                markerStrokeWidth: 1
            },
            xAxis: {
                ...axisOptions,
                labelRotation: isColumnChart ? 335 : 0,
            },
            yAxis: {
                ...axisOptions,
                labelRotation: isColumnChart ? 0 : 335,
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
                labelFontWeight,
                labelFontSize,
                labelFontFamily,
                labelColor,
                tooltipRenderer: undefined,
                showInLegend: true,
                shadow: {
                    enabled: false,
                    blur: 5,
                    xOffset: 3,
                    yOffset: 3,
                    color: 'rgba(0, 0, 0, 0.5)'
                },
                strokeOpacity: 1,
                fillOpacity: 1
            }
        };
    }
}
