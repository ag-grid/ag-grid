import { ChartProxy, ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { _, AxisOptions, AxisType, CartesianChartOptions, SeriesOptions } from "@ag-grid-community/core";
import {
    AreaSeries,
    LineSeries,
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
import { deepMerge } from "../../object";

export abstract class CartesianChartProxy<T extends SeriesOptions> extends ChartProxy<CartesianChart | GroupedCategoryChart, CartesianChartOptions<T>> {

    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    protected getDefaultOptionsFromTheme(theme: ChartTheme): CartesianChartOptions<T> {
        const options = super.getDefaultOptionsFromTheme(theme);
        const standaloneChartType = this.getStandaloneChartType();
        const flipXY = standaloneChartType === 'bar';

        let xAxisType = (standaloneChartType === 'scatter' || standaloneChartType === 'histogram') ? 'number' : 'category';
        let yAxisType = 'number';

        if (flipXY) {
            [xAxisType, yAxisType] = [yAxisType, xAxisType];
        }

        let xAxisTheme: any = {};
        let yAxisTheme: any = {};

        xAxisTheme = deepMerge(xAxisTheme, theme.getConfig(standaloneChartType + '.axes.' + xAxisType));
        xAxisTheme = deepMerge(xAxisTheme, theme.getConfig(standaloneChartType + '.axes.' + xAxisType + '.bottom'));

        yAxisTheme = deepMerge(yAxisTheme, theme.getConfig(standaloneChartType + '.axes.' + yAxisType));
        yAxisTheme = deepMerge(yAxisTheme, theme.getConfig(standaloneChartType + '.axes.' + yAxisType + '.left'));

        options.xAxis = xAxisTheme;
        options.yAxis = yAxisTheme;

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
        const axisPosition = isHorizontalChart ? ChartAxisPosition.Left : ChartAxisPosition.Bottom;

        const chartType = this.getStandaloneChartType();
        let userThemeOverrideRotation;

        const commonRotation = _.get(themeOverrides, `common.axes.${axisType}.label.rotation`, undefined);
        const cartesianRotation = _.get(themeOverrides, `cartesian.axes.${axisType}.label.rotation`, undefined);
        const cartesianPositionRotation = _.get(themeOverrides, `cartesian.axes.${axisType}.${axisPosition}.label.rotation`, undefined);
        const chartTypeRotation = _.get(themeOverrides, `${chartType}.axes.${axisType}.label.rotation`, undefined);
        const chartTypePositionRotation = _.get(themeOverrides, `${chartType}.axes.${axisType}.${axisPosition}.label.rotation`, undefined);

        if (typeof chartTypePositionRotation === 'number' && isFinite(chartTypePositionRotation)) {
            userThemeOverrideRotation = chartTypePositionRotation;
        } else if (typeof chartTypeRotation === 'number' && isFinite(chartTypeRotation)) {
            userThemeOverrideRotation = chartTypeRotation;
        } else if (typeof cartesianPositionRotation === 'number' && isFinite(cartesianPositionRotation)) {
            userThemeOverrideRotation = cartesianPositionRotation;
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
            let xAxisTheme: any = {};
            const standaloneChartType = this.getStandaloneChartType();
            xAxisTheme = deepMerge(xAxisTheme, this.chartTheme.getConfig(standaloneChartType + '.axes.time'));
            xAxisTheme = deepMerge(xAxisTheme, this.chartTheme.getConfig(standaloneChartType + '.axes.time.bottom'));
            return xAxisTheme;
        }
        return options.xAxis;
    }

    protected getXAxis(): ChartAxis | undefined {
        return find(this.chart.axes, a => a.position === ChartAxisPosition.Bottom);
    }

    protected getYAxis(): ChartAxis | undefined {
        return find(this.chart.axes, a => a.position === ChartAxisPosition.Left);
    }

    protected processDataForCrossFiltering(data: any[], colId: string, params: UpdateChartParams) {
        let yKey = colId;
        let atLeastOneSelectedPoint = false;
        if (this.crossFiltering) {
            data.forEach(d => {
                d[colId + '-total'] = d[colId] + d[colId + '-filtered-out'];
                if (d[colId + '-filtered-out'] > 0) {
                    atLeastOneSelectedPoint = true;
                }
            });

            const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
            if (lastSelectedChartId === params.chartId) {
                yKey = colId + '-total';
            }
        }
        return {yKey, atLeastOneSelectedPoint};
    }

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
}