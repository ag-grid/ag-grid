import { _, BeanStub, ChartOptionsChanged, ChartType, Events, WithoutGridCommon } from "@ag-grid-community/core";
import { AgCartesianAxisType, AgCharts, AgChartOptions, AgPolarAxisType } from "ag-charts-community";

import { ChartController } from "../chartController";
import { AgChartActual, AgChartAxis, AgChartAxisType } from "../utils/integration";
import { deepMerge } from "../utils/object";
import { ChartSeriesType, VALID_SERIES_TYPES } from "../utils/seriesTypeMapper";

type SupportedSeries = AgChartActual['series'][number];

type AxisSelector =
    | number
    | 'xAxis'
    | 'yAxis'
    | AgChartAxisType
    | Array<AgChartAxisType>
    | ((axis: AgChartAxis) => boolean);

export class ChartOptionsService extends BeanStub {
    static CATEGORY_AXIS_TYPES: Array<AgChartAxisType> = [
        'category',
        'grouped-category',
        'radius-category',
        'angle-category',
    ];
    static ANGLE_AXIS_TYPES: Array<AgChartAxisType> = ['angle-category', 'angle-number'];
    static RADIUS_AXIS_TYPES: Array<AgChartAxisType> = ['radius-category', 'radius-number'];

    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    public getChartOption<T = string>(expression: string): T {
        return _.get(this.getChart(), expression, undefined) as T;
    }

    public setChartOption<T = string>(expression: string, value: T, isSilent?: boolean): void {
        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }

        let chartOptions = {};
        // we need to update chart options on each series type for combo charts
        chartSeriesTypes.forEach(seriesType => {
            chartOptions = deepMerge(chartOptions, this.createChartOptions<T>({
                seriesType,
                expression,
                value
            }));
        });

