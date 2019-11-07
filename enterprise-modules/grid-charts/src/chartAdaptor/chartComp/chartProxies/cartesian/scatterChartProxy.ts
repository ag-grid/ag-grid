import { ChartType, _, ScatterSeriesOptions, CartesianChartOptions } from "@ag-community/grid-core";
import { ChartBuilder } from "../../../../charts/chartBuilder";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { ScatterSeries } from "../../../../charts/chart/series/scatterSeries";
import { ChartDataModel } from "../../chartDataModel";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { SeriesOptions } from "../../../../charts/chartOptions";

export class ScatterChartProxy extends CartesianChartProxy<ScatterSeriesOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.chart = ChartBuilder.createScatterChart(params.parentElement, this.chartOptions);
    }

    public update(params: UpdateChartParams): void {
        const { chart } = this;

        if (params.fields.length < 2) {
            chart.removeAllSeries();
            return;
        }

        const isBubbleChart = this.chartType === ChartType.Bubble;
        const yFields = params.fields.slice(1, params.fields.length).filter((_, i) => !isBubbleChart || i % 2 === 0);
        const fieldIds = yFields.map(f => f.colId);
        const defaultCategorySelected = params.category.id === ChartDataModel.DEFAULT_CATEGORY;
        const { fills, strokes } = this.getPalette();
        const seriesOptions: SeriesOptions = { type: "scatter", ...this.chartOptions.seriesDefaults };
        const xFieldDefinition = params.fields[0];
        const labelFieldDefinition = defaultCategorySelected ? undefined : params.category;

        const existingSeriesById = (chart.series as ScatterSeries[]).reduceRight((map, series) => {
            const id = series.yKey;

            if (series.xKey === xFieldDefinition.colId && _.includes(fieldIds, id)) {
                map.set(id, series);
            } else {
                chart.removeSeries(series);
            }

            return map;
        }, new Map<string, ScatterSeries>());

        yFields.forEach((yFieldDefinition, index) => {
            const existingSeries = existingSeriesById.get(yFieldDefinition.colId);
            const series = existingSeries || ChartBuilder.createSeries(seriesOptions) as ScatterSeries;

            if (!series) { return; }

            series.title = `${xFieldDefinition.displayName} vs ${yFieldDefinition.displayName}`;
            series.xKey = xFieldDefinition.colId;
            series.xName = xFieldDefinition.displayName;
            series.yKey = yFieldDefinition.colId;
            series.yName = yFieldDefinition.displayName;
            series.data = params.data;
            series.marker.fill = fills[index % fills.length];
            series.marker.stroke = strokes[index % strokes.length];

            if (isBubbleChart) {
                const radiusFieldDefinition = params.fields[index * 2 + 2];

                if (radiusFieldDefinition) {
                    series.sizeKey = radiusFieldDefinition.colId;
                    series.sizeName = radiusFieldDefinition.displayName;
                } else {
                    // not enough information to render this series, so ensure it is removed
                    if (existingSeries) {
                        chart.removeSeries(series);
                    }

                    return;
                }
            } else {
                series.sizeKey = series.sizeName = undefined;
            }

            if (labelFieldDefinition) {
                series.labelKey = labelFieldDefinition.id;
                series.labelName = labelFieldDefinition.name;
            } else {
                series.labelKey = series.labelName = undefined;
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
        const isBubble = this.chartType === ChartType.Bubble;
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<ScatterSeriesOptions>;

        options.seriesDefaults = {
            ...options.seriesDefaults,
            fill: {
                ...options.seriesDefaults.fill,
                opacity: isBubble ? 0.7 : 1,
            },
            stroke: {
                ...options.seriesDefaults.stroke,
                width: 3,
            },
            marker: {
                type: 'circle',
                enabled: true,
                size: isBubble ? 30 : 6,
                minSize: isBubble ? 6 : undefined,
                strokeWidth: 1,
            },
            tooltip: {
                enabled: true,
            },
        };

        options.legend.item.marker.type = 'square';

        return options;
    }
}
