import { LineChartOptions, _ } from "ag-grid-community";
import { ChartBuilder } from "../../../builder/chartBuilder";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { LineSeries } from "../../../../charts/chart/series/lineSeries";
import { CartesianChartProxy, LineMarkerProperty, LineSeriesProperty } from "./cartesianChartProxy";

export class LineChartProxy extends CartesianChartProxy<LineChartOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.chart = ChartBuilder.createLineChart(this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        const chart = this.chart;

        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const lineChart = this.chart;
        const fieldIds = params.fields.map(f => f.colId);
        const existingSeriesMap: { [id: string]: LineSeries } = {};
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();
        const seriesOptions = this.chartOptions.seriesDefaults!;

        lineChart.series
            .map(series => series as LineSeries)
            .forEach(lineSeries => {
                const id = lineSeries.yField;
                
                _.includes(fieldIds, id) ? existingSeriesMap[id] = lineSeries : lineChart.removeSeries(lineSeries);
            });

        params.fields.forEach((f, index) => {
            const existingSeries = existingSeriesMap[f.colId];
            const lineSeries = existingSeries || ChartBuilder.createSeries(seriesOptions) as LineSeries;

            if (lineSeries) {
                lineSeries.title = f.displayName;
                lineSeries.data = params.data;
                lineSeries.xField = params.category.id;
                lineSeries.yField = f.colId;
                lineSeries.fill = fills[index % fills.length];
                lineSeries.stroke = strokes[index % strokes.length];

                if (!existingSeries) {
                    lineChart.addSeries(lineSeries);
                }
            }
        });

        chart.xAxis.labelRotation = this.overrideLabelRotation(params.category.id) ? 0 : this.chartOptions.xAxis.labelRotation!;
    }

    public setSeriesProperty(property: LineSeriesProperty | LineMarkerProperty, value: any): void {
        const series = this.getChart().series as LineSeries[];
        series.forEach(s => (s[property] as any) = value);

        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }
        (this.chartOptions.seriesDefaults as any)[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesProperty(property: LineSeriesProperty | LineMarkerProperty): string {
        const { seriesDefaults } = this.chartOptions;

        return seriesDefaults ? `${seriesDefaults[property]}` : "";
    }

    public getTooltipsEnabled(): boolean {
        const { seriesDefaults } = this.chartOptions;

        return seriesDefaults ? !!seriesDefaults.tooltipEnabled : false;
    }

    public getMarkersEnabled(): boolean {
        const { seriesDefaults } = this.chartOptions;

        return seriesDefaults ? !!seriesDefaults.marker : false;
    }

    protected getDefaultOptions(): LineChartOptions {
        const { fills, strokes } = this.chartProxyParams.getSelectedPalette();
        const labelColor = this.getLabelColor();
        const stroke = this.getAxisGridColor();
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
                labelRotation: 335,
            },
            yAxis: {
                ...axisOptions,
                labelRotation: 0,
            },
            seriesDefaults: {
                type: 'line',
                fills,
                strokes,
                strokeWidth: 3,
                marker: true,
                markerSize: 6,
                markerStrokeWidth: 1,
                tooltipEnabled: true,
                showInLegend: true,
                title: ''
            }
        };
    }
}
