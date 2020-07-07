import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { _, AxisOptions, AxisType, CartesianChartOptions, SeriesOptions } from "@ag-grid-community/core";
import {
    CartesianChart, CategoryAxis,
    ChartAxis,
    ChartAxisPosition,
    find,
    GroupedCategoryAxis,
    GroupedCategoryChart, NumberAxis, TimeAxis
} from "ag-charts-community";
import { ChartDataModel } from "../../chartDataModel";

export abstract class CartesianChartProxy<T extends SeriesOptions> extends ChartProxy<CartesianChart | GroupedCategoryChart, CartesianChartOptions<T>> {

    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxisProperty<T = string>(expression: string): T {
        return _.get(this.chartOptions.xAxis, expression, undefined) as T;
    }

    public setAxisProperty(expression: string, value: any) {
        _.set(this.chartOptions.xAxis, expression, value);
        _.set(this.chartOptions.yAxis, expression, value);

        const chart = this.chart;

        this.chart.axes.forEach(axis => _.set(axis, expression, value));

        chart.performLayout();

        this.raiseChartOptionsChangedEvent();
    }

    protected updateLabelRotation(categoryId: string, isHorizontalChart = false) {
        let labelRotation = 0;
        const axisKey = isHorizontalChart ? 'yAxis' : 'xAxis';

        if (categoryId !== ChartDataModel.DEFAULT_CATEGORY && !this.chartProxyParams.grouping) {
            const { label } = this.chartOptions[axisKey];

            if (label && label.rotation) {
                labelRotation = label.rotation;
            }
        }

        const axisPosition = isHorizontalChart ? ChartAxisPosition.Left : ChartAxisPosition.Bottom;
        const axis = find(this.chart.axes, axis => axis.position === axisPosition);

        if (axis) {
            axis.label.rotation = labelRotation;
        }
    }

    protected getDefaultAxisOptions(): AxisOptions {
        const fontOptions = this.getDefaultFontOptions();
        const stroke = this.getAxisGridColor();
        const axisColor = "rgba(195, 195, 195, 1)";

        return {
            title: {
                ...fontOptions,
                enabled: false,
                fontSize: 14,
            },
            line: {
                color: axisColor,
                width: 1,
            },
            tick: {
                color: axisColor,
                size: 6,
                width: 1,
            },
            label: {
                ...fontOptions,
                padding: 5,
                rotation: 0,
            },
            gridStyle: [{
                stroke,
                lineDash: [4, 2]
            }]
        };
    }

    protected getDefaultCartesianChartOptions(): CartesianChartOptions<SeriesOptions> {
        const options = this.getDefaultChartOptions() as CartesianChartOptions<SeriesOptions>;

        options.xAxis = this.getDefaultAxisOptions();
        options.yAxis = this.getDefaultAxisOptions();

        return options;
    }

    protected axisTypeToClassMap: { [key in string]: ChartAxis } = {
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

        const axisClass = ChartBuilder.toAxisClass(baseAxisType);

        if (baseAxis instanceof axisClass) { return; }

        let options = this.chartOptions;

        if (isHorizontalChart && !options.yAxis.type) {
            options = {
                ...options,
                yAxis: {
                    ...options.yAxis,
                    type: baseAxisType,
                }
            };
        } else if (!isHorizontalChart && !options.xAxis.type) {
            options = {
                ...options,
                xAxis: {
                    ...options.xAxis,
                    type: baseAxisType,
                }
            };
        }

        this.recreateChart(options);
    }

    protected getXAxis(): ChartAxis {
        return find(this.chart.axes, a => a.position === ChartAxisPosition.Bottom);
    }

    protected getYAxis(): ChartAxis {
        return find(this.chart.axes, a => a.position === ChartAxisPosition.Left);
    }
}
