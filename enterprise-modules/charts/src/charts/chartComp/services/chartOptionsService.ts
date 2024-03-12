import { _, AgChartThemeOverrides, BeanStub, ChartOptionsChanged, ChartType, Events, WithoutGridCommon } from "@ag-grid-community/core";
import { AgCartesianAxisType, AgCharts, AgChartOptions, AgPolarAxisType, AgBaseThemeableChartOptions, AgCartesianChartOptions, AgCartesianAxesTheme } from "ag-charts-community";

import { ChartController } from "../chartController";
import { AgChartActual, AgChartAxisType } from "../utils/integration";
import { get, set } from "../utils/object";
import { ChartSeriesType, isCartesian, VALID_SERIES_TYPES } from "../utils/seriesTypeMapper";

export interface ChartOptionsProxy {
    getValue<T = string>(expression: string, calculated?: boolean): T;
    setValue<T = string>(expression: string, value: T): void;
    setValues<T = string>(properties: { expression: string, value: T }[]): void;
}

type ChartAxis = NonNullable<AgChartActual['axes']>[number];
type SupportedSeries = AgChartActual['series'][number];
type AgCartesianAxisThemeOverrides = NonNullable<AgCartesianAxesTheme[keyof AgCartesianAxesTheme]>;

type AgChartOptionsWithThemeOverrides = AgChartOptions & {
    theme: NonNullable<Extract<AgChartOptions['theme'], object>> & {
        overrides: NonNullable<Extract<AgChartOptions['theme'], object>['overrides']>
    }
};

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

    /**
     * Determine the set of theme overrides that should be retained when transitioning from one chart type to another.
     */
    public getPersistedChartThemeOverrides(
        existingChartOptions: AgChartOptions,
        existingAxes: ChartAxis[] | undefined,
        existingChartType: ChartType,
        targetChartType: ChartType,
    ): AgChartThemeOverrides {
        // Determine the set of theme override keys that should be retained when transitioning from one chart type to another
        const retainedThemeOverrideKeys = this.getRetainedChartThemeOverrideKeys(existingChartType, targetChartType, existingAxes);

        // combine the options into a single merged object
        const targetChartOptions = this.createChartOptions();
        // copy the retained theme overrides from the existing chart options to the target chart options
        for (const expression of retainedThemeOverrideKeys) {
            // Locate the value in the existing chart series theme overrides
            const value = this.retrieveChartOptionsThemeOverride(existingChartOptions, existingChartType, expression);
            if (value !== undefined) {
                // Update the value in the target chart series theme overrides
                this.assignChartOptionsThemeOverride(targetChartOptions, targetChartType, expression, value);
            }
        }

        return targetChartOptions.theme.overrides;
    }

    public getRetainedChartThemeOverrideKeys(
        existingChartType: ChartType,
        targetChartType: ChartType,
        existingAxes: ChartAxis[] | undefined,
    ): (keyof AgBaseThemeableChartOptions | string)[] {
        // these theme overrides are persisted across all chart types
        const UNIVERSAL_PERSISTED_THEME_OVERRIDES: (keyof AgBaseThemeableChartOptions)[] = ['animation'];

        // these theme overrides are persisted across all cartesian chart types
        const PERSISTED_CARTESIAN_CHART_THEME_OVERRIDES: (keyof AgCartesianChartOptions)[] = ['zoom', 'navigator'];

        // other chart options will be retained depending on the specifics of the chart type from/to transition
        const chartSpecificThemeOverrideKeys = ((previousChartType, updatedChartType) => {
            const expressions = new Array<string>();
            if (isCartesian(previousChartType) && isCartesian(updatedChartType)) {
                expressions.push(...PERSISTED_CARTESIAN_CHART_THEME_OVERRIDES);

                if (existingAxes) {
                    const xAxis = this.getCartesianAxis(existingAxes, 'xAxis');
                    const yAxis = this.getCartesianAxis(existingAxes, 'yAxis');
                    expressions.push(...this.getRetainedCartesianAxisThemeOverrideKeys(xAxis?.type, yAxis?.type))

                };
            }
            return expressions;
        })(existingChartType, targetChartType);
        
        return [
            ...UNIVERSAL_PERSISTED_THEME_OVERRIDES,
            ...chartSpecificThemeOverrideKeys,
        ];
    }

    private getRetainedCartesianAxisThemeOverrideKeys(
        xAxisType: AgChartAxisType | undefined,
        yAxisType: AgChartAxisType | undefined,
    ): (keyof AgCartesianAxisThemeOverrides | string)[] {
        // these axis theme overrides are persisted across all cartesian chart axis types
        const PERSISTED_CARTESIAN_AXIS_THEME_OVERRIDES: (keyof AgCartesianAxisThemeOverrides)[] = ['crosshair'];

        const expressions = new Array<keyof AgBaseThemeableChartOptions | string>();
        for (const expression of PERSISTED_CARTESIAN_AXIS_THEME_OVERRIDES) {
            if (xAxisType) {
                expressions.push(
                    ...['', '.top', '.bottom'].map(position => `axes.${xAxisType}${position}.${expression}`),
                );
            }
            if (yAxisType) {
                expressions.push(
                    ...['', '.left', '.right'].map(position => `axes.${yAxisType}${position}.${expression}`),
                );
            }
        }
        return expressions;
    }

    private getChartOption<T = string>(expression: string): T {
        return get(this.getChart(), expression, undefined) as T;
    }

    private setChartThemeOverrides<T = string>(properties: {expression: string, value: T}[]): void {
        const chartType = this.getChartType();
        // combine the options into a single merged object
        const chartOptions: AgChartOptions = this.createChartOptions();
        for (const { expression, value } of properties) {
            this.assignChartOptionsThemeOverride(chartOptions, chartType, expression, value);
        }
        this.applyChartOptions(chartOptions);
    }

    private applyChartOptions(chartOptions: AgChartOptions, options?: { silent?: boolean }): void {
        if (Object.keys(chartOptions).length === 0) return;
        this.updateChart(chartOptions);
        const shouldRaiseEvent = !options?.silent;
        if (shouldRaiseEvent) this.raiseChartOptionsChangedEvent();
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
        const chartType = this.getChartType();

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
                if (!this.isValidAxisType(axis)) continue;
                this.assignChartAxisThemeOverride(chartOptions, chartType, axis.type, null, expression, value);
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
        if (!chartAxis || !this.isValidAxisType(chartAxis)) return undefined;
        const chartType = this.getChartType();
        const chartOptions = this.getChart().getOptions();

        return this.retrieveChartAxisThemeOverride(
            chartOptions,
            chartType,
            chartAxis.type,
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
        if (!chartAxis || !this.isValidAxisType(chartAxis)) return;
        const chartType = this.getChartType();

        // combine the axis options into a single merged object
        let chartOptions = this.createChartOptions();
        for (const { expression, value } of properties) {
            this.assignChartAxisThemeOverride(
                chartOptions,
                chartType,
                chartAxis.type,
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
        // get a snapshot of all existing axis options from the chart instance
        const existingChartOptions = this.getChart().getOptions();
        const axisOptions = ('axes' in existingChartOptions ? existingChartOptions.axes : undefined);
        if (!existingChartOptions || !axisOptions) return;

        const axes = this.getChartAxes();
        const chartAxis = this.getCartesianAxis(axes, axisType);
        if (!chartAxis) return;

        // combine the axis options into a single merged object
        let chartOptions = this.createChartOptions();
        (chartOptions as Extract<AgChartOptions, { axes?: any }>).axes = axisOptions;
        
        // if the axis type is changing, we need to persist any relevant theme overrides assigned to the existing axis
        const axisTypeUpdate = properties.find(({ expression }) => expression === 'type');
        if (axisTypeUpdate) {
            const updatedAxisType = axisTypeUpdate.value as AgChartAxisType;
            // the names of the retained axis overrides need to be mapped from the old axis type to the new axis type
            const renamedThemeOverrideKeys = this.getRenamedCartesianAxisThemeOverrideKeys(
                axes,
                axisType,
                updatedAxisType,
            );
            // copy any retained theme overrides onto the combined chart options object under the renamed key
            if (renamedThemeOverrideKeys) {
                const chartType = this.getChartType();
                for (const [previousExpression, updatedExpression] of renamedThemeOverrideKeys) {
                    const value = this.retrieveChartOptionsThemeOverride(existingChartOptions, chartType, previousExpression);
                    if (value !== undefined) this.assignChartOptionsThemeOverride(chartOptions, chartType, updatedExpression, value);
                }
            }
        }

        // assign the provided axis options onto the combined chart options object
        const axisIndex = axes.indexOf(chartAxis);
        for (const { expression, value } of properties) {
            this.assignChartOption(chartOptions, `axes.${axisIndex}.${expression}`, value);
        }

        this.applyChartOptions(chartOptions);
    }

    private getRenamedCartesianAxisThemeOverrideKeys(
        existingAxes: ChartAxis[],
        axisType: 'xAxis' | 'yAxis',
        updatedAxisType: AgChartAxisType,
    ): [
        keyof AgCartesianAxisThemeOverrides | string,
        keyof AgCartesianAxisThemeOverrides | string,
    ][] | undefined {
        const xAxis = this.getCartesianAxis(existingAxes, 'xAxis');
        const yAxis = this.getCartesianAxis(existingAxes, 'yAxis');
        const retainedThemeOverrideKeys = this.getRetainedCartesianAxisThemeOverrideKeys(
            axisType === 'xAxis' ? xAxis?.type : undefined,
            axisType === 'yAxis' ? yAxis?.type : undefined,
        );
        const renamedThemeOverrideKeys = this.getRetainedCartesianAxisThemeOverrideKeys(
            axisType === 'xAxis' ? updatedAxisType : undefined,
            axisType === 'yAxis' ? updatedAxisType : undefined,
        );
        return _.zip(retainedThemeOverrideKeys, renamedThemeOverrideKeys);
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
            this.assignChartOptionsSeriesThemeOverride(
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
        chartType: ChartType,
        axisType: AgChartAxisType,
        axisPositions: ('left' | 'right' | 'top' | 'bottom')[] | null,
        expression: string | null,
    ): T | undefined {
        // Theme overrides can be applied either to all axes simultaneously, or only to axes in a certain orientation
        // (this allows more fine-grained control for e.g. styling horizontal / vertical axes separately)
        if (axisPositions) {
            for (const axisPosition of axisPositions) {
                const value = this.retrieveChartOptionsThemeOverride<T>(
                    chartOptions,
                    chartType,
                    ['axes', axisType, axisPosition, ...expression ? [expression] : []].join('.'),
                );
                if (value === undefined) continue;
                return value;
            }
        } else {
            return this.retrieveChartOptionsThemeOverride<T>(
                chartOptions,
                chartType,
                ['axes', axisType, ...expression ? [expression] : []].join('.'),
            );
        }
    }

    private assignChartAxisThemeOverride<T = string>(
        chartOptions: AgChartOptions,
        chartType: ChartType,
        axisType: AgChartAxisType,
        axisPositions: ('left' | 'right' | 'top' | 'bottom')[] | null,
        expression: string | null,
        value: T,
    ): void {
        // Theme overrides can be applied either to all axes simultaneously, or only to axes in a certain orientation
        // (this allows more fine-grained control for e.g. styling horizontal / vertical axes separately)
        if (axisPositions) {
            for (const axisPosition of axisPositions) {
                this.assignChartOptionsThemeOverride(
                    chartOptions,
                    chartType,
                    ['axes', axisType, axisPosition, ...expression ? [expression] : []].join('.'),
                    value
                );
            }
        } else {
            this.assignChartOptionsThemeOverride(
                chartOptions,
                chartType,
                ['axes', axisType, ...expression ? [expression] : []].join('.'),
                value
            );
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

    private createChartOptions(): AgChartOptionsWithThemeOverrides {
        const chartOptions = {
            theme: {
                overrides: {}
            }
        };
        return chartOptions;
    }

    private retrieveChartOptionsThemeOverride<T>(
        chartOptions: AgChartOptions, 
        chartType: ChartType,
        expression: string | null,
    ): T | undefined {
        // Determine the relevant series type theme override series keys for the current chart
        const chartSeriesTypes = this.getChartThemeOverridesSeriesTypeKeys(chartType);

        // Retrieve the first matching value
        for (const seriesType of chartSeriesTypes) {
            const value = this.retrieveChartOptionsSeriesThemeOverride<T>(chartOptions, seriesType, expression);
            if (value === undefined) continue;
            return value;
        }

        return undefined;
    }

    private assignChartOptionsThemeOverride<T>(
        chartOptions: AgChartOptions, 
        chartType: ChartType,
        expression: string | null,
        value: T,
    ): void {
        // Determine the relevant series type theme override series keys for the current chart
        const chartSeriesTypes = this.getChartThemeOverridesSeriesTypeKeys(chartType);

        // assign the relevant theme overrides for each series type
        for (const seriesType of chartSeriesTypes) {
            this.assignChartOptionsSeriesThemeOverride(chartOptions, seriesType, expression, value);
        }
    }

    private retrieveChartOptionsSeriesThemeOverride<T>(
        chartOptions: AgChartOptions, 
        seriesType: ChartSeriesType,
        expression: string | null,
    ): T | undefined {
        return this.retrieveChartOption<T>(
            chartOptions,
            ['theme', 'overrides', seriesType, ...expression ? [expression] : []].join('.'),
        );
    }

    private assignChartOptionsSeriesThemeOverride<T>(
        chartOptions: AgChartOptions, 
        seriesType: ChartSeriesType,
        expression: string | null,
        value: T,
    ): void {
        this.assignChartOption<T>(
            chartOptions,
            ['theme', 'overrides', seriesType, ...expression ? [expression] : []].join('.'),
            value,
        );
    }

    private getChartThemeOverridesSeriesTypeKeys(chartType: ChartType): ChartSeriesType[] {
        // In the chart options API, theme overrides are categorized according to series type.
        // Depending on the chart type, theme overrides may need to be applied to multiple series types.
        const chartSeriesTypes = this.chartController.getChartSeriesTypes(chartType);
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }
        return chartSeriesTypes;
    }

    private retrieveChartOption<T>(
        chartOptions: AgChartOptions, 
        expression: string,
    ): T | undefined {
        return get(chartOptions, expression, undefined);
    }

    private assignChartOption<T>(
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
