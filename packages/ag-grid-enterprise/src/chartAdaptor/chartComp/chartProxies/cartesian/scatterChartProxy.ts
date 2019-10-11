import { ChartType, _, ScatterSeriesOptions, CartesianChartOptions } from "ag-grid-community";
import { ChartBuilder } from "../../../../charts/chartBuilder";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { ScatterSeries } from "../../../../charts/chart/series/scatterSeries";
import { ChartModel } from "../../chartModel";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { SeriesOptions } from "../../../../charts/chartOptions";

export class ScatterChartProxy extends CartesianChartProxy<ScatterSeriesOptions> {
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
        const seriesOptions: SeriesOptions = { type: "scatter", ...this.chartOptions.seriesDefaults };
        const xFieldDefinition = params.fields[0];

        (chart.series as ScatterSeries[])
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
                    series.sizeKey = radiusFieldDefinition.colId;
                    series.sizeKeyName = radiusFieldDefinition.displayName;
                } else {
                    // not enough information to render this series, so ensure it is removed
                    if (existingSeries) {
                        chart.removeSeries(series);
                    }

                    return;
                }
            } else {
                series.sizeKey = series.sizeKeyName = undefined;
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

    public getTooltipsEnabled(): boolean {
        return this.chartOptions.seriesDefaults.tooltip != null && !!this.chartOptions.seriesDefaults.tooltip.enabled;
    }

    public getMarkersEnabled = (): boolean => true; // markers are always enabled on scatter charts

    protected getDefaultOptions(): CartesianChartOptions<ScatterSeriesOptions> {
        const { fills, strokes } = this.chartProxyParams.getSelectedPalette();
        const isBubble = this.chartType === ChartType.Bubble;
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<ScatterSeriesOptions>;

        options.seriesDefaults = {
            fill: {
                colors: fills,
                opacity: isBubble ? 0.7 : 1,
            },
            stroke: {
                colors: strokes,
                width: 3,
            },
            marker: {
                enabled: true,
                size: 6,
                minRequiredSize: 0,
                strokeWidth: 1,
            },
            tooltip: {
                enabled: true,
            },
        };

        return options;
    }
}
