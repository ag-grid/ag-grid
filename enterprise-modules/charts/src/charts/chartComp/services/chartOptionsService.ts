import { _, BeanStub, ChartOptionsChanged, ChartType, Events, WithoutGridCommon, PostConstruct } from "@ag-grid-community/core";
import { AgCartesianAxisType, AgCharts, AgChartOptions, AgPolarAxisType } from "ag-charts-community";

import { ChartController } from "../chartController";
import { ChartMenuUtils } from "../menu/chartMenuUtils";
import { AgChartActual } from "../utils/integration";
import { deepMerge, get, set } from "../utils/object";
import { ChartSeriesType, VALID_SERIES_TYPES } from "../utils/seriesTypeMapper";

type ChartAxis = NonNullable<AgChartActual['axes']>[number];
type SupportedSeries = AgChartActual['series'][number];
export class ChartOptionsService extends BeanStub {
    private readonly chartController: ChartController;

    private chartOptionMenuUtil: ChartMenuUtils;
    private axisPropertyMenuUtil: ChartMenuUtils;
    private xAxisPropertyMenuUtil: ChartMenuUtils;
    private yAxisPropertyMenuUtil: ChartMenuUtils;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private postConstruct(): void {
        this.chartOptionMenuUtil = this.createManagedBean(new ChartMenuUtils({
            getValue: (expression) => this.getChartOption(expression),
            setValue: (expression, value) => this.setChartOptions([{ expression, value }]),
            setValues: (properties) => this.setChartOptions(properties),
        }, this));
        this.axisPropertyMenuUtil = this.createManagedBean(new ChartMenuUtils({
            getValue: (expression) => this.getAxisProperty(expression),
            setValue: (expression, value) => this.setAxisProperties([{ expression, value }]),
            setValues: (properties) => this.setAxisProperties(properties),
        }, this));
        this.xAxisPropertyMenuUtil = this.createManagedBean(new ChartMenuUtils({
            getValue: (expression) => this.getCartesianAxisProperty('xAxis', expression),
            setValue: (expression, value) => this.setCartesianAxisProperties('xAxis', [{ expression, value }]),
            setValues: (properties) => this.setCartesianAxisProperties('xAxis', properties),
        }, this));
        this.yAxisPropertyMenuUtil = this.createManagedBean(new ChartMenuUtils({
            getValue: e => this.getCartesianAxisProperty('yAxis', e),
            setValue: (expression, value) => this.setCartesianAxisProperties('yAxis', [{ expression, value }]),
            setValues: (properties) => this.setCartesianAxisProperties('yAxis', properties),
        }, this));
    }

    private getChartOption<T = string>(expression: string): T {
        return get(this.getChart(), expression, undefined) as T;
    }

    private setChartOptions<T = string>(values: {expression: string, value: T}[]): void {
        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }

        // combine the options into a single merged object
        let chartOptions: AgChartOptions = {};
        for (const { expression, value } of values) {
            // we need to update chart options on each series type for combo charts
            for (const seriesType of chartSeriesTypes) {
                chartOptions = deepMerge(chartOptions, this.createChartOptions<T>({
                    seriesType,
                    expression,
                    value
                }));
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

    public awaitChartOptionUpdate(func: () => void) {
        const chart = this.chartController.getChartProxy().getChart();
        chart.waitForUpdate().then(() => func())
            .catch((e) => console.error(`AG Grid - chart update failed`, e));
    }

    private getAxisProperty<T = string>(expression: string): T {
        // Assume the property exists on the first axis
        return get(this.getChart().axes?.[0], expression, undefined);
    }

    private setAxisProperties<T = string>(properties: { expression: string, value: T }[]): void {
        const chart = this.getChart();

        // combine the options into a single merged object
        let chartOptions: AgChartOptions = {};
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

            for (const axis of relevantAxes) {
                chartOptions = deepMerge(chartOptions, this.getUpdateAxisOptions<T>(axis, null, expression, value));
            }
        }

        this.applyChartOptions(chartOptions);
    }

    private getCartesianAxisProperty<T = string | undefined>(axisType: 'xAxis' | 'yAxis', expression: string): T {
        const axis = this.getCartesianAxis(axisType);
        return get(axis, expression, undefined);
    }

    private setCartesianAxisProperties<T = string>(
        axisType: 'xAxis' | 'yAxis',
        properties: Array<{ expression: string, value: T }>,
    ): void {
        const chartAxis = this.getCartesianAxis(axisType);
        if (!chartAxis) return;

        // combine the axis options into a single merged object
        let chartOptions: AgChartOptions = {};
        for (const { expression, value } of properties) {
            chartOptions = deepMerge(
                chartOptions,
                this.getUpdateAxisOptions<T>(
                    chartAxis,
                    axisType === 'yAxis' ? ['left', 'right'] : ['bottom', 'top'],
                    expression,
                    value,
                ),
            );
        }

        this.applyChartOptions(chartOptions);
    }

    private getCartesianAxis(axisType: 'xAxis' | 'yAxis'): ChartAxis | undefined {
        const axes = this.getChartAxes();
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
        let chartOptions: AgChartOptions = {};
        for (const { expression, value } of properties) {
            chartOptions = deepMerge(chartOptions, this.createChartOptions<T>({
                seriesType,
                expression: `series.${expression}`,
                value
            }));
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

    private getUpdateAxisOptions<T = string>(
        chartAxis: ChartAxis,
        axisPositions: ('left' | 'right' | 'top' | 'bottom')[] | null,
        expression: string, value: T,
    ): AgChartOptions {
        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }

        const validAxisTypes: (AgCartesianAxisType | AgPolarAxisType)[] = ['number', 'category', 'time', 'grouped-category', 'angle-category', 'angle-number', 'radius-category', 'radius-number'];
        if (!validAxisTypes.includes(chartAxis.type)) return {};

        // combine the axis options into a single merged object with entries for each series type
        let chartOptions: AgChartOptions = {};
        for (const seriesType of chartSeriesTypes) {
            if (axisPositions) {
                for (const axisPosition of axisPositions) {
                    chartOptions = deepMerge(chartOptions, this.createChartOptions<T>({
                        seriesType,
                        expression: `axes.${chartAxis.type}.${axisPosition}.${expression}`,
                        value
                    }));
                }
            } else {
                chartOptions = deepMerge(chartOptions, this.createChartOptions<T>({
                    seriesType,
                    expression: `axes.${chartAxis.type}.${expression}`,
                    value
                }));
            }
        }

        return chartOptions;
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
        set(overrides, `${seriesType}.${expression}`, value);

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

    public getChartOptionMenuUtils(): ChartMenuUtils {
        return this.chartOptionMenuUtil;
    }

    public getAxisPropertyMenuUtils(): ChartMenuUtils {
        return this.axisPropertyMenuUtil;
    }

    public getCartesianAxisPropertyMenuUtils(axisType: 'xAxis' | 'yAxis'): ChartMenuUtils {
        switch (axisType) {
            case 'xAxis': return this.xAxisPropertyMenuUtil;
            case 'yAxis': return this.yAxisPropertyMenuUtil;
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
