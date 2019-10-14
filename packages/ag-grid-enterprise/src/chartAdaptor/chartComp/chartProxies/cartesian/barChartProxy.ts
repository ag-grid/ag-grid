import { ChartType, _, BarSeriesOptions, CartesianChartOptions } from "ag-grid-community";
import { ChartBuilder } from "../../../../charts/chartBuilder";
import { BarSeries } from "../../../../charts/chart/series/barSeries";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";

export type BarSeriesProperty = 'strokeWidth' | 'strokeOpacity' | 'fillOpacity' | 'tooltipEnabled';
export type BarSeriesFontProperty = 'labelEnabled' | 'labelFontFamily' | 'labelFontStyle' | 'labelFontWeight' | 'labelFontSize' | 'labelColor';

export class BarChartProxy extends CartesianChartProxy<BarSeriesOptions> {
    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();

        let builderFunction: keyof typeof ChartBuilder;
        if (this.isColumnChart()) {
            builderFunction = params.grouping ? "createGroupedColumnChart" : "createColumnChart";
        } else {
            builderFunction = params.grouping ? "createGroupedBarChart" : "createBarChart";
        }

        this.chart = ChartBuilder[builderFunction](params.parentElement, this.chartOptions);

        const barSeries = ChartBuilder.createSeries({ type: "bar", ...this.chartOptions.seriesDefaults });

        if (barSeries) {
            this.chart.addSeries(barSeries);
        }
    }

    public update(params: UpdateChartParams): void {
        const chart = this.chart;
        const barSeries = chart.series[0] as BarSeries;
        const { fills, strokes } = this.overriddenPalette || this.chartProxyParams.getSelectedPalette();

        barSeries.data = params.data;
        barSeries.xField = params.category.id;
        barSeries.yFields = params.fields.map(f => f.colId);
        barSeries.yFieldNames = params.fields.map(f => f.displayName);
        barSeries.fills = fills;
        barSeries.strokes = strokes;

        this.updateLabelRotation(params.category.id, !this.isColumnChart());
    }

    private isColumnChart = () => _.includes([ChartType.GroupedColumn, ChartType.StackedColumn, ChartType.NormalizedColumn], this.chartType);

    protected getDefaultOptions(): CartesianChartOptions<BarSeriesOptions> {
        const { fills, strokes } = this.chartProxyParams.getSelectedPalette();
        const chartType = this.chartType;
        const isColumnChart = this.isColumnChart();
        const isGrouped = chartType === ChartType.GroupedColumn || chartType === ChartType.GroupedBar;
        const isNormalized = chartType === ChartType.NormalizedColumn || chartType === ChartType.NormalizedBar;
        const fontOptions = this.getDefaultFontOptions();
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<BarSeriesOptions>;

        options.xAxis.label.rotation = isColumnChart ? 335 : 0;
        options.yAxis.label.rotation = isColumnChart ? 0 : 335;

        options.seriesDefaults = {
            fill: {
                colors: fills,
            },
            stroke: {
                colors: strokes,
                width: 1,
            },
            grouped: isGrouped,
            normalizedTo: isNormalized ? 100 : undefined,
            tooltip: {
                enabled: true,
            },
            label: {
                ...fontOptions,
                enabled: false,
            },
            shadow: this.getDefaultDropShadowOptions(),
        };

        return options;
    }
}
