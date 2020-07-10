import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { _, AxisOptions, AxisType, CartesianChartOptions, SeriesOptions } from "@ag-grid-community/core";
import {
    AgCartesianAxisOptions,
    AgCartesianChartOptions,
    CartesianChart, CategoryAxis,
    ChartAxis,
    ChartAxisPosition,
    find,
    GroupedCategoryAxis,
    GroupedCategoryChart, NumberAxis, TimeAxis
} from "ag-charts-community";
import { ChartDataModel } from "../../chartDataModel";

export abstract class CartesianChartProxy extends ChartProxy {

    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxisProperty<T = string>(expression: string): T {
        // return _.get(this.chartOptions.xAxis, expression, undefined) as T;
        return _.get(this.getXAxisOptions(), expression, undefined) as T;
    }

    public setAxisProperty(expression: string, value: any) {
        // _.set(this.chartOptions.xAxis, expression, value);
        _.set(this.getXAxisOptions(), expression, value);
        // _.set(this.chartOptions.yAxis, expression, value);
        _.set(this.getYAxisOptions(), expression, value);

        const chart = this.chart;

        this.chart.axes.forEach((axis: any) => _.set(axis, expression, value));

        chart.performLayout();

        this.raiseChartOptionsChangedEvent();
    }

    protected updateLabelRotation(categoryId: string, isHorizontalChart = false) {
        let labelRotation = 0;

        if (categoryId !== ChartDataModel.DEFAULT_CATEGORY && !this.chartProxyParams.grouping) {
            const axisOptions = isHorizontalChart ? this.getYAxisOptions() : this.getXAxisOptions();
            const { label } = axisOptions;

            if (label && label.rotation) {
                labelRotation = label.rotation;
            }
        }

        const axisPosition = isHorizontalChart ? ChartAxisPosition.Left : ChartAxisPosition.Bottom;
        const axis = find(this.chart.axes, (axis: any) => axis.position === axisPosition);

        if (axis) {
            axis.label.rotation = labelRotation;
        }
    }

    // protected getDefaultAxisOptions(): AxisOptions {
    //     const fontOptions = this.getDefaultFontOptions();
    //     const stroke = this.getAxisGridColor();
    //     const axisColor = "rgba(195, 195, 195, 1)";
    //
    //     return {
    //         title: {
    //             ...fontOptions,
    //             enabled: false,
    //             fontSize: 14,
    //         },
    //         line: {
    //             color: axisColor,
    //             width: 1,
    //         },
    //         tick: {
    //             color: axisColor,
    //             size: 6,
    //             width: 1,
    //         },
    //         label: {
    //             ...fontOptions,
    //             padding: 5,
    //             rotation: 0,
    //         },
    //         gridStyle: [{
    //             stroke,
    //             lineDash: [4, 2]
    //         }]
    //     };
    // }

    protected getDefaultCartesianChartOptions(): AgCartesianChartOptions {
        return {
            legend: {
                item: {
                    marker: {
                        shape: 'square'
                    }
                }
            }
        };
    }

    protected axisTypeToClassMap: any = {
        number: NumberAxis,
        category: CategoryAxis,
        groupedCategory: GroupedCategoryAxis,
        time: TimeAxis
    };

    protected getAxisClass(axisType: string) {
        return this.axisTypeToClassMap[axisType];
    }

    protected updateAxes(baseAxisType: AxisType = 'category', isHorizontalChart = false): void {
        const baseAxis = isHorizontalChart ? this.getYAxis() : this.getXAxis();

        if (!baseAxis) { return; }

        if (this.chartProxyParams.grouping) {
            if (!(baseAxis instanceof GroupedCategoryAxis)) {
                this.recreateChart();
            }

            return;
        }

        // const axisClass = ChartBuilder.toAxisClass(baseAxisType);
        const axisClass = this.getAxisClass(baseAxisType);

        if (baseAxis instanceof axisClass) { return; }

        // let options = this.chartOptions;

        const xAxisOptions = this.getXAxisOptions();
        const yAxisOptions = this.getYAxisOptions();
        if (isHorizontalChart && !yAxisOptions.type) {
            // options = {
            //     ...options,
            //     yAxis: {
            //         ...options.yAxis,
            //         type: baseAxisType,
            //     }
            // };
            this.getYAxisOptions().type = baseAxisType;
        } else if (!isHorizontalChart && !xAxisOptions.type) {
            // options = {
            //     ...options,
            //     xAxis: {
            //         ...options.xAxis,
            //         type: baseAxisType,
            //     }
            // };
            this.getXAxisOptions().type = baseAxisType;
        }

        this.recreateChart(this.chartOptions);
    }

    protected getXAxisOptions(): AgCartesianAxisOptions {
        return find(this.chartOptions.axes, a => a.position === 'bottom');
    }

    protected getYAxisOptions(): AgCartesianAxisOptions {
        return find(this.chartOptions.axes, a => a.position === 'left');
    }

    protected getXAxis(): ChartAxis {
        return find(this.chart.axes, a => a.position === ChartAxisPosition.Bottom);
    }

    protected getYAxis(): ChartAxis {
        return find(this.chart.axes, a => a.position === ChartAxisPosition.Left);
    }
}
