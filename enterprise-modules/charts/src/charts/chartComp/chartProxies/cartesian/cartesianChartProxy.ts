import { ChartProxy, ChartProxyParams, UpdateChartParams } from "../chartProxy";
import {
    AgCartesianAxisType,
    AgCartesianChartOptions,
    AgChart,
    AreaSeries,
    CartesianChart,
    CategoryAxis,
    GroupedCategoryAxis,
    LineSeries,
    NumberAxis,
    TimeAxis
} from "ag-charts-community";
import { ChartSeriesType } from "../../utils/seriesTypeMapper";

export abstract class CartesianChartProxy extends ChartProxy {
    protected xAxisType: AgCartesianAxisType;
    protected yAxisType: AgCartesianAxisType;

    protected axisTypeToClassMap: { [key in string]: any } = {
        number: NumberAxis,
        category: CategoryAxis,
        groupedCategory: GroupedCategoryAxis,
        time: TimeAxis
    };

    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    protected createChart(): CartesianChart {
        return AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    }

    protected updateChart(options: AgCartesianChartOptions): void {
        if (this.crossFiltering) {
            options.tooltip = { delay: 500 };
        }
        AgChart.update(this.chart as CartesianChart, options);
    }

    protected extractSeriesOverrides(chartSeriesType?: ChartSeriesType) {
        const seriesOverrides = this.chartOptions[chartSeriesType ? chartSeriesType : this.standaloneChartType].series;

        // TODO: remove once `yKeys` and `yNames` have been removed from the options
        delete seriesOverrides.yKeys;
        delete seriesOverrides.yNames;

        return seriesOverrides;
    }

    // protected updateAxes(params: UpdateChartParams): void {
    //     // when grouping recreate chart if the axis is not a 'groupedCategory', otherwise return
    //     if (params.grouping) {
    //         if (!(this.axisTypeToClassMap[this.xAxisType] === GroupedCategoryAxis)) {
    //             this.xAxisType = 'groupedCategory';
    //             this.recreateChart();
    //         }
    //         return;
    //     }
    //
    //     // only update axis has changed and recreate the chart, i.e. switching from 'category' to 'time' axis
    //     const newXAxisType = CartesianChartProxy.isTimeAxis(params) ? 'time' : 'category';
    //     if (newXAxisType !== this.xAxisType) {
    //         this.xAxisType = newXAxisType;
    //         this.recreateChart();
    //     }
    // }

    protected getAxesOptions(chartSeriesType: ChartSeriesType = this.standaloneChartType) {
        return this.chartOptions[chartSeriesType].axes;
    }

    // protected processDataForCrossFiltering(data: any[], colId: string, params: UpdateChartParams) {
    //     let yKey = colId;
    //     let atLeastOneSelectedPoint = false;
    //     if (this.crossFiltering) {
    //         data.forEach(d => {
    //             d[colId + '-total'] = d[colId] + d[colId + '-filtered-out'];
    //             if (d[colId + '-filtered-out'] > 0) {
    //                 atLeastOneSelectedPoint = true;
    //             }
    //         });
    //
    //         const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
    //         if (lastSelectedChartId === params.chartId) {
    //             yKey = colId + '-total';
    //         }
    //     }
    //     return {yKey, atLeastOneSelectedPoint};
    // }

    protected updateSeriesForCrossFiltering(
        series: AreaSeries | LineSeries,
        colId: string,
        chart: CartesianChart,
        params: UpdateChartParams,
        atLeastOneSelectedPoint: boolean) {

        if (this.crossFiltering) {
            // special custom marker handling to show and hide points
            series!.marker.enabled = true;
            series!.marker.formatter = (p: any) => {
                return {
                    fill: p.highlighted ? 'yellow' : p.fill,
                    size: p.highlighted ? 12 : p.datum[colId] > 0 ? 8 : 0,
                };
            }

            chart.tooltip.delay = 500;

            // make line opaque when some points are deselected
            const ctx = params.getCrossFilteringContext();
            const lastSelectionOnThisChart = ctx.lastSelectedChartId === params.chartId;
            const deselectedPoints = lastSelectionOnThisChart && atLeastOneSelectedPoint;

            if (series instanceof AreaSeries) {
                series!.fillOpacity = deselectedPoints ? 0.3 : 1;
            }

            if (series instanceof LineSeries) {
                series!.strokeOpacity = deselectedPoints ? 0.3 : 1;
            }

            // add node click cross filtering callback to series
            series!.addEventListener('nodeClick', this.crossFilterCallback);
        }
    }

    // private static isTimeAxis(params: UpdateChartParams): boolean {
    //     if (params.category && params.category.chartDataType) {
    //         return params.category.chartDataType === 'time';
    //     }
    //     const testDatum = params.data[0];
    //     return (testDatum && testDatum[params.category.id]) instanceof Date;
    // }
}