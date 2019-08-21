import {ChartType, LineChartOptions, LineSeriesOptions} from "ag-grid-community";
import {ChartBuilder} from "../../../builder/chartBuilder";
import {ChartProxyParams, UpdateChartParams} from "../chartProxy";
import { CartesianChart, CartesianChartLayout } from "../../../../charts/chart/cartesianChart";
import {LineSeries} from "../../../../charts/chart/series/lineSeries";
import {ChartModel} from "../../chartModel";
import {CartesianChartProxy, LineMarkerProperty, LineSeriesProperty} from "./cartesianChartProxy";
import { CategoryAxis } from "../../../../charts/chart/axis/categoryAxis";
import { GroupedCategoryAxis } from "../../../../charts/chart/axis/groupedCategoryAxis";

export class LineChartProxy extends CartesianChartProxy<LineChartOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions(ChartType.Line, this.defaultOptions());

        if (params.grouping) {
            this.chart = ChartBuilder.createGroupedLineChart(this.chartOptions);
        } else {
            this.chart = ChartBuilder.createLineChart(this.chartOptions);
        }
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const lineChart = this.chart as CartesianChart;
        const fieldIds = params.fields.map(f => f.colId);

        const existingSeriesMap: { [id: string]: LineSeries } = {};

        const updateSeries = (lineSeries: LineSeries) => {
            const id = lineSeries.yField as string;
            const seriesExists = fieldIds.indexOf(id) > -1;
            seriesExists ? existingSeriesMap[id] = lineSeries : lineChart.removeSeries(lineSeries);
        };

        lineChart.series.map(series => series as LineSeries).forEach(updateSeries);

        params.fields.forEach((f: { colId: string, displayName: string }, index: number) => {
            const seriesOptions = this.chartOptions.seriesDefaults as LineSeriesOptions;

            const existingSeries = existingSeriesMap[f.colId];
            const lineSeries = existingSeries ? existingSeries : ChartBuilder.createSeries(seriesOptions) as LineSeries;

            if (lineSeries) {
                lineSeries.title = f.displayName;
                lineSeries.data = params.data;
                lineSeries.xField = params.category.id;
                lineSeries.yField = f.colId;

                const palette = this.overriddenPalette ? this.overriddenPalette : this.chartProxyParams.getSelectedPalette();

                const fills = palette.fills;
                lineSeries.fill = fills[index % fills.length];

                const strokes = palette.strokes;
                lineSeries.stroke = strokes[index % strokes.length];

                if (!existingSeries) {
                    lineChart.addSeries(lineSeries);
                }
            }
        });

        const chart = this.chart as CartesianChart;
        // Because of the business requirement of seamless switching between column and bar charts using the same
        // user configs, the xAxis config is used for the vertical y-axis in bar chart mode, and the
        // yAxis config for the horizontal x-axis.
        const categoryAxis = chart.layout === CartesianChartLayout.Horizontal ? chart.yAxis : chart.xAxis;
        // Don't auto rotate horizontal axis labels if categories are generated (indexes) or the axis is a grouped category axis,
        // or the category axis is a vertical axis.
        const noLabelRotation = params.category.id === ChartModel.DEFAULT_CATEGORY
            || categoryAxis instanceof GroupedCategoryAxis
            || chart.layout === CartesianChartLayout.Horizontal;
        if (noLabelRotation) {
            chart.xAxis.labelRotation = 0;
            this.chartOptions.xAxis.labelRotation = 0;
        } else {
            chart.xAxis.labelRotation = this.chartOptions.xAxis.labelRotation as number;
        }
    }

    public setSeriesProperty(property: LineSeriesProperty | LineMarkerProperty, value: any): void {
        const series = this.getChart().series as LineSeries[];
        series.forEach(s => (s[property] as any) = value);

        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }
        this.chartOptions.seriesDefaults[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesProperty(property: LineSeriesProperty | LineMarkerProperty): string {
        return this.chartOptions.seriesDefaults ? `${this.chartOptions.seriesDefaults[property]}` : '';
    }

    public getTooltipsEnabled(): boolean {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.tooltipEnabled : false;
    }

    public getMarkersEnabled(): boolean {
        return this.chartOptions.seriesDefaults ? !!this.chartOptions.seriesDefaults.marker : false;
    }

    private defaultOptions(): LineChartOptions {
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
                type: 'line',
                fills: palette.fills,
                strokes: palette.strokes,
                strokeWidth: 3,
                marker: true,
                markerSize: 6,
                markerStrokeWidth: 1,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                title: ''
            }
        };
    }
}
