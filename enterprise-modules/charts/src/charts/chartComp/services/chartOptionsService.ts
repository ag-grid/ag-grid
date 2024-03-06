import { _, BeanStub, ChartOptionsChanged, ChartType, Events, WithoutGridCommon, PostConstruct } from "@ag-grid-community/core";
import { AgCartesianAxisType, AgCharts, AgChartOptions, AgPolarAxisType, AgCartesianChartOptions, AgPolarChartOptions } from "ag-charts-community";

import { ChartController } from "../chartController";
import { ChartMenuUtils } from "../menu/chartMenuUtils";
import { AgChartActual } from "../utils/integration";
import { get, set } from "../utils/object";
import { ChartSeriesType, VALID_SERIES_TYPES } from "../utils/seriesTypeMapper";

type ChartAxis = NonNullable<AgChartActual['axes']>[number];
type SupportedSeries = AgChartActual['series'][number];
type AgChartAxisOptions<T extends AgChartOptions = AgChartOptions> =
    T extends { axes?: infer V }
    ? V | undefined
    : undefined;
export class ChartOptionsService extends BeanStub {
    private readonly chartController: ChartController;

    private chartThemeOverridesMenuUtil: ChartMenuUtils;
    private axisThemeOverridesMenuUtil: ChartMenuUtils;
    private xAxisOptionsMenuUtil: ChartMenuUtils;
    private xAxisThemeOverridesMenuUtil: ChartMenuUtils;
    private yAxisOptionsMenuUtil: ChartMenuUtils;
    private yAxisThemeOverridesMenuUtil: ChartMenuUtils;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private postConstruct(): void {
        this.chartThemeOverridesMenuUtil = this.createManagedBean(new ChartMenuUtils({
            getValue: (expression) => this.getChartOption(expression),
            setValue: (expression, value) => this.setChartThemeOverrides([{ expression, value }]),
            setValues: (properties) => this.setChartThemeOverrides(properties),
        }, this));
        this.axisThemeOverridesMenuUtil = this.createManagedBean(new ChartMenuUtils({
            getValue: (expression) => this.getAxisProperty(expression),
            setValue: (expression, value) => this.setAxisThemeOverrides([{ expression, value }]),
            setValues: (properties) => this.setAxisThemeOverrides(properties),
        }, this));
        this.xAxisOptionsMenuUtil = this.createManagedBean(new ChartMenuUtils({
            getValue: (expression) => this.getCartesianAxisProperty('xAxis', expression),
            setValue: (expression, value) => this.setCartesianAxisOptions('xAxis', [{ expression, value }]),
            setValues: (properties) => this.setCartesianAxisOptions('xAxis', properties),
        }, this));
        this.xAxisThemeOverridesMenuUtil = this.createManagedBean(new ChartMenuUtils({
            getValue: (expression) => this.getCartesianAxisProperty('xAxis', expression),
            setValue: (expression, value) => this.setCartesianAxisThemeOverrides('xAxis', [{ expression, value }]),
            setValues: (properties) => this.setCartesianAxisThemeOverrides('xAxis', properties),
        }, this));
        this.yAxisOptionsMenuUtil = this.createManagedBean(new ChartMenuUtils({
            getValue: e => this.getCartesianAxisProperty('yAxis', e),
            setValue: (expression, value) => this.setCartesianAxisOptions('yAxis', [{ expression, value }]),
            setValues: (properties) => this.setCartesianAxisOptions('yAxis', properties),
        }, this));
        this.yAxisThemeOverridesMenuUtil = this.createManagedBean(new ChartMenuUtils({
            getValue: e => this.getCartesianAxisProperty('yAxis', e),
            setValue: (expression, value) => this.setCartesianAxisThemeOverrides('yAxis', [{ expression, value }]),
            setValues: (properties) => this.setCartesianAxisThemeOverrides('yAxis', properties),
        }, this));
    }

    private getChartOption<T = string>(expression: string): T {
        return get(this.getChart(), expression, undefined) as T;
    }

    private setChartThemeOverrides<T = string>(properties: {expression: string, value: T}[]): void {
        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }

        // combine the options into a single merged object
        const chartOptions: AgChartOptions = this.createChartOptions();
        for (const { expression, value } of properties) {
            // we need to update chart options on each series type for combo charts
            for (const seriesType of chartSeriesTypes) {
                this.updateChartOptionsThemeOverrides(chartOptions, seriesType, expression, value);
            }
        }

