import {AreaChartOptions, AreaSeriesOptions, ChartType} from "ag-grid-community";
import {ChartBuilder} from "../../../builder/chartBuilder";
import {AreaSeries} from "../../../../charts/chart/series/areaSeries";
import {ChartProxyParams, UpdateChartParams} from "../chartProxy";
import {CartesianChart} from "../../../../charts/chart/cartesianChart";
import {CategoryAxis} from "../../../../charts/chart/axis/categoryAxis";
import {CartesianChartProxy, LineMarkerProperty} from "./cartesianChartProxy";

export type AreaSeriesProperty = 'strokeWidth' | 'strokeOpacity' | 'fillOpacity' | 'tooltipEnabled';

export class AreaChartProxy extends CartesianChartProxy<AreaChartOptions> {

    private readonly chartType: ChartType;

    public constructor(params: ChartProxyParams) {
        super(params);

        this.chartType = params.chartType;

        this.initChartOptions(params.chartType, this.defaultOptions());

        if (params.grouping) {
            this.chart = ChartBuilder.createGroupedAreaChart(this.chartOptions);
        } else {
            this.chart = ChartBuilder.createAreaChart(this.chartOptions);
        }

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
        const chart = this.chart as CartesianChart;

        if (this.chartType === ChartType.Area) {
            // area charts have multiple series
            this.updateAreaChart(params);

        } else {
            // stacked and normalized has a single series
            const areaSeries = this.chart.series[0] as AreaSeries;

            areaSeries.data = params.data;
            areaSeries.xField = params.category.id;
            areaSeries.yFields = params.fields.map(f => f.colId);
            areaSeries.yFieldNames = params.fields.map(f => f.displayName);

            const palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();

            areaSeries.fills = palette.fills;
            areaSeries.strokes = palette.strokes;
        }

        chart.xAxis.labelRotation = this.overrideLabelRotation(params.category.id) ? 0 : this.chartOptions.xAxis.labelRotation as number;
    }

    private updateAreaChart(params: UpdateChartParams) {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const lineChart = this.chart as CartesianChart;
        const fieldIds = params.fields.map(f => f.colId);

        const existingSeriesMap: { [id: string]: AreaSeries } = {};

        const updateSeries = (areaSeries: AreaSeries) => {
            const id = areaSeries.yFields[0] as string;
            const seriesExists = fieldIds.indexOf(id) > -1;
            seriesExists ? existingSeriesMap[id] = areaSeries : lineChart.removeSeries(areaSeries);
        };

        lineChart.series.map(series => series as AreaSeries).forEach(updateSeries);

        params.fields.forEach((f: { colId: string, displayName: string }, index: number) => {
            const seriesOptions = this.chartOptions.seriesDefaults as AreaChartOptions;

            const existingSeries = existingSeriesMap[f.colId];
            const areaSeries = existingSeries ? existingSeries : ChartBuilder.createSeries(seriesOptions) as AreaSeries;

            if (areaSeries) {
                areaSeries.yFieldNames = [f.displayName];
                areaSeries.data = params.data;
                areaSeries.xField = params.category.id;
                areaSeries.yFields = [f.colId];

                const palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();

                const fills = palette.fills;
                areaSeries.fills = [fills[index % fills.length]];

                const strokes = palette.strokes;
                areaSeries.strokes = [strokes[index % strokes.length]];

                if (!existingSeries) {
                    lineChart.addSeries(areaSeries);
                }
            }
        });
    }

    public setSeriesProperty(property: AreaSeriesProperty | LineMarkerProperty, value: any): void {
        const series = this.getChart().series as AreaSeries[];
        series.forEach(s => (s[property] as any) = value);

        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }
        this.chartOptions.seriesDefaults[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesProperty(property: AreaSeriesProperty | LineMarkerProperty): string {
        return this.chartOptions.seriesDefaults ? `${this.chartOptions.seriesDefaults[property]}` : '';
    }

    public getTooltipsEnabled(): boolean {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.tooltipEnabled : false;
    }

    public getMarkersEnabled(): boolean {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.marker : false;
    }

    private defaultOptions(): AreaChartOptions {
        const palette = this.chartProxyParams.getSelectedPalette();

        return {
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
                type: 'area',
                fills: palette.fills,
                strokes: palette.strokes,
                strokeWidth: 3,
                strokeOpacity: 1,
                fillOpacity: this.chartProxyParams.chartType === ChartType.Area ? 0.7 : 1,
                normalizedTo: this.chartProxyParams.chartType === ChartType.NormalizedArea ? 100 : undefined,
                marker: true,
                markerSize: 6,
                markerStrokeWidth: 1,
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
