import {
    _,
    BeanStub,
    ChartOptionsChanged,
    ChartType,
    Events,
    WithoutGridCommon
} from "@ag-grid-community/core";
import { AgCartesianAxisType, AgChart, AgChartOptions } from "ag-charts-community";
import { ChartController } from "../chartController";
import { AgChartActual } from "../utils/integration";
import { deepMerge } from "../utils/object";
import { ChartSeriesType, getSeriesType, VALID_SERIES_TYPES } from "../utils/seriesTypeMapper";

type ChartAxis = NonNullable<AgChartActual['axes']>[number];
type SupportedSeries = AgChartActual['series'][number];
export class ChartOptionsService extends BeanStub {
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    public getChartOption<T = string>(expression: string): T {
        // TODO: We shouldn't be reading the chart implementation directly, but right now
        // it isn't possible to either get option defaults OR retrieve themed options.
        return _.get(this.getChart(), expression, undefined) as T;
    }

    public setChartOption<T = string>(expression: string, value: T, isSilent?: boolean): void {
        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('cartesian');
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
        this.updateChart(chartOptions);

        if (!isSilent) {
            this.raiseChartOptionsChangedEvent();
        }
    }

    public awaitChartOptionUpdate(func: () => void) {
        const chart = this.chartController.getChartProxy().getChart();
        chart.waitForUpdate().then(() => func());
    }

    public getAxisProperty<T = string>(expression: string): T {
        return _.get(this.getChart().axes?.[0], expression, undefined) as T;
    }

    public setAxisProperty<T = string>(expression: string, value: T) {
        // update axis options
        const chart = this.getChart();
        let chartOptions = {};
        chart.axes?.forEach((axis: any) => {
            chartOptions = deepMerge(chartOptions, this.getUpdateAxisOptions<T>(axis, expression, value));
        });

        this.updateChart(chartOptions);
        this.raiseChartOptionsChangedEvent();
    }

    public getLabelRotation(axisType: 'xAxis' | 'yAxis'): number {
        const axis = this.getAxis(axisType);
        return _.get(axis, 'label.rotation', undefined);
    }

    public setLabelRotation(axisType: 'xAxis' | 'yAxis', value: number | undefined) {
        const chartAxis = this.getAxis(axisType);
        if (chartAxis) {
            const chartOptions = this.getUpdateAxisOptions(chartAxis, 'label.rotation', value);
            this.updateChart(chartOptions);
            this.raiseChartOptionsChangedEvent();
        }
    }

    public getSeriesOption<T = string>(expression: string, seriesType: ChartSeriesType): T {
        const series = this.getChart().series.find((s: any) => ChartOptionsService.isMatchingSeries(seriesType, s));
        return _.get(series, expression, undefined) as T;
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

    private getAxis(axisType: string): ChartAxis | undefined {
        const chart = this.getChart();
        if (!chart.axes || chart.axes.length < 1) { return undefined; }

        if (axisType === 'xAxis') {
            return (chart.axes && chart.axes[0].direction === 'x') ? chart.axes[0] : chart.axes[1];
        }
        return (chart.axes && chart.axes[1].direction === 'y') ? chart.axes[1] : chart.axes[0];
    }

    private getUpdateAxisOptions<T = string>(chartAxis: ChartAxis, expression: string, value: T): AgChartOptions {
        const seriesType = getSeriesType(this.getChartType());
        const validAxisTypes: AgCartesianAxisType[] = ['number', 'category', 'time', 'groupedCategory'];

        if (!validAxisTypes.includes(chartAxis.type)) {
            return {};
        }

        return this.createChartOptions<T>({
            seriesType,
            expression: `axes.${chartAxis.type}.${expression}`,
            value
        });
    }

    public getChartType(): ChartType {
        return this.chartController.getChartType();
    }

    private getChart() {
        return this.chartController.getChartProxy().getChart();
    }

    private updateChart(chartOptions: AgChartOptions) {
        const chartRef = this.chartController.getChartProxy().getChartRef();
        AgChart.updateDelta(chartRef, chartOptions)
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

        const event: WithoutGridCommon<ChartOptionsChanged> = Object.freeze({
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartModel.chartId,
            chartType: chartModel.chartType,
            chartThemeName: this.chartController.getChartThemeName(),
            chartOptions: chartModel.chartOptions
        });

        this.eventService.dispatchEvent(event);
    }

    private static isMatchingSeries(seriesType: ChartSeriesType, series: SupportedSeries): boolean {
        const mapTypeToImplType = (type: ChartSeriesType) => type === 'column' ? 'bar' : type;

        return VALID_SERIES_TYPES.includes(seriesType) &&
            series.type === mapTypeToImplType(seriesType);
    }

    protected destroy(): void {
        super.destroy();
    }
}