        this.applyChartOptions(chartOptions);
    }

    private applyChartOptions(chartOptions: AgChartOptions, options?: { silent?: boolean }): void {
        if (Object.keys(chartOptions).length === 0) return;
        this.updateChart(chartOptions);
        const shouldRaiseEvent = !options?.silent;
        if (shouldRaiseEvent) this.raiseChartOptionsChangedEvent();
    }

    private getChartAxisOptions(): AgChartAxisOptions | undefined {
        const chart = this.getChart();
        const options = chart.getOptions();
        if ('axes' in options) return options.axes;
        return undefined;
    }

    public awaitChartOptionUpdate(func: () => void) {
        const chart = this.chartController.getChartProxy().getChart();
        chart.waitForUpdate().then(() => func())
            .catch((e) => console.error(`AG Grid - chart update failed`, e));
    }

    private getAxisProperty<T = string>(expression: string): T {
        // Assume the property exists on the first axis
        return get(this.getChart().axes?.[0], expression, undefined);
    }

    private setAxisThemeOverrides<T = string>(properties: { expression: string, value: T }[]): void {
        const chart = this.getChart();

        // combine the options into a single merged object
        let chartOptions = this.createChartOptions();
        for (const { expression, value } of properties) {
            // Only apply the property to axes that declare the property on their prototype chain
            const relevantAxes = chart.axes?.filter((axis) => {
                const parts = expression.split('.');
                let current: any = axis;
                for (const part of parts) {
                    if (!(part in current)) {
                        return false;
                    }
                    current = current[part];
                }
                return true;
            });
            if (!relevantAxes) continue;

            for (const axis of relevantAxes)  {
                this.updateChartAxisThemeOverride(chartOptions, axis, null, expression, value);
            }
            
        }

        this.applyChartOptions(chartOptions);
    }

    private getCartesianAxisProperty<T = string | undefined>(axisType: 'xAxis' | 'yAxis', expression: string): T {
        const axes = this.getChartAxes();
        const axis = this.getCartesianAxis(axes, axisType);
        return get(axis, expression, undefined);
    }

    private setCartesianAxisThemeOverrides<T = string>(
        axisType: 'xAxis' | 'yAxis',
        properties: Array<{ expression: string, value: T }>,
    ): void {
        const axes = this.getChartAxes();
        const chartAxis = this.getCartesianAxis(axes, axisType);
        if (!chartAxis) return;

        // combine the axis options into a single merged object
        let chartOptions = this.createChartOptions();
        for (const { expression, value } of properties) {
            this.updateChartAxisThemeOverride(
                chartOptions,
                chartAxis,
                axisType === 'yAxis' ? ['left', 'right'] : ['bottom', 'top'],
                expression,
                value,
            );
        }

        this.applyChartOptions(chartOptions);
    }

    private setCartesianAxisOptions<T = string>(
        axisType: 'xAxis' | 'yAxis',
        properties: Array<{ expression: string, value: T }>,
    ): void {
        // Take a snapshot of all updated axis options
        const axisOptions = this.getChartAxisOptions();
        if (!axisOptions) return;

        const axes = this.getChartAxes();
        const chartAxis = this.getCartesianAxis(axes, axisType);
        if (!chartAxis) return;

        // combine the axis options into a single merged object
        let chartOptions = this.createChartOptions();
        (chartOptions as Extract<AgChartOptions, { axes?: any }>).axes = axisOptions;
        const axisIndex = axes.indexOf(chartAxis);
        for (const { expression, value } of properties) {
            this.updateChartOptions(chartOptions, `axes.${axisIndex}.${expression}`, value);
        }

        this.applyChartOptions(chartOptions);
    }

    private getCartesianAxis(axes: ChartAxis[], axisType: 'xAxis' | 'yAxis'): ChartAxis | undefined {
        if (axes.length < 2) { return undefined; }
        switch (axisType) {
            case 'xAxis': return (axes[0].direction === 'x') ? axes[0] : axes[1];
            case 'yAxis': return (axes[1].direction === 'y') ? axes[1] : axes[0];
        }
    }

    private getSeriesOption<T = string>(seriesType: ChartSeriesType, expression: string, calculated?: boolean): T {
        // N.B. 'calculated' here refers to the fact that the property exists on the internal series object itself,
        // rather than the properties object. This is due to us needing to reach inside the chart itself to retrieve
        // the value, and will likely be cleaned up in a future release
        const series = this.getChart().series.find((s: any) => ChartOptionsService.isMatchingSeries(seriesType, s));
        return get(calculated ? series : series?.properties.toJson(), expression, undefined) as T;
    }

    private setSeriesOptions<T = string>(seriesType: ChartSeriesType, properties: { expression: string, value: T }[]): void {
        // combine the series options into a single merged object
        let chartOptions = this.createChartOptions();
        for (const { expression, value } of properties) {
            this.updateChartOptionsThemeOverrides(
                chartOptions,
                seriesType,
                `series.${expression}`,
                value
            );
        }

        this.applyChartOptions(chartOptions);
    }

    public getPairedMode(): boolean {
        return this.chartController.getChartProxy().isPaired();
    }

    public setPairedMode(paired: boolean): void {
        this.chartController.getChartProxy().setPaired(paired);
    }

    private getChartAxes(): Array<ChartAxis> {
        const chart = this.getChart();
        return chart.axes ?? [];
    }

    private updateChartAxisThemeOverride<T = string>(
        chartOptions: AgChartOptions,
        chartAxis: ChartAxis,
        axisPositions: ('left' | 'right' | 'top' | 'bottom')[] | null,
        expression: string,
        value: T,
    ): void {
        if (!this.isValidAxisType(chartAxis)) return;

        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }

        // combine the axis options into a single merged object with entries for each series type
        for (const seriesType of chartSeriesTypes) {
            if (axisPositions) {
                for (const axisPosition of axisPositions) {
                    this.updateChartOptionsThemeOverrides(
                        chartOptions,
                        seriesType,
                        `axes.${chartAxis.type}.${axisPosition}.${expression}`,
                        value
                    );
                }
            } else {
                this.updateChartOptionsThemeOverrides(
                    chartOptions,
                    seriesType,
                    `axes.${chartAxis.type}.${expression}`,
                    value
                );
            }
        }
    }

    private isValidAxisType(chartAxis: ChartAxis): boolean {
        const validAxisTypes: (AgCartesianAxisType | AgPolarAxisType)[] = ['number', 'category', 'time', 'grouped-category', 'angle-category', 'angle-number', 'radius-category', 'radius-number'];
        return validAxisTypes.includes(chartAxis.type);
    }

    public getChartType(): ChartType {
        return this.chartController.getChartType();
    }

    private getChart() {
        return this.chartController.getChartProxy().getChart();
    }

    private updateChart(chartOptions: AgChartOptions) {
        const chartRef = this.chartController.getChartProxy().getChartRef();
        chartRef.skipAnimations();
        AgCharts.updateDelta(chartRef, chartOptions);
    }

    private createChartOptions(): AgChartOptions {
        const chartOptions = {
            theme: {
                overrides: {}
            }
        };
        return chartOptions;
    }

    private updateChartOptionsThemeOverrides<T>(
        chartOptions: AgChartOptions, 
        seriesType: ChartSeriesType,
        expression: string,
        value: T,
    ): void {
        this.updateChartOptions(chartOptions, `theme.overrides.${seriesType}.${expression}`, value)
    }

    private updateChartOptions<T>(
        chartOptions: AgChartOptions, 
        expression: string,
        value: T,
    ): void {
        set(chartOptions, expression, value);
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

    public getChartOptionMenuUtils(): ChartMenuUtils {
        return this.chartThemeOverridesMenuUtil;
    }

    public getAxisThemeOverridesMenuUtils(): ChartMenuUtils {
        return this.axisThemeOverridesMenuUtil;
    }

    public getCartesianAxisThemeOverridesMenuUtils(axisType: 'xAxis' | 'yAxis'): ChartMenuUtils {
        switch (axisType) {
            case 'xAxis': return this.xAxisThemeOverridesMenuUtil;
            case 'yAxis': return this.yAxisThemeOverridesMenuUtil;
        }
    }

    public getCartesianAxisOptionsMenuUtils(axisType: 'xAxis' | 'yAxis'): ChartMenuUtils {
        switch (axisType) {
            case 'xAxis': return this.xAxisOptionsMenuUtil;
            case 'yAxis': return this.yAxisOptionsMenuUtil;
        }
    }

    public getSeriesOptionMenuUtils(getSelectedSeries: () => ChartSeriesType): ChartMenuUtils {
        return this.createManagedBean(new ChartMenuUtils({
            getValue: (expression, calculated) => this.getSeriesOption(getSelectedSeries(), expression, calculated),
            setValue: (expression, value) => this.setSeriesOptions(getSelectedSeries(), [{ expression, value }]),
            setValues: (properties) => this.setSeriesOptions(getSelectedSeries(), properties),
        }, this));
    }

    private static isMatchingSeries(seriesType: ChartSeriesType, series: SupportedSeries): boolean {
        return VALID_SERIES_TYPES.includes(seriesType) && series.type === seriesType;
    }

    protected destroy(): void {
        super.destroy();
    }
}
