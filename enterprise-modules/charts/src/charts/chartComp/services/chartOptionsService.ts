import { _, BeanStub, ChartOptionsChanged, ChartType, Events, WithoutGridCommon } from "@ag-grid-community/core";
import { AgCartesianAxisType, AgCharts, AgChartOptions, AgPolarAxisType } from "ag-charts-community";

import { ChartController } from "../chartController";
import { AgChartActual } from "../utils/integration";
import { get, set } from "../utils/object";
import { ChartSeriesType, VALID_SERIES_TYPES } from "../utils/seriesTypeMapper";

export interface ChartOptionsProxy {
    getValue<T = string>(expression: string, calculated?: boolean): T;
    setValue<T = string>(expression: string, value: T): void;
    setValues<T = string>(properties: { expression: string, value: T }[]): void;
}

type ChartAxis = NonNullable<AgChartActual['axes']>[number];
type SupportedSeries = AgChartActual['series'][number];
type AgChartAxisOptions<T extends AgChartOptions = AgChartOptions> =
    T extends { axes?: infer V }
    ? V | undefined
    : undefined;

export class ChartOptionsService extends BeanStub {
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    public getChartThemeOverridesProxy(): ChartOptionsProxy {
        return {
            getValue: (expression) => this.getChartOption(expression),
            setValue: (expression, value) => this.setChartThemeOverrides([{ expression, value }]),
            setValues: (properties) => this.setChartThemeOverrides(properties),
        };
    }

    public getAxisThemeOverridesProxy(): ChartOptionsProxy {
        return {
            getValue: (expression) => this.getAxisProperty(expression),
            setValue: (expression, value) => this.setAxisThemeOverrides([{ expression, value }]),
            setValues: (properties) => this.setAxisThemeOverrides(properties),
        };
    }

    public getCartesianAxisOptionsProxy(axisType: 'xAxis' | 'yAxis'): ChartOptionsProxy {
        return {
            getValue: (expression) => this.getCartesianAxisProperty(axisType, expression),
            setValue: (expression, value) => this.setCartesianAxisOptions(axisType, [{ expression, value }]),
            setValues: (properties) => this.setCartesianAxisOptions(axisType, properties),
        };
    }

    public getCartesianAxisThemeOverridesProxy(axisType: 'xAxis' | 'yAxis' ): ChartOptionsProxy {
        return {
            getValue: (expression) => this.getCartesianAxisProperty(axisType, expression),
            setValue: (expression, value) => this.setCartesianAxisThemeOverrides(axisType, [{ expression, value }]),
            setValues: (properties) => this.setCartesianAxisThemeOverrides(axisType, properties),
        };
    }

    public getCartesianAxisAppliedThemeOverridesProxy(axisType: 'xAxis' | 'yAxis' ): ChartOptionsProxy {
        return {
            getValue: (expression) => this.getCartesianAxisThemeOverride(
                axisType,
                // Allow the caller to specify a wildcard expression to retrieve the whole set of overrides
                expression === '*' ? null : expression,
            )!,
            setValue: (expression, value) => this.setCartesianAxisThemeOverrides(
                axisType,
                // Allow the caller to specify a wildcard expression to set the whole set of overrides
                [{ expression: expression === '*' ? null : expression, value }],
            ),
            setValues: (properties) => this.setCartesianAxisThemeOverrides(axisType, properties),
        };
    }

    public getSeriesOptionsProxy(getSelectedSeries: () => ChartSeriesType): ChartOptionsProxy {
        return {
            getValue: (expression, calculated) => this.getSeriesOption(getSelectedSeries(), expression, calculated),
            setValue: (expression, value) => this.setSeriesOptions(getSelectedSeries(), [{ expression, value }]),
            setValues: (properties) => this.setSeriesOptions(getSelectedSeries(), properties),
        };
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
                this.updateChartOptionsThemeOverride(chartOptions, seriesType, expression, value);
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

    private getCartesianAxisThemeOverride<T = string>(
        axisType: 'xAxis' | 'yAxis',
        expression: string | null,
    ): T | undefined {
        const axes = this.getChartAxes();
        const chartAxis = this.getCartesianAxis(axes, axisType);
        if (!chartAxis) return undefined;
        const chartOptions = this.getChart().getOptions();
        return this.retrieveChartAxisThemeOverride(
            chartOptions,
            chartAxis,
            axisType === 'yAxis' ? ['left', 'right'] : ['bottom', 'top'],
            expression,
        );
    }

    private setCartesianAxisThemeOverrides<T = string>(
        axisType: 'xAxis' | 'yAxis',
        properties: Array<{ expression: string | null, value: T }>,
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
            this.updateChartOption(chartOptions, `axes.${axisIndex}.${expression}`, value);
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
            this.updateChartOptionsThemeOverride(
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

    private retrieveChartAxisThemeOverride<T = string>(
        chartOptions: AgChartOptions,
        chartAxis: ChartAxis,
        axisPositions: ('left' | 'right' | 'top' | 'bottom')[] | null,
        expression: string | null,
    ): T | undefined {
        if (!this.isValidAxisType(chartAxis)) return;

        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }

        // retrieve the first matching value
        for (const seriesType of chartSeriesTypes) {
            if (axisPositions) {
                for (const axisPosition of axisPositions) {
                    const value = this.retrieveChartOptionsThemeOverride<T>(
                        chartOptions,
                        seriesType,
                        ['axes', chartAxis.type, axisPosition, ...expression ? [expression] : []].join('.'),
                    );
                    if (value !== undefined) return value;
                }
            } else {
                const value = this.retrieveChartOptionsThemeOverride<T>(
                    chartOptions,
                    seriesType,
                    ['axes', chartAxis.type, ...expression ? [expression] : []].join('.'),
                );
                if (value !== undefined) return value;
            }
        }
    }

    private updateChartAxisThemeOverride<T = string>(
        chartOptions: AgChartOptions,
        chartAxis: ChartAxis,
        axisPositions: ('left' | 'right' | 'top' | 'bottom')[] | null,
        expression: string | null,
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
                    this.updateChartOptionsThemeOverride(
                        chartOptions,
                        seriesType,
                        ['axes', chartAxis.type, axisPosition, ...expression ? [expression] : []].join('.'),
                        value
                    );
                }
            } else {
                this.updateChartOptionsThemeOverride(
                    chartOptions,
                    seriesType,
                    ['axes', chartAxis.type, ...expression ? [expression] : []].join('.'),
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

    private retrieveChartOptionsThemeOverride<T>(
        chartOptions: AgChartOptions, 
        seriesType: ChartSeriesType,
        expression: string | null,
    ): T | undefined {
        return this.retrieveChartOption(
            chartOptions,
            ['theme', 'overrides', seriesType, ...expression ? [expression] : []].join('.'),
        );
    }

    private updateChartOptionsThemeOverride<T>(
        chartOptions: AgChartOptions, 
        seriesType: ChartSeriesType,
        expression: string | null,
        value: T,
    ): void {
        this.updateChartOption(
            chartOptions,
            ['theme', 'overrides', seriesType, ...expression ? [expression] : []].join('.'),
            value,
        );
    }

    private retrieveChartOption<T>(
        chartOptions: AgChartOptions, 
        expression: string,
    ): T | undefined {
        return get(chartOptions, expression, undefined);
    }

    private updateChartOption<T>(
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

    private static isMatchingSeries(seriesType: ChartSeriesType, series: SupportedSeries): boolean {
        return VALID_SERIES_TYPES.includes(seriesType) && series.type === seriesType;
    }

    protected destroy(): void {
        super.destroy();
    }
}
