import { AreaChartOptions, ChartType, _, FontWeight } from "ag-grid-community";
import { ChartBuilder } from "../../../builder/chartBuilder";
import { AreaSeries } from "../../../../charts/chart/series/areaSeries";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import { CategoryAxis } from "../../../../charts/chart/axis/categoryAxis";
import { CartesianChartProxy, LineMarkerProperty } from "./cartesianChartProxy";
import { GroupedCategoryChart } from "../../../../charts/chart/groupedCategoryChart";

export type AreaSeriesProperty = 'strokeWidth' | 'strokeOpacity' | 'fillOpacity' | 'tooltipEnabled';

export class AreaChartProxy extends CartesianChartProxy<AreaChartOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.chart = ChartBuilder[params.grouping ? "createGroupedAreaChart" : "createAreaChart"](params.parentElement, this.chartOptions);
        this.setAxisPadding(this.chart);

        const areaSeries = ChartBuilder.createSeries(this.chartOptions.seriesDefaults!);

        if (areaSeries) {
            this.chart.addSeries(areaSeries);
        }
    }

    private setAxisPadding(chart: CartesianChart | GroupedCategoryChart) {
        const xAxis = chart.xAxis;

        if (xAxis instanceof CategoryAxis) {
            xAxis.scale.paddingInner = 1;
            xAxis.scale.paddingOuter = 0;
        }
    }

    public update(params: UpdateChartParams): void {
        const chart = this.chart;

        if (this.chartType === ChartType.Area) {
            // area charts have multiple series
            this.updateAreaChart(params);
        } else {
            // stacked and normalized has a single series
            const areaSeries = this.chart.series[0] as AreaSeries;
            const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();

            areaSeries.data = params.data;
            areaSeries.xField = params.category.id;
            areaSeries.yFields = params.fields.map(f => f.colId);
            areaSeries.yFieldNames = params.fields.map(f => f.displayName);
            areaSeries.fills = fills;
            areaSeries.strokes = strokes;
        }

        chart.xAxis.labelRotation = this.overrideLabelRotation(params.category.id) ? 0 : this.chartOptions.xAxis.labelRotation!;
    }

    private updateAreaChart(params: UpdateChartParams) {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const lineChart = this.chart;
        const fieldIds = params.fields.map(f => f.colId);
        const existingSeriesMap: { [id: string]: AreaSeries } = {};
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();
        const seriesOptions = this.chartOptions.seriesDefaults!;

        (lineChart.series as AreaSeries[])
            .forEach(areaSeries => {
                const id = areaSeries.yFields[0];

                _.includes(fieldIds, id) ? existingSeriesMap[id] = areaSeries : lineChart.removeSeries(areaSeries);
            });


        params.fields.forEach((f, index) => {
            const existingSeries = existingSeriesMap[f.colId];
            const areaSeries = existingSeries || ChartBuilder.createSeries(seriesOptions) as AreaSeries;

            if (areaSeries) {
                areaSeries.yFieldNames = [f.displayName];
                areaSeries.data = params.data;
                areaSeries.xField = params.category.id;
                areaSeries.yFields = [f.colId];
                areaSeries.fills = [fills[index % fills.length]];
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
        (this.chartOptions.seriesDefaults as any)[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesProperty(property: AreaSeriesProperty | LineMarkerProperty): string {
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

    protected getDefaultOptions(): AreaChartOptions {
        const { fills, strokes } = this.chartProxyParams.getSelectedPalette();
        const labelColor = this.getLabelColor();
        const stroke = this.getAxisGridColor();
        const labelFontWeight: FontWeight = 'normal';
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
                type: 'area',
                fills,
                strokes,
                strokeWidth: 3,
                strokeOpacity: 1,
                fillOpacity: this.chartType === ChartType.Area ? 0.7 : 1,
                normalizedTo: this.chartType === ChartType.NormalizedArea ? 100 : undefined,
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
                    color: 'rgba(0, 0, 0, 0.5)'
                }
            }
        };
    }
}
