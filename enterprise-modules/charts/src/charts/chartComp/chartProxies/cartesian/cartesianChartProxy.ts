import { ChartProxy, ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { _, AxisOptions, AxisType, CartesianChartOptions, SeriesOptions } from "@ag-grid-community/core";
import {
    CartesianChart,
    CategoryAxis,
    ChartAxis,
    ChartAxisPosition,
    ChartTheme,
    find,
    GroupedCategoryAxis,
    GroupedCategoryChart,
    NumberAxis,
    TimeAxis
} from "ag-charts-community";
import { ChartDataModel } from "../../chartDataModel";
import { isDate } from "../../typeChecker";

export abstract class CartesianChartProxy<T extends SeriesOptions> extends ChartProxy<CartesianChart | GroupedCategoryChart, CartesianChartOptions<T>> {

    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    protected getDefaultOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<T> {
        const options = super.getDefaultOptionsFromTheme(theme);
        const standaloneChartType = this.getStandaloneChartType();
        const flipXY = standaloneChartType === 'bar';

        let xAxisType = 'category';
        let yAxisType = 'number';

        if (flipXY) {
            [xAxisType, yAxisType] = [yAxisType, xAxisType];
        }

        options.xAxis = theme.getConfig(standaloneChartType + '.axes.' + xAxisType);
        options.yAxis = theme.getConfig(standaloneChartType + '.axes.' + yAxisType);

        return options;
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

    protected updateLabelRotation(
        categoryId: string,
        isHorizontalChart = false,
        axisType: 'time' | 'category' = 'category'
    ) {
        let labelRotation = 0;
        const axisKey = isHorizontalChart ? 'yAxis' : 'xAxis';
        const themeOverrides = this.chartProxyParams.getGridOptionsChartThemeOverrides();

        const chartType = this.getStandaloneChartType();
        let userThemeOverrideRotation;

        const commonRotation = _.get(themeOverrides, `common.axes.${axisType}.label.rotation`, undefined);
        const cartesianRotation = _.get(themeOverrides, `cartesian.axes.${axisType}.label.rotation`, undefined);
        const chartTypeRotation = _.get(themeOverrides, `${chartType}.axes.${axisType}.label.rotation`, undefined);

        if (typeof chartTypeRotation === 'number' && isFinite(chartTypeRotation)) {
            userThemeOverrideRotation = chartTypeRotation;
        } else if (typeof cartesianRotation === 'number' && isFinite(cartesianRotation)) {
            userThemeOverrideRotation = cartesianRotation;
        } else if (typeof commonRotation === 'number' && isFinite(commonRotation)) {
            userThemeOverrideRotation = commonRotation;
        }

        if (categoryId !== ChartDataModel.DEFAULT_CATEGORY && !this.chartProxyParams.grouping) {
            const { label } = this.chartOptions[axisKey];

            if (label) {
                if (userThemeOverrideRotation !== undefined) {
                    labelRotation = userThemeOverrideRotation;
                } else {
                    labelRotation = label.rotation || 335;
                }
            }
        }

        const axisPosition = isHorizontalChart ? ChartAxisPosition.Left : ChartAxisPosition.Bottom;
        const axis = find(this.chart.axes, currentAxis => currentAxis.position === axisPosition);

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

    protected axisTypeToClassMap: { [key in string]: typeof ChartAxis } = {
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

        const axisClass = this.axisTypeToClassMap[baseAxisType];

        if (baseAxis instanceof axisClass) { return; }

        let options = this.chartOptions;

        if (isHorizontalChart && !options.yAxis.type) {
            options = {
                ...options,
                yAxis: {
                    type: baseAxisType,
                    ...options.yAxis
                }
            };
        } else if (!isHorizontalChart && !options.xAxis.type) {
            options = {
                ...options,
                xAxis: {
                    type: baseAxisType,
                    ...options.xAxis
                }
            };
        }

        this.recreateChart(options);
    }

    protected isTimeAxis(params: UpdateChartParams): boolean {
        if (params.category && params.category.chartDataType) {
            return params.category.chartDataType === 'time';
        }

        const testDatum = params.data[0];
        const testValue = testDatum && testDatum[params.category.id];
        return isDate(testValue);
    }

    protected getXAxisDefaults(xAxisType: AxisType, options: CartesianChartOptions<T>) {
        if (xAxisType === 'time') {
            return this.chartTheme.getConfig(this.getStandaloneChartType() + '.axes.' + 'time');
        }
        return options.xAxis;
    }

    protected getXAxis(): ChartAxis | undefined {
        return find(this.chart.axes, a => a.position === ChartAxisPosition.Bottom);
    }

    protected getYAxis(): ChartAxis | undefined {
        return find(this.chart.axes, a => a.position === ChartAxisPosition.Left);
    }
}