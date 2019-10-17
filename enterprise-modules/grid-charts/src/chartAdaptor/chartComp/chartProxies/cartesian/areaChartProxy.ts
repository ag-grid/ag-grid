import { CartesianChartOptions, AreaSeriesOptions, ChartType, _ } from "ag-grid-community";
import { ChartBuilder } from "../../../../charts/chartBuilder";
import { AreaSeries } from "../../../../charts/chart/series/areaSeries";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import { CategoryAxis } from "../../../../charts/chart/axis/categoryAxis";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { GroupedCategoryChart } from "../../../../charts/chart/groupedCategoryChart";
import { SeriesOptions } from "../../../../charts/chartOptions";

export class AreaChartProxy extends CartesianChartProxy<AreaSeriesOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.chart = ChartBuilder[params.grouping ? "createGroupedAreaChart" : "createAreaChart"](params.parentElement, this.chartOptions);

        this.setAxisPadding(this.chart);

        const areaSeries = ChartBuilder.createSeries({ type: "area", ...this.chartOptions.seriesDefaults });

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
            areaSeries.xField = params.category.id;
            areaSeries.xFieldName = params.category.name;
            areaSeries.yFields = params.fields.map(f => f.colId);
            areaSeries.yFieldNames = params.fields.map(f => f.displayName);
            areaSeries.fills = fills;
            areaSeries.strokes = strokes;
        }

        this.updateLabelRotation(params.category.id);
    }

    private updateAreaChart(params: UpdateChartParams) {
        if (params.fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const chart = this.chart;
        const fieldIds = params.fields.map(f => f.colId);
        const existingSeriesMap: { [id: string]: AreaSeries } = {};
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();
        const seriesOptions: SeriesOptions = { type: "area", ...this.chartOptions.seriesDefaults };

        (chart.series as AreaSeries[])
            .forEach(areaSeries => {
                const id = areaSeries.yFields[0];

                _.includes(fieldIds, id) ? existingSeriesMap[id] = areaSeries : chart.removeSeries(areaSeries);
            });

        params.fields.forEach((f, index) => {
            const existingSeries = existingSeriesMap[f.colId];
            const areaSeries = existingSeries || ChartBuilder.createSeries(seriesOptions) as AreaSeries;

            if (areaSeries) {
                areaSeries.yFieldNames = [f.displayName];
                areaSeries.data = params.data;
                areaSeries.xField = params.category.id;
                areaSeries.xFieldName = params.category.name;
                areaSeries.yFields = [f.colId];
                areaSeries.fills = [fills[index % fills.length]];
                areaSeries.strokes = [strokes[index % strokes.length]];

                if (!existingSeries) {
                    chart.addSeries(areaSeries);
                }
            }
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
            normalizedTo: this.chartType === ChartType.NormalizedArea ? 100 : undefined,
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
}
