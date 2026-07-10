import type {
    AgBaseThemeableChartOptions,
    AgCartesianAxesTheme,
    AgCartesianAxisOptions,
    AgCartesianAxisType,
    AgCartesianChartOptions,
    AgChartOptions,
    AgChartThemeOverrides,
    AgPolarAxesTheme,
    AgPolarAxisType,
} from 'ag-charts-types';

import type { ChartType } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import type { ChartController } from '../chartController';
import type { AgChartActual, AgChartAxisType } from '../utils/integration';
import { get, set } from '../utils/object';
import type { ChartSeriesType, ChartThemeOverridesSeriesType } from '../utils/seriesTypeMapper';
import { getSeriesType, isCartesian, isSeriesType } from '../utils/seriesTypeMapper';

export interface ChartOptionsProxy {
    getValue<T = string>(expression: string, calculated?: boolean): T;
    setValue<T = string>(expression: string, value: T): void;
    setValues<T = string>(properties: { expression: string; value: T }[]): void;
    /** only used for chart options (not theme overrides) */
    clearValue?(parentExpression: string, key: string): void;
}

type ChartAxis = NonNullable<AgChartActual['axes']>[number];
type SupportedSeries = AgChartActual['series'][number];
type AgPolarAxisThemeOverrides = NonNullable<AgPolarAxesTheme[keyof AgPolarAxesTheme]>;
type AgCartesianAxisThemeOverrides = NonNullable<AgCartesianAxesTheme[keyof AgCartesianAxesTheme]>;
type AgChartAxisThemeOverrides = AgCartesianAxisThemeOverrides | AgPolarAxisThemeOverrides;

type AgChartOptionsWithThemeOverrides = AgChartOptions & {
    theme: NonNullable<Extract<AgChartOptions['theme'], object>> & {
        overrides: NonNullable<Extract<AgChartOptions['theme'], object>['overrides']>;
    };
};

type ReadScope =
    | { kind: 'chart' }
    | { kind: 'axis'; direction: 'x' | 'y' | 'angle' | 'radius' }
    | { kind: 'series'; seriesType: ChartSeriesType };

const CARTESIAN_AXIS_TYPES: AgCartesianAxisType[] = ['number', 'category', 'time', 'grouped-category'];
const POLAR_AXIS_TYPES: AgPolarAxisType[] = ['angle-category', 'angle-number', 'radius-category', 'radius-number'];

