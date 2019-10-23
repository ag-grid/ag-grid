import { CartesianChartOptions, AreaSeriesOptions, ChartType, _ } from "@ag-community/grid-core";
import { ChartBuilder } from "../../../../charts/chartBuilder";
import { AreaSeries } from "../../../../charts/chart/series/areaSeries";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import { CategoryAxis } from "../../../../charts/chart/axis/categoryAxis";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { GroupedCategoryChart } from "../../../../charts/chart/groupedCategoryChart";
import { AreaSeriesOptions as InternalAreaSeriesOptions } from "../../../../charts/chartOptions";

export class AreaChartProxy extends CartesianChartProxy<AreaSeriesOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();

        this.chart = ChartBuilder[params.grouping ? "createGroupedAreaChart" : "createAreaChart"](params.parentElement, this.chartOptions);

        this.setAxisPadding(this.chart);

        const areaSeries = ChartBuilder.createSeries(this.getSeriesDefaults());

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
        if (this.chartType === ChartType.Area) {
            // area charts have multiple series
            this.updateAreaChart(params);
        } else {
            // stacked and normalized has a single series
            const areaSeries = this.chart.series[0] as AreaSeries;
            const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();

            areaSeries.data = params.data;
            areaSeries.xKey = params.category.id;
            areaSeries.xName = params.category.name;
            areaSeries.yKeys = params.fields.map(f => f.colId);
            areaSeries.yNames = params.fields.map(f => f.displayName);
            areaSeries.fills = fills;
            areaSeries.strokes = strokes;
        }

        this.updateLabelRotation(params.category.id);
    }

    private updateAreaChart(params: UpdateChartParams) {
        const { chart } = this;

        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }

        const fieldIds = params.fields.map(f => f.colId);
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();

        const existingSeriesById = (chart.series as AreaSeries[]).reduceRight((map, series) => {
            const id = series.yKeys[0];

            if (_.includes(fieldIds, id)) {
                map.set(id, series);
            } else {
                chart.removeSeries(series);
            }

            return map;
        }, new Map<string, AreaSeries>());

        let previousSeries: AreaSeries = undefined;

        params.fields.forEach((f, index) => {
            let areaSeries = existingSeriesById.get(f.colId);
            const fill = fills[index % fills.length];
            const stroke = strokes[index % strokes.length];

            if (areaSeries) {
                areaSeries.data = params.data;
                areaSeries.xKey = params.category.id;
                areaSeries.xName = params.category.name;
                areaSeries.yKeys = [f.colId];
                areaSeries.yNames = [f.displayName];
                areaSeries.fills = [fill];
                areaSeries.marker.fill = fill;
                areaSeries.strokes = [stroke];
                areaSeries.marker.stroke = stroke;
            } else {
                const seriesDefaults = this.getSeriesDefaults();
                const options: InternalAreaSeriesOptions = {
                    ...seriesDefaults,
                    data: params.data,
                    field: {
                        xKey: params.category.id,
                        xName: params.category.name,
                        yKeys: [f.colId],
                        yNames: [f.displayName],
                    },
                    fill: {
                        ...seriesDefaults.fill,
                        colors: [fill],
                    },
                    stroke: {
                        ...seriesDefaults.stroke,
                        colors: [stroke],
                    }
                };

                areaSeries = ChartBuilder.createSeries(options) as AreaSeries;

                chart.addSeriesAfter(areaSeries, previousSeries);
            }

            previousSeries = areaSeries;
        });
    }

    protected getDefaultOptions(): CartesianChartOptions<AreaSeriesOptions> {
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<AreaSeriesOptions>;

        options.xAxis.label.rotation = 335;

        options.seriesDefaults = {
            ...options.seriesDefaults,
            fill: {
                ...options.seriesDefaults.fill,
                opacity: this.chartType === ChartType.Area ? 0.7 : 1,
            },
            stroke: {
                ...options.seriesDefaults.stroke,
                width: 3,
            },
            marker: {
                enabled: true,
                size: 3,
                strokeWidth: 1,
            },
            tooltip: {
                enabled: true,
            },
            shadow: this.getDefaultDropShadowOptions(),
        };

        return options;
    }

    private getSeriesDefaults(): InternalAreaSeriesOptions {
        return {
            ...this.chartOptions.seriesDefaults,
            type: 'area',
            normalizedTo: this.chartType === ChartType.NormalizedArea ? 100 : undefined,
        };
    }
}
