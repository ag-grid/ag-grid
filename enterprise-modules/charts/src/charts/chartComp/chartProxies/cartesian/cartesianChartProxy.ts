import { ChartProxy, ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { _ } from "@ag-grid-community/core";
import {
    AreaSeries,
    CartesianChart,
    CategoryAxis,
    ChartAxis,
    ChartAxisPosition,
    find,
    GroupedCategoryAxis,
    GroupedCategoryChart,
    LineSeries,
    NumberAxis,
    TimeAxis
} from "ag-charts-community";
import { ChartDataModel } from "../../chartDataModel";
import { isDate } from "../../typeChecker";
import { deepMerge } from "../../object";
import { getStandaloneChartType } from "../../chartTypeMapper";

enum AXIS_TYPE {REGULAR, SPECIAL}

export abstract class CartesianChartProxy<T extends any> extends ChartProxy<CartesianChart | GroupedCategoryChart, any> {

    // these are used to preserve the axis label rotation when switching between axis types
    private prevCategory: AXIS_TYPE;
    private prevAxisLabelRotation = 0;

    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    protected getAxes(): any {
        const flipXY = this.standaloneChartType === 'bar';

        let xAxisType = (this.standaloneChartType === 'scatter' || this.standaloneChartType === 'histogram') ? 'number' : 'category';
        let yAxisType = 'number';

        if (flipXY) {
            [xAxisType, yAxisType] = [yAxisType, xAxisType];
        }

        let xAxis: any = {};
        xAxis = deepMerge(xAxis, this.chartOptions[this.standaloneChartType].axes[xAxisType]);
        xAxis = deepMerge(xAxis, this.chartOptions[this.standaloneChartType].axes[xAxisType].bottom);

        let yAxis: any = {};
        yAxis = deepMerge(yAxis, this.chartOptions[this.standaloneChartType].axes[yAxisType]);
        yAxis = deepMerge(yAxis, this.chartOptions[this.standaloneChartType].axes[yAxisType].left);

        return [xAxis, yAxis];
    }

    protected updateLabelRotation(
        categoryId: string,
        isHorizontalChart = false,
        axisType: 'time' | 'category' = 'category'
    ) {
        const axisPosition = isHorizontalChart ? ChartAxisPosition.Left : ChartAxisPosition.Bottom;
        const axis = find(this.chart.axes, currentAxis => currentAxis.position === axisPosition);

        const isSpecialCategory = categoryId === ChartDataModel.DEFAULT_CATEGORY || this.chartProxyParams.grouping;

        if (isSpecialCategory && this.prevCategory === AXIS_TYPE.REGULAR && axis) {
            this.prevAxisLabelRotation = axis.label.rotation;
        }

        let labelRotation = 0;
        if (!isSpecialCategory) {
            if (this.prevCategory === AXIS_TYPE.REGULAR) { return; }

            if (_.exists(this.prevCategory)) {
                labelRotation = this.prevAxisLabelRotation;
            } else {
                let rotationFromTheme = this.getUserThemeOverrideRotation(isHorizontalChart, axisType);
                labelRotation = rotationFromTheme !== undefined ? rotationFromTheme : 335;
            }
        }

        if (axis) {
            axis.label.rotation = labelRotation;
            _.set(this.chartOptions.xAxis, "label.rotation", labelRotation);
        }

        //FIXME:

        // const event: ChartModelUpdatedEvent = Object.freeze({type: ChartController.EVENT_CHART_UPDATED});
        // this.chartProxyParams.eventService.dispatchEvent(event);

        this.prevCategory = isSpecialCategory ? AXIS_TYPE.SPECIAL : AXIS_TYPE.REGULAR;
    }

    private getUserThemeOverrideRotation(isHorizontalChart = false, axisType: 'time' | 'category' = 'category') {
        if (!this.chartOptions || !this.chartOptions.overrides) {
            return;
        }

        const chartType = getStandaloneChartType(this.chartType);
        const overrides = this.chartOptions.overrides;
        const axisPosition = isHorizontalChart ? ChartAxisPosition.Left : ChartAxisPosition.Bottom;

        const chartTypePositionRotation = _.get(overrides, `${chartType}.axes.${axisType}.${axisPosition}.label.rotation`, undefined);
        if (typeof chartTypePositionRotation === 'number' && isFinite(chartTypePositionRotation)) {
            return chartTypePositionRotation;
        }

        const chartTypeRotation = _.get(overrides, `${chartType}.axes.${axisType}.label.rotation`, undefined);
        if (typeof chartTypeRotation === 'number' && isFinite(chartTypeRotation)) {
            return chartTypeRotation;
        }

        const cartesianPositionRotation = _.get(overrides, `cartesian.axes.${axisType}.${axisPosition}.label.rotation`, undefined);
        if (typeof cartesianPositionRotation === 'number' && isFinite(cartesianPositionRotation)) {
            return cartesianPositionRotation;
        }

        const cartesianRotation = _.get(overrides, `cartesian.axes.${axisType}.label.rotation`, undefined);
        if (typeof cartesianRotation === 'number' && isFinite(cartesianRotation)) {
            return cartesianRotation;
        }
    }

    protected axisTypeToClassMap: { [key in string]: any } = {
        number: NumberAxis,
        category: CategoryAxis,
        groupedCategory: GroupedCategoryAxis,
        time: TimeAxis
    };

    protected updateAxes(baseAxisType: any = 'category', isHorizontalChart = false): void {
        const baseAxis = isHorizontalChart ? this.getYAxis() : this.getXAxis();

        if (!baseAxis) { return; }

        // when grouping we only recreate the chart if the axis is not a 'groupedCategory' axis, otherwise return
        if (this.chartProxyParams.grouping) {
            if (!(baseAxis instanceof GroupedCategoryAxis)) {
                this.recreateChart();
            }
            return;
        }

        // only update the axis type when the axis has changed and recreate the chart (e.g. when switching from a
        // 'category' axis to a 'time' axis)
        const axisTypeChanged = !(baseAxis instanceof this.axisTypeToClassMap[baseAxisType]);
        if (axisTypeChanged) {
            (isHorizontalChart ? this.chartOptions.yAxis : this.chartOptions.xAxis).type = baseAxisType;
            this.recreateChart();
        }
    }

    protected isTimeAxis(params: UpdateChartParams): boolean {
        if (params.category && params.category.chartDataType) {
            return params.category.chartDataType === 'time';
        }

        const testDatum = params.data[0];
        const testValue = testDatum && testDatum[params.category.id];
        return isDate(testValue);
    }

    protected getXAxisDefaults(xAxisType: any, options: any) {
        if (xAxisType === 'time') {
            let xAxisTheme: any = {};
            xAxisTheme = deepMerge(xAxisTheme, this.chartOptions[this.standaloneChartType].axes.time);
            xAxisTheme = deepMerge(xAxisTheme, this.chartOptions[this.standaloneChartType].axes.bottom);
            return xAxisTheme;
        }
        // TODO: verify
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