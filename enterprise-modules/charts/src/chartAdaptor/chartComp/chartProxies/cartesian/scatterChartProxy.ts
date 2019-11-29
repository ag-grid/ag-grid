import { ChartType, _, ScatterSeriesOptions, CartesianChartOptions } from "@ag-grid-community/core";
import { ChartBuilder } from "../../../../charts/chartBuilder";
import { ChartProxyParams, UpdateChartParams, FieldDefinition } from "../chartProxy";
import { ScatterSeries } from "../../../../charts/chart/series/cartesian/scatterSeries";
import { ChartDataModel } from "../../chartDataModel";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { SeriesOptions } from "../../../../charts/chartOptions";

interface SeriesDefinition {
    xField: FieldDefinition;
    yField: FieldDefinition;
    sizeField?: FieldDefinition;
}

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

        const { fields } = params;
        const seriesDefinitions = this.getSeriesDefinitions(fields, this.chartOptions.seriesDefaults.paired);
        const defaultCategorySelected = params.category.id === ChartDataModel.DEFAULT_CATEGORY;
        const { fills, strokes } = this.getPalette();
        const seriesOptions: SeriesOptions = { type: "scatter", ...this.chartOptions.seriesDefaults };
        const labelFieldDefinition = defaultCategorySelected ? undefined : params.category;

        const existingSeriesById = (chart.series as ScatterSeries[]).reduceRight((map, series, i) => {
            const matchingIndex = _.findIndex(seriesDefinitions, s =>
                s.xField.colId === series.xKey &&
                s.yField.colId === series.yKey &&
                ((!s.sizeField && !series.sizeKey) || (s.sizeField && s.sizeField.colId === series.sizeKey)));

            if (matchingIndex === i) {
                map.set(series.yKey, series);
            } else {
                chart.removeSeries(series);
            }

            return map;
        }, new Map<string, ScatterSeries>());

        let previousSeries: ScatterSeries | undefined = undefined;

        seriesDefinitions.forEach((seriesDefinition, index) => {
            const existingSeries = existingSeriesById.get(seriesDefinition.yField.colId);
            const series = existingSeries || ChartBuilder.createSeries(seriesOptions) as ScatterSeries;

            if (!series) {
                return;
            }

            const { xField: xFieldDefinition, yField: yFieldDefinition, sizeField: sizeFieldDefinition } = seriesDefinition;

            series.title = `${xFieldDefinition.displayName} vs ${yFieldDefinition.displayName}`;
            series.xKey = xFieldDefinition.colId;
            series.xName = xFieldDefinition.displayName;
            series.yKey = yFieldDefinition.colId;
            series.yName = yFieldDefinition.displayName;
            series.data = params.data;
            series.fill = fills[index % fills.length];
            series.stroke = strokes[index % strokes.length];

            if (sizeFieldDefinition) {
                series.sizeKey = sizeFieldDefinition.colId;
                series.sizeName = sizeFieldDefinition.displayName;
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
                chart.addSeriesAfter(series, previousSeries);
            }

            previousSeries = series;
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
            paired: false,
        };

        return options;
    }

    private getSeriesDefinitions(fields: FieldDefinition[], paired: boolean): SeriesDefinition[] {
        if (fields.length < 2) {
            return [];
        }

        const isBubbleChart = this.chartType === ChartType.Bubble;

        if (paired) {
            if (isBubbleChart) {
                return fields.map((xField, i) => i % 3 === 0 ? ({
                    xField,
                    yField: fields[i + 1],
                    sizeField: fields[i + 2],
                }) : null).filter(x => x && x.yField && x.sizeField);
            } else {
                return fields.map((xField, i) => i % 2 === 0 ? ({
                    xField,
                    yField: fields[i + 1],
                }) : null).filter(x => x && x.yField);
            }
        } else {
            const xField = fields[0];

            if (isBubbleChart) {
                return fields
                    .map((yField, i) => i % 2 === 1 ? ({
                        xField,
                        yField,
                        sizeField: fields[i + 1],
                    }) : null)
                    .filter(x => x && x.sizeField);
            } else {
                return fields.filter((_, i) => i > 0).map(yField => ({ xField, yField }));
            }
        }
    }
}