const VALID_AXIS_TYPES: (AgCartesianAxisType | AgPolarAxisType)[] = [...CARTESIAN_AXIS_TYPES, ...POLAR_AXIS_TYPES];

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
            clearValue: (parentExpression, key) => this.clearCartesianAxisOptions(axisType, parentExpression, key),
        };
    }

    public getCartesianAxisThemeOverridesProxy(axisType: 'xAxis' | 'yAxis'): ChartOptionsProxy {
        return {
            getValue: (expression) => this.getCartesianAxisProperty(axisType, expression),
            setValue: (expression, value) => this.setCartesianAxisThemeOverrides(axisType, [{ expression, value }]),
            setValues: (properties) => this.setCartesianAxisThemeOverrides(axisType, properties),
        };
    }

    public getCartesianAxisAppliedThemeOverridesProxy(axisType: 'xAxis' | 'yAxis'): ChartOptionsProxy {
        return {
            getValue: (expression) =>
                this.getCartesianAxisThemeOverride(
                    axisType,
                    // Allow the caller to specify a wildcard expression to retrieve the whole set of overrides
                    expression === '*' ? null : expression
                )!,
            setValue: (expression, value) =>
                this.setCartesianAxisThemeOverrides(
                    axisType,
                    // Allow the caller to specify a wildcard expression to set the whole set of overrides
                    [{ expression: expression === '*' ? null : expression, value }]
                ),
            setValues: (properties) => this.setCartesianAxisThemeOverrides(axisType, properties),
        };
    }

    public getPolarAxisThemeOverridesProxy(axisType: 'angle' | 'radius'): ChartOptionsProxy {
        return {
            getValue: (expression) => this.getPolarAxisProperty(axisType, expression),
            setValue: (expression, value) => this.setAxisThemeOverrides([{ expression, value }]),
            setValues: (properties) => this.setAxisThemeOverrides(properties),
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
        targetChartType: ChartType
    ): AgChartThemeOverrides {
        // Determine the set of theme override keys that should be retained when transitioning from one chart type to another
        const retainedThemeOverrideKeys = this.getRetainedChartThemeOverrideKeys(existingChartType, targetChartType);
        const retainedChartAxisThemeOverrideKeys = this.getRetainedChartAxisThemeOverrideKeys(
            null,
            existingChartType,
            targetChartType
        );

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

        // axis theme overrides are copied to all potential target axis types
        // (this is necessary because certain chart types auto-instantiate different axis types given the same data)
        if (existingAxes) {
            this.assignPersistedAxisOverrides({
                existingAxes,
                retainedChartAxisThemeOverrideKeys,
                existingChartOptions,
                targetChartOptions,
                existingChartType,
                targetChartType,
            });
        }

        return targetChartOptions.theme.overrides;
    }

    public assignPersistedAxisOverrides(params: {
        existingAxes: ChartAxis[];
        retainedChartAxisThemeOverrideKeys: {
            expression: keyof AgChartAxisThemeOverrides | string;
            targetAxisTypes: AgChartAxisType[];
        }[];
        existingChartOptions: AgChartOptions;
        targetChartOptions: AgChartOptions;
        existingChartType: ChartType;
        targetChartType: ChartType;
    }): void {
        const {
            existingAxes,
            retainedChartAxisThemeOverrideKeys,
            existingChartOptions,
            targetChartOptions,
            existingChartType,
            targetChartType,
        } = params;
        for (const { expression, targetAxisTypes } of retainedChartAxisThemeOverrideKeys) {
            // Locate the value in the existing chart series theme overrides
            for (const existingAxisType of existingAxes.map((axis) => axis.type)) {
                const value = this.retrieveChartOptionsThemeOverride(
                    existingChartOptions,
                    existingChartType,
                    ['axes', existingAxisType, expression].join('.')
                );
                if (value !== undefined) {
                    // Copy the value to all potential target chart axis theme overrides
                    // (axis theme overrides are currently only persisted across cartesian chart types)
                    for (const targetAxisType of targetAxisTypes) {
                        this.assignChartOptionsThemeOverride(
                            targetChartOptions,
                            targetChartType,
                            ['axes', targetAxisType, expression].join('.'),
                            value
                        );
                    }
                }
            }
        }
    }

    private getRetainedChartThemeOverrideKeys(
        existingChartType: ChartType,
        targetChartType: ChartType
    ): (keyof AgBaseThemeableChartOptions | string)[] {
        // these theme overrides are persisted across all chart types
        const UNIVERSAL_PERSISTED_THEME_OVERRIDES: (keyof AgBaseThemeableChartOptions)[] = ['animation'];

        // these theme overrides are persisted across all cartesian chart types
        const PERSISTED_CARTESIAN_CHART_THEME_OVERRIDES: (keyof AgCartesianChartOptions)[] = ['zoom', 'navigator'];

        // other chart options will be retained depending on the specifics of the chart type from/to transition
        const chartSpecificThemeOverrideKeys = ((previousChartType, updatedChartType) => {
            const expressions = new Array<string>();
            if (isCartesian(getSeriesType(previousChartType)) && isCartesian(getSeriesType(updatedChartType))) {
                expressions.push(...PERSISTED_CARTESIAN_CHART_THEME_OVERRIDES);
            }
            return expressions;
        })(existingChartType, targetChartType);

        return [...UNIVERSAL_PERSISTED_THEME_OVERRIDES, ...chartSpecificThemeOverrideKeys];
    }

    private getRetainedChartAxisThemeOverrideKeys(
        axisType: 'xAxis' | 'yAxis' | null,
        existingChartType: ChartType,
        targetChartType: ChartType
    ): {
        expression: keyof AgChartAxisThemeOverrides | string;
        targetAxisTypes: AgChartAxisType[];
    }[] {
        // different axis types have different theme overrides
        if (isCartesian(getSeriesType(existingChartType)) && isCartesian(getSeriesType(targetChartType))) {
            const retainedKeys = this.getRetainedCartesianAxisThemeOverrideKeys(axisType);
            return retainedKeys.map((expression) => ({ expression, targetAxisTypes: CARTESIAN_AXIS_TYPES }));
        }
        return [];
    }

    private getRetainedCartesianAxisThemeOverrideKeys(
        axisType: 'xAxis' | 'yAxis' | null
    ): (keyof AgCartesianAxisThemeOverrides | string)[] {
        const axisPositionSuffixes =
            axisType === 'xAxis'
                ? ['', '.top', '.bottom']
                : axisType === 'yAxis'
                  ? ['', '.left', '.right']
                  : ['', '.left', '.right', '.top', '.bottom'];

        // these axis theme overrides are persisted across all cartesian chart axis types
        const PERSISTED_CARTESIAN_AXIS_THEME_OVERRIDES: (keyof AgCartesianAxisThemeOverrides)[] = ['crosshair'];

        const expressions = new Array<keyof AgBaseThemeableChartOptions | string>();
        for (const expression of PERSISTED_CARTESIAN_AXIS_THEME_OVERRIDES) {
            for (const axisPositionSuffix of axisPositionSuffixes) {
                expressions.push(`${expression}${axisPositionSuffix}`);
            }
        }
        return expressions;
    }

    private getChartOption<T = string>(expression: string): T {
        return this.readProcessed<T>({ kind: 'chart' }, expression) as T;
    }

    // Reads route through `chart.chartOptions.processedOptions` rather than the live runtime
    // objects, which no longer expose module-provided config (e.g. crosshair) as plain properties.
    private readProcessed<T>(scope: ReadScope, expression: string): T | undefined {
        const processed = this.getChart().chartOptions?.processedOptions as any;
        if (!processed) {
            return undefined;
        }

        let source: unknown;
        switch (scope.kind) {
            case 'chart':
                source = processed;
                break;
            case 'axis':
                source = this.pickProcessedAxis(processed.axes, scope.direction);
                break;
            case 'series':
                source = Array.isArray(processed.series)
                    ? processed.series.find((s: any) => isMatchingSeries(scope.seriesType, s))
                    : undefined;
                break;
        }
        return get(source, expression, undefined) as T;
    }

    private pickProcessedAxis(axes: unknown, direction: 'x' | 'y' | 'angle' | 'radius'): unknown {
        if (!axes || typeof axes !== 'object') {
            return undefined;
        }
        return (axes as Record<string, any>)[direction];
    }

    private setChartThemeOverrides<T = string>(properties: { expression: string; value: T }[]): void {
        const chartType = this.getChartType();
        // combine the options into a single merged object
        const chartOptions: AgChartOptions = this.createChartOptions();
        for (const { expression, value } of properties) {
            this.assignChartOptionsThemeOverride(chartOptions, chartType, expression, value);
        }
        this.applyChartOptions(chartOptions);
    }

    private applyChartOptions(chartOptions: AgChartOptions, options?: { silent?: boolean }): void {
        if (Object.keys(chartOptions).length === 0) {
            return;
        }
        this.updateChart(chartOptions);
        const shouldRaiseEvent = !options?.silent;
        if (shouldRaiseEvent) {
            this.raiseChartOptionsChangedEvent();
        }
    }

    public awaitChartOptionUpdate(func: () => void) {
        const chart = this.chartController.getChartProxy().getChart();
        chart
            .waitForUpdate()
            .then(() => func())
            .catch((e) => this.error(108, { e }));
    }

    private getAxisProperty<T = string>(expression: string): T {
        return this.readProcessed<T>({ kind: 'axis', direction: 'x' }, expression) as T;
    }

    private setAxisThemeOverrides<T = string>(properties: { expression: string; value: T }[]): void {
        const chart = this.getChart();
        const chartType = this.getChartType();

        // combine the options into a single merged object
        const chartOptions = this.createChartOptions();
        for (const { expression, value } of properties) {
            for (const axis of Object.values(chart.axes ?? {})) {
                if (!this.isValidAxisType(axis)) {
                    continue;
                }
                this.assignChartAxisThemeOverride(chartOptions, chartType, axis.type, null, expression, value);
            }
        }

        this.applyChartOptions(chartOptions);
    }

    private getCartesianAxisProperty<T = string | undefined>(axisType: 'xAxis' | 'yAxis', expression: string): T {
        return this.readProcessed<T>({ kind: 'axis', direction: axisType === 'xAxis' ? 'x' : 'y' }, expression) as T;
    }

    private getPolarAxisProperty<T = string | undefined>(axisType: 'angle' | 'radius', expression: string): T {
        return this.readProcessed<T>({ kind: 'axis', direction: axisType }, expression) as T;
    }

    private getCartesianAxisThemeOverride<T = string>(
        axisType: 'xAxis' | 'yAxis',
        expression: string | null
    ): T | undefined {
        const axes = this.getChartAxes();
        const chartAxis = this.getCartesianAxis(axes, axisType);
        if (!chartAxis || !this.isValidAxisType(chartAxis)) {
            return undefined;
        }
        const chartType = this.getChartType();
        const chartOptions = this.getChart().getOptions();

        return this.retrieveChartAxisThemeOverride<T>(
            chartOptions,
            chartType,
            chartAxis.type,
            axisType === 'yAxis' ? ['left', 'right'] : ['bottom', 'top'],
            expression
        );
    }

    private setCartesianAxisThemeOverrides<T = string>(
        axisType: 'xAxis' | 'yAxis',
        properties: Array<{ expression: string | null; value: T }>
    ): void {
        const axes = this.getChartAxes();
        const chartAxis = this.getCartesianAxis(axes, axisType);
        if (!chartAxis || !this.isValidAxisType(chartAxis)) {
            return;
        }
        const chartType = this.getChartType();

        // combine the axis options into a single merged object
        const chartOptions = this.createChartOptions();
        for (const { expression, value } of properties) {
            this.assignChartAxisThemeOverride(
                chartOptions,
                chartType,
                chartAxis.type,
                axisType === 'yAxis' ? ['left', 'right'] : ['bottom', 'top'],
                expression,
                value
            );
        }

        this.applyChartOptions(chartOptions);
    }

    private setCartesianAxisOptions<T = string>(
        axisType: 'xAxis' | 'yAxis',
        properties: Array<{ expression: string; value?: T }>
    ): void {
        this.updateCartesianAxisOptions(axisType, (chartOptions) => {
            // assign the provided axis options onto the combined chart options object
            const axisId = axisType === 'yAxis' ? 'y' : 'x';
            for (const { expression, value } of properties) {
                this.assignChartOption(chartOptions, `axes.${axisId}.${expression}`, value);
            }
        });
    }

    private clearCartesianAxisOptions(axisType: 'xAxis' | 'yAxis', parentExpression: string, key: string): void {
        this.updateCartesianAxisOptions(axisType, (chartOptions) => {
            const axisId = axisType === 'yAxis' ? 'y' : 'x';
            this.clearChartOption(chartOptions, `axes.${axisId}.${parentExpression}`, key);
        });
    }

    private updateCartesianAxisOptions(
        axisType: 'xAxis' | 'yAxis',
        updateFunc: (chartOptions: AgChartOptions, chartAxis: ChartAxis, existingChartOptions: AgChartOptions) => void
    ): void {
        // get a snapshot of all existing axis options from the chart instance
        const existingChartOptions = this.getChart().getOptions();
        const axisOptions = 'axes' in existingChartOptions ? existingChartOptions.axes : undefined;
        if (!existingChartOptions || !axisOptions) {
            return;
        }

        const axes = this.getChartAxes();
        const chartAxis = this.getCartesianAxis(axes, axisType);
        if (!chartAxis) {
            return;
        }

        // combine the axis options into a single merged object
        const chartOptions = this.createChartOptions();
        (chartOptions as Extract<AgChartOptions, { axes?: any }>).axes = axisOptions;

        updateFunc(chartOptions, chartAxis, existingChartOptions);

        this.applyChartOptions(chartOptions);
    }

    public setCartesianCategoryAxisType(axisType: 'xAxis' | 'yAxis', value: AgCartesianAxisOptions['type']): void {
        this.updateCartesianAxisOptions(axisType, (chartOptions, chartAxis, existingChartOptions) => {
            const chartType = this.getChartType();
            this.assignPersistedAxisOverrides({
                existingAxes: [chartAxis],
                retainedChartAxisThemeOverrideKeys: this.getRetainedChartAxisThemeOverrideKeys(
                    axisType,
                    chartType,
                    chartType
                ),
                existingChartOptions,
                targetChartOptions: chartOptions,
                existingChartType: chartType,
                targetChartType: chartType,
            });
            this.assignChartOption(chartOptions, `axes.x.type`, value);
            this.chartController.setCategoryAxisType(value);
        });
    }

    private getCartesianAxis(axes: ChartAxis[], axisType: 'xAxis' | 'yAxis'): ChartAxis | undefined {
        if (axes.length < 2) {
            return undefined;
        }
        switch (axisType) {
            case 'xAxis':
                return axes[0].direction === 'x' ? axes[0] : axes[1];
            case 'yAxis':
                return axes[1].direction === 'y' ? axes[1] : axes[0];
        }
    }

    private getSeriesOption<T = string>(seriesType: ChartSeriesType, expression: string, calculated?: boolean): T {
        // `calculated` reads runtime-derived values (e.g. histogram calculatedBins) off the live series.
        if (calculated) {
            const series = this.getChart().series.find((s: any) => isMatchingSeries(seriesType, s));
            return get(series, expression, undefined) as T;
        }
        return this.readProcessed<T>({ kind: 'series', seriesType }, expression) as T;
    }

    private setSeriesOptions<T = string>(
        seriesType: ChartSeriesType,
        properties: { expression: string; value: T }[]
    ): void {
        // combine the series options into a single merged object
        const chartOptions = this.createChartOptions();
        for (const { expression, value } of properties) {
            this.assignChartOptionsSeriesThemeOverride(chartOptions, seriesType, `series.${expression}`, value);
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
        return Object.values(chart.axes ?? {});
    }

    private retrieveChartAxisThemeOverride<T = string>(
        chartOptions: AgChartOptions,
        chartType: ChartType,
        axisType: AgChartAxisType,
        axisPositions: ('left' | 'right' | 'top' | 'bottom')[] | null,
        expression: string | null
    ): T | undefined {
        // Theme overrides can be applied either to all axes simultaneously, or only to axes in a certain orientation
        // (this allows more fine-grained control for e.g. styling horizontal / vertical axes separately)
        if (axisPositions) {
            for (const axisPosition of axisPositions) {
                const value = this.retrieveChartOptionsThemeOverride<T>(
                    chartOptions,
                    chartType,
                    ['axes', axisType, axisPosition, ...(expression ? [expression] : [])].join('.')
                );
                if (value === undefined) {
                    continue;
                }
                return value;
            }
        } else {
            return this.retrieveChartOptionsThemeOverride<T>(
                chartOptions,
                chartType,
                ['axes', axisType, ...(expression ? [expression] : [])].join('.')
            );
        }
    }

    private assignChartAxisThemeOverride<T = string>(
        chartOptions: AgChartOptions,
        chartType: ChartType,
        axisType: AgChartAxisType,
        axisPositions: ('left' | 'right' | 'top' | 'bottom')[] | null,
        expression: string | null,
        value: T
    ): void {
        // Theme overrides can be applied either to all axes simultaneously, or only to axes in a certain orientation
        // (this allows more fine-grained control for e.g. styling horizontal / vertical axes separately)
        if (axisPositions) {
            for (const axisPosition of axisPositions) {
                this.assignChartOptionsThemeOverride(
                    chartOptions,
                    chartType,
                    ['axes', axisType, axisPosition, ...(expression ? [expression] : [])].join('.'),
                    value
                );
            }
        } else {
            this.assignChartOptionsThemeOverride(
                chartOptions,
                chartType,
                ['axes', axisType, ...(expression ? [expression] : [])].join('.'),
                value
            );
        }
    }

    private isValidAxisType(chartAxis: ChartAxis): boolean {
        return VALID_AXIS_TYPES.includes(chartAxis.type);
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
        chartRef.updateDelta(chartOptions);
    }

    private createChartOptions(): AgChartOptionsWithThemeOverrides {
        const chartOptions = {
            theme: {
                overrides: {},
            },
        };
        return chartOptions;
    }

    private retrieveChartOptionsThemeOverride<T>(
        chartOptions: AgChartOptions,
        chartType: ChartType,
        expression: string | null
    ): T | undefined {
        // Determine the relevant series type theme override series keys for the current chart
        const chartSeriesTypes = this.getChartThemeOverridesSeriesTypeKeys(chartType);

        // Retrieve the first matching value
        for (const seriesType of chartSeriesTypes) {
            const value = this.retrieveChartOptionsSeriesThemeOverride<T>(chartOptions, seriesType, expression);
            if (value === undefined) {
                continue;
            }
            return value;
        }

        return undefined;
    }

    private assignChartOptionsThemeOverride<T>(
        chartOptions: AgChartOptions,
        chartType: ChartType,
        expression: string | null,
        value: T
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
        seriesType: ChartThemeOverridesSeriesType,
        expression: string | null
    ): T | undefined {
        return this.retrieveChartOption<T>(
            chartOptions,
            ['theme', 'overrides', seriesType, ...(expression ? [expression] : [])].join('.')
        );
    }

    private assignChartOptionsSeriesThemeOverride<T>(
        chartOptions: AgChartOptions,
        seriesType: ChartThemeOverridesSeriesType,
        expression: string | null,
        value: T
    ): void {
        this.assignChartOption<T>(
            chartOptions,
            ['theme', 'overrides', seriesType, ...(expression ? [expression] : [])].join('.'),
            value
        );
    }

    private getChartThemeOverridesSeriesTypeKeys(chartType: ChartType): ChartThemeOverridesSeriesType[] {
        // In the chart options API, theme overrides are categorized according to series type.
        // Depending on the chart type, theme overrides may need to be applied to multiple series types.
        const chartSeriesTypes: ChartThemeOverridesSeriesType[] = this.chartController.getChartSeriesTypes(chartType);
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }
        return chartSeriesTypes;
    }

    private retrieveChartOption<T>(chartOptions: AgChartOptions, expression: string): T | undefined {
        return get(chartOptions, expression, undefined);
    }

    private assignChartOption<T>(chartOptions: AgChartOptions, expression: string, value: T): void {
        set(chartOptions, expression, value);
    }

    private clearChartOption(chartOptions: AgChartOptions, parentExpression: string, key: string): void {
        const parentObject = get(chartOptions, parentExpression, undefined);
        if (parentObject) {
            delete parentObject[key];
        }
    }

    private raiseChartOptionsChangedEvent(): void {
        const chartModel = this.chartController.getChartModel();

        this.eventSvc.dispatchEvent({
            type: 'chartOptionsChanged',
            chartId: chartModel.chartId,
            chartType: chartModel.chartType,
            chartThemeName: this.chartController.getChartThemeName(),
            chartOptions: chartModel.chartOptions,
        });
    }
}

function isMatchingSeries(seriesType: ChartSeriesType, series: SupportedSeries): boolean {
    return isSeriesType(seriesType) && series.type === seriesType;
}
