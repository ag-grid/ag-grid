import { ChartType, ScatterChartOptions, _ } from "ag-grid-community";
import { ChartBuilder } from "../../../builder/chartBuilder";
import { ChartProxyParams, UpdateChartParams, FieldDefinition } from "../chartProxy";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import { ScatterSeries } from "../../../../charts/chart/series/scatterSeries";
import { ChartModel } from "../../chartModel";
import { CartesianChartProxy, LineMarkerProperty, ScatterSeriesProperty } from "./cartesianChartProxy";

export class ScatterChartProxy extends CartesianChartProxy<ScatterChartOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.chart = ChartBuilder.createScatterChart(this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const chart = this.chart as CartesianChart;
        const fieldIds = params.fields.map(f => f.colId);
        const existingSeriesMap: { [id: string]: ScatterSeries } = {};
        const defaultCategorySelected = params.category.id === ChartModel.DEFAULT_CATEGORY;
        const isBubbleChart = this.chartType === ChartType.Bubble;
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();
        const seriesOptions = this.chartOptions.seriesDefaults!;

        chart.series
            .map(series => series as ScatterSeries)
            .forEach(scatterSeries => {
                const id = scatterSeries.yField;

                _.includes(fieldIds, id) ? existingSeriesMap[id] = scatterSeries : chart.removeSeries(scatterSeries);
            });

        const updateFunc = (f: FieldDefinition, index: number): void => {
            const existingSeries = existingSeriesMap[f.colId];
            const scatterSeries = existingSeries || ChartBuilder.createSeries(seriesOptions) as ScatterSeries;

            if (scatterSeries) {
                if (defaultCategorySelected) {
                    scatterSeries.title = `${params.fields[0].displayName} vs ${f.displayName}`;
                    scatterSeries.xField = params.fields[0].colId;
                    scatterSeries.xFieldName = params.fields[0].displayName;

                    if (isBubbleChart) {
                        const radiusFieldDefinition = params.fields[index * 2 + 2];
                        scatterSeries.radiusField = radiusFieldDefinition.colId;
                        scatterSeries.radiusFieldName = radiusFieldDefinition.displayName;
                    }
                } else {
                    scatterSeries.title = f.displayName;
                    scatterSeries.xField = params.category.id;
                    scatterSeries.xFieldName = params.category.name;
                }

                scatterSeries.data = params.data;
                scatterSeries.yField = f.colId;
                scatterSeries.yFieldName = f.displayName;
                scatterSeries.fill = fills[index % fills.length];
                scatterSeries.stroke = strokes[index % strokes.length];

                if (!existingSeries) {
                    chart.addSeries(scatterSeries);
                }
            }
        };

        if (defaultCategorySelected) {
            if (isBubbleChart) {
                // only update bubble chart if the correct number of fields are present
                const len = params.fields.length;
                const offset = len % 2 === 0 ? 1 : 0;
                const fields: typeof params.fields = [];

                for (let i = 1; i < len - offset; i += 2) {
                    fields.push(params.fields[i]);
                }

                fields.forEach(updateFunc);
            } else {
                params.fields.slice(1, params.fields.length).forEach(updateFunc);
            }
        } else {
            params.fields.forEach(updateFunc);
        }

        chart.xAxis.labelRotation = this.overrideLabelRotation(params.category.id) ? 0 : this.chartOptions.xAxis.labelRotation!;
    }

    public setSeriesProperty(property: ScatterSeriesProperty | LineMarkerProperty, value: any): void {
        const series = this.getChart().series as ScatterSeries[];
        series.forEach(s => (s[property] as any) = value);

        if (!this.chartOptions.seriesDefaults) {
            this.chartOptions.seriesDefaults = {};
        }
        (this.chartOptions.seriesDefaults as any)[property] = value;

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesProperty(property: ScatterSeriesProperty | LineMarkerProperty): string {
        const { seriesDefaults } = this.chartOptions;

        return seriesDefaults ? `${seriesDefaults[property]}` : "";
    }

    public getTooltipsEnabled(): boolean {
        const { seriesDefaults } = this.chartOptions;

        return seriesDefaults ? !!seriesDefaults.tooltipEnabled : false;
    }

    public getMarkersEnabled = (): boolean => true; // markers are always enabled on scatter charts

    protected getDefaultOptions(): ScatterChartOptions {
        const xAxisType = this.chartProxyParams.categorySelected ? 'category' : 'number';
        const { fills, strokes } = this.chartProxyParams.getSelectedPalette();
        const labelColor = this.getLabelColor();
        const stroke = this.getAxisGridColor();
        const isBubble = this.chartType === ChartType.Bubble;

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
                type: xAxisType,
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
                type: 'scatter',
                fills,
                fillOpacity: isBubble ? 0.7 : 1,
                strokes,
                marker: true,
                markerSize: isBubble ? 30 : 6,
                minMarkerSize: 3,
                markerStrokeWidth: 1,
                tooltipEnabled: true,
                tooltipRenderer: undefined,
                showInLegend: true,
                title: ''
            }
        };
    }
}
