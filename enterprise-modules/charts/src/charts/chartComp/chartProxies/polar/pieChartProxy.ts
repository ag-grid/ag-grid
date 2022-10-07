import { ChartProxy, ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { AgChart, PieTooltipRendererParams, PolarChart, AgChartLegendClickEvent } from "ag-charts-community";
import {
    AgPieSeriesOptions,
    AgPolarChartOptions,
    AgPolarSeriesOptions
} from "ag-charts-community/src/chart/agChartOptions";
import { changeOpacity } from "../../utils/color";
import { deepMerge } from "../../utils/object";

interface DoughnutOffset {
    offsetAmount: number;
    currentOffset: number;
}

export class PieChartProxy extends ChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);
        this.recreateChart();
    }

    protected createChart(): PolarChart {
        return AgChart.create({
            type: 'pie',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    }

    public update(params: UpdateChartParams): void {
        const { data, category } = params;

        let options: AgPolarChartOptions = {
            ...this.getCommonChartOptions(),
            data: this.crossFiltering ? this.getCrossFilterData(params) : this.transformData(data, category.id),
            series: this.getSeries(params)
        }

        if (this.crossFiltering) {
            options = this.getCrossFilterChartOptions(options);
        }

        AgChart.update(this.chart as PolarChart, options);
    }

    private getSeries(params: UpdateChartParams): AgPolarSeriesOptions[] {
        const numFields = params.fields.length;

        const offset = {
            currentOffset: 0,
            offsetAmount: numFields > 1 ? 20 : 40
        };

        const series = this.getFields(params).map((f: FieldDefinition) => {
            const seriesDefaults = this.extractSeriesOverrides();

            // options shared by 'pie' and 'doughnut' charts
            const options = {
                ...seriesDefaults,
                type: this.standaloneChartType,
                angleKey: f.colId,
                angleName: f.displayName!,
                calloutLabelKey: params.category.id,
                calloutLabelName: params.category.name,
            }

            if (this.chartType === 'doughnut') {
                const { outerRadiusOffset, innerRadiusOffset } = PieChartProxy.calculateOffsets(offset);

                // augment shared options with 'doughnut' specific options
                return {
                    ...options,
                    outerRadiusOffset,
                    innerRadiusOffset,
                    title: {
                        ...seriesDefaults.title,
                        text: seriesDefaults.title.text || f.displayName,
                        showInLegend: numFields > 1,
                    },
                    calloutLine: {
                        ...seriesDefaults.calloutLine,
                        colors: this.chartTheme.palette.strokes,
                    }
                }
            }

            return options;
        });

        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    }

    private getCrossFilterChartOptions(options: AgPolarChartOptions) {
        const seriesOverrides = this.extractSeriesOverrides();
        return {
            ...options,
            tooltip: {
                ...seriesOverrides.tooltip,
                delay: 500,
            },
            legend: {
                ...seriesOverrides.legend,
                listeners: {
                    legendItemClick: (e: AgChartLegendClickEvent) => {
                        this.chart.series.forEach(s => s.toggleSeriesItem(e.itemId, e.enabled));
                    }
                }
            }
        }
    }

    private getCrossFilterData(params: UpdateChartParams) {
        const colId = params.fields[0].colId;
        const filteredOutColId = `${colId}-filtered-out`;

        return params.data.map(d => {
            const total = d[colId] + d[filteredOutColId];
            d[`${colId}-total`] = total;
            d[filteredOutColId] = 1; // normalise to 1
            d[colId] = d[colId] / total; // fraction of 1
            return d;
        });
    }

    private extractCrossFilterSeries(series: AgPieSeriesOptions[]) {
        const palette = this.chartTheme.palette;
        const seriesOverrides = this.extractSeriesOverrides();

        const primaryOptions = (seriesOptions: AgPieSeriesOptions) => {
            return {
                ...seriesOptions,
                calloutLabel: { enabled: false }, // hide labels on primary series
                highlightStyle: { item: { fill: undefined } },
                radiusKey: seriesOptions.angleKey,
                angleKey: seriesOptions.angleKey + '-total',
                radiusMin: 0,
                radiusMax: 1,
                listeners: {
                    ...seriesOverrides.listeners,
                    nodeClick: this.crossFilterCallback,
                },
                tooltip: {
                    ...seriesOverrides.tooltip,
                    renderer: this.getCrossFilterTooltipRenderer(`${seriesOptions.angleName}`),
                }
            };
        }

        const filteredOutOptions = (seriesOptions: AgPieSeriesOptions, angleKey: string) => {
            return {
                ...deepMerge({}, primaryOpts),
                radiusKey: angleKey + '-filtered-out',
                calloutLabel: seriesOverrides.calloutLabel, // labels can be shown on the 'filtered-out' series
                calloutLine: seriesOverrides.calloutLine && {
                    ...seriesOverrides.calloutLine,
                    colors: seriesOverrides.calloutLine.colors ?? palette.strokes,
                },
                fills: changeOpacity(seriesOptions.fills ?? palette.fills, 0.3),
                strokes: changeOpacity(seriesOptions.strokes ?? palette.strokes, 0.3),
                showInLegend: false,
            };
        }

        // currently, only single 'doughnut' cross-filter series are supported
        const primarySeries = series[0];

        // update primary series
        const angleKey = primarySeries.angleKey!;
        const primaryOpts = primaryOptions(primarySeries);

        return [
            filteredOutOptions(primarySeries, angleKey),
            primaryOpts,
        ];
    }

    private static calculateOffsets(offset: DoughnutOffset) {
        const outerRadiusOffset = offset.currentOffset;
        offset.currentOffset -= offset.offsetAmount;

        const innerRadiusOffset = offset.currentOffset;
        offset.currentOffset -= offset.offsetAmount;

        return { outerRadiusOffset, innerRadiusOffset };
    }

    private getFields(params: UpdateChartParams) {
        return this.chartType === 'pie' ? params.fields.slice(0, 1) : params.fields;
    }

    private getCrossFilterTooltipRenderer(title: string) {
        return (params: PieTooltipRendererParams) => {
            const label = params.datum[params.calloutLabelKey as string];
            const ratio = params.datum[params.radiusKey as string];
            const totalValue = params.angleValue;
            return { title, content: `${label}: ${totalValue * ratio}` };
        }
    }

    protected extractSeriesOverrides() {
        return this.chartOptions[this.standaloneChartType].series;
    }

    public crossFilteringReset() {
        // not required in pie charts
    }
}