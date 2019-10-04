import { ChartType, ScatterChartOptions, _, FontWeight } from "ag-grid-community";
import { ChartBuilder } from "../../../builder/chartBuilder";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { ScatterSeries } from "../../../../charts/chart/series/scatterSeries";
import { ChartModel } from "../../chartModel";
import { CartesianChartProxy, LineMarkerProperty, ScatterSeriesProperty } from "./cartesianChartProxy";

export class ScatterChartProxy extends CartesianChartProxy<ScatterChartOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.chart = ChartBuilder.createScatterChart(params.parentElement, this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length < 2) {
            this.chart.removeAllSeries();
            return;
        }

        const chart = this.chart;
        const isBubbleChart = this.chartType === ChartType.Bubble;
        const yFields = params.fields.slice(1, params.fields.length).filter((_, i) => !isBubbleChart || i % 2 === 0);
        const fieldIds = yFields.map(f => f.colId);
        const existingSeriesMap: { [id: string]: ScatterSeries } = {};
        const defaultCategorySelected = params.category.id === ChartModel.DEFAULT_CATEGORY;
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();
        const seriesOptions = this.chartOptions.seriesDefaults!;
        const xFieldDefinition = params.fields[0];

        chart.series
            .map(series => series as ScatterSeries)
            .forEach(scatterSeries => {
                const yField = scatterSeries.yField;

                if (scatterSeries.xField === xFieldDefinition.colId && _.includes(fieldIds, yField)) {
                    existingSeriesMap[yField] = scatterSeries;
                } else {
                    chart.removeSeries(scatterSeries);
                }
            });

        const labelFieldDefinition = defaultCategorySelected ? undefined : params.category;

        yFields.forEach((yFieldDefinition, index) => {
            const existingSeries = existingSeriesMap[yFieldDefinition.colId];
            const series = existingSeries || ChartBuilder.createSeries(seriesOptions) as ScatterSeries;

            if (!series) { return; }

            series.title = `${xFieldDefinition.displayName} vs ${yFieldDefinition.displayName}`;
            series.xField = xFieldDefinition.colId;
            series.xFieldName = xFieldDefinition.displayName;
            series.yField = yFieldDefinition.colId;
            series.yFieldName = yFieldDefinition.displayName;
            series.data = params.data;
            series.fill = fills[index % fills.length];
            series.stroke = strokes[index % strokes.length];

            if (isBubbleChart) {
                const radiusFieldDefinition = params.fields[index * 2 + 2];

                if (radiusFieldDefinition) {
                    series.radiusField = radiusFieldDefinition.colId;
                    series.radiusFieldName = radiusFieldDefinition.displayName;
                } else {
                    // not enough information to render this series, so ensure it is removed
                    if (existingSeries) {
                        chart.removeSeries(series);
                    }

                    return;
                }
            } else {
                series.radiusField = series.radiusFieldName = undefined;
            }

            if (labelFieldDefinition) {
                series.labelField = labelFieldDefinition.id;
                series.labelFieldName = labelFieldDefinition.name;
            } else {
                series.labelField = series.labelFieldName = undefined;
            }

            if (!existingSeries) {
                chart.addSeries(series);
            }
        });
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
        const { fills, strokes } = this.chartProxyParams.getSelectedPalette();
        const labelColor = this.getLabelColor();
        const stroke = this.getAxisGridColor();
        const isBubble = this.chartType === ChartType.Bubble;
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
            labelRotation: 0,
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
            },
            yAxis: {
                ...axisOptions,
            },
            seriesDefaults: {
                type: 'scatter',
                fills,
                fillOpacity: isBubble ? 0.7 : 1,
                strokes,
                marker: true,
                markerSize: isBubble ? 30 : 6,
                minMarkerSize: 0,
                markerStrokeWidth: 1,
                tooltipEnabled: true,
                showInLegend: true,
                title: ''
            }
        };
    }
}