        if (!isSilent) {
            this.updateChart(chartOptions);
            this.raiseChartOptionsChangedEvent();
        }
    }

    public awaitChartOptionUpdate(func: () => void) {
        const chart = this.chartController.getChartProxy().getChart();
        chart.waitForUpdate().then(() => func())
            .catch((e) => console.error(`AG Grid - chart update failed`, e));
    }

    public getAxisProperty<T = string>(expression: string): T {
        // this assumes the property is present on the first axis
        return this.getMatchedAxisProperty(0, expression)!;
    }

    public setAxisProperty<T = string>(expression: string, value: T) {
        // update axis options for all axes simultaneously
        this.setMatchedAxisProperty(null, expression, value);
    }

    public getCategoryAxisProperty<T = string>(expression: string): T | undefined {
        return this.getMatchedAxisProperty(ChartOptionsService.CATEGORY_AXIS_TYPES, expression);
    }

    public setCategoryAxisProperty<T = string>(expression: string, value: T) {
        return this.setMatchedAxisProperty(ChartOptionsService.CATEGORY_AXIS_TYPES, expression, value);
    }

    public getRadiusAxisProperty<T = string>(expression: string): T | undefined {
        return this.getMatchedAxisProperty(ChartOptionsService.RADIUS_AXIS_TYPES, expression);
    }

    public setRadiusAxisProperty<T = string>(expression: string, value: T) {
        this.setMatchedAxisProperty(ChartOptionsService.RADIUS_AXIS_TYPES, expression, value);
    }

    public getAngleAxisProperty<T = string>(expression: string): T | undefined {
        return this.getMatchedAxisProperty(ChartOptionsService.ANGLE_AXIS_TYPES, expression);
    }

    public setAngleAxisProperty<T = string>(expression: string, value: T) {
        this.setMatchedAxisProperty(ChartOptionsService.ANGLE_AXIS_TYPES, expression, value);
    }

    public getLabelRotation(axisType: 'xAxis' | 'yAxis'): number {
        return this.getMatchedAxisProperty(axisType, 'label.rotation') ?? 0;
    }

    public setLabelRotation(axisType: 'xAxis' | 'yAxis', value: number | undefined) {
        this.setMatchedAxisProperty(axisType, 'label.rotation', value);
    }

    private getMatchedAxisProperty<T>(axisSelector: AxisSelector, expression: string): T | undefined {
        // retrieve the option from the first axis that matches the selector
        const axis = this.findAxis(axisSelector);
        if (!axis) return undefined;
        return _.get(axis, expression, undefined) as T;
    }

    private setMatchedAxisProperty<T>(axisSelector: AxisSelector | null, expression: string, value: T): void {
        // locate the first axis that matches the selector, or all axes if the selector is null 
        const matchedAxis = axisSelector === null ? undefined : this.findAxis(axisSelector);
        const updatedAxes = matchedAxis
            ? [matchedAxis]
            : (axisSelector === null ? this.getChart().axes : undefined);
        if (!updatedAxes) return undefined;

        // combine the axis options for each matched axis
        const chartOptions = updatedAxes.reduce(
            (chartOptions, axis) => deepMerge(chartOptions, this.getUpdateAxisOptions<T>(axis, expression, value)),
            {} as AgChartOptions,
        );

        // update the chart with the combined axis options
        this.updateChart(chartOptions);
        this.raiseChartOptionsChangedEvent();
    }

    private findAxis(selector: AxisSelector): AgChartAxis | undefined {
        const axes = this.getChart().axes;
        if (!axes) return undefined;
        if (Array.isArray(selector)) {
            return axes.find((axis) => selector.includes(axis.type));
        }
        switch (typeof selector) {
            case 'number':
                return selector > axes.length ? undefined : axes[selector];
            case 'function':
                return axes.find(selector);
            case 'string':
                if (selector === 'xAxis') {
                    return axes[0].direction === 'x' ? axes[0] : axes[1];
                } else if (selector === 'yAxis') {
                    return axes[1].direction === 'y' ? axes[1] : axes[0];
                } else {
                    return axes.find((axis) => axis.type === selector);
                }
            default:
                return undefined;
        }
    }

    public getSeriesOption<T = string>(expression: string, seriesType: ChartSeriesType, calculated?: boolean): T {
        // N.B. 'calculated' here refers to the fact that the property exists on the internal series object itself,
        // rather than the properties object. This is due to us needing to reach inside the chart itself to retrieve
        // the value, and will likely be cleaned up in a future release
        const series = this.getChart().series.find((s: any) => ChartOptionsService.isMatchingSeries(seriesType, s));
        return _.get(calculated ? series : series?.properties.toJson(), expression, undefined) as T;
    }

    public setSeriesOption<T = string>(expression: string, value: T, seriesType: ChartSeriesType): void {
        const chartOptions = this.createChartOptions<T>({
            seriesType,
            expression: `series.${expression}`,
            value
        });
        this.updateChart(chartOptions);

        this.raiseChartOptionsChangedEvent();
    }

    public getPairedMode(): boolean {
        return this.chartController.getChartProxy().isPaired();
    }

    public setPairedMode(paired: boolean): void {
        this.chartController.getChartProxy().setPaired(paired);
    }

    private getUpdateAxisOptions<T = string>(chartAxis: AgChartAxis, expression: string, value: T): AgChartOptions {
        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }

        const validAxisTypes: (AgCartesianAxisType | AgPolarAxisType)[] = ['number', 'category', 'time', 'grouped-category', 'angle-category', 'angle-number', 'radius-category', 'radius-number'];

        if (!validAxisTypes.includes(chartAxis.type)) {
            return {};
        }

        return chartSeriesTypes
            .map((seriesType) => this.createChartOptions<T>({
                seriesType,
                expression: `axes.${chartAxis.type}.${expression}`,
                value,
            }))
            .reduce((combinedOptions, options) => deepMerge(combinedOptions, options));
    }

    public getChartType(): ChartType {
        return this.chartController.getChartType();
    }

    private getChart() {
        return this.chartController.getChartProxy().getChart();
    }

    private updateChart(chartOptions: AgChartOptions) {
        const chartRef = this.chartController.getChartProxy().getChartRef();
        AgCharts.updateDelta(chartRef, chartOptions);
    }

    private createChartOptions<T>({ seriesType, expression, value }: {
        seriesType: ChartSeriesType,
        expression: string,
        value: T
    }): AgChartOptions {
        const overrides = {};
        const chartOptions = {
            theme: {
                overrides
            }
        };
        _.set(overrides, `${seriesType}.${expression}`, value);

        return chartOptions;
    }

    private raiseChartOptionsChangedEvent(): void {
        const chartModel = this.chartController.getChartModel();

        const event: WithoutGridCommon<ChartOptionsChanged> = {
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartModel.chartId,
            chartType: chartModel.chartType,
            chartThemeName: this.chartController.getChartThemeName(),
            chartOptions: chartModel.chartOptions
        };

        this.eventService.dispatchEvent(event);
    }

    private static isMatchingSeries(seriesType: ChartSeriesType, series: SupportedSeries): boolean {
        return VALID_SERIES_TYPES.includes(seriesType) && series.type === seriesType;
    }

    protected destroy(): void {
        super.destroy();
    }
}
