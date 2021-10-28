import {
    _,
    Autowired,
    BeanStub,
    ChartOptionsChanged, ChartType,
    ColumnApi,
    Events,
    GridApi,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartController } from "./chartController";
import { CategoryAxis, GroupedCategoryAxis, NumberAxis, TimeAxis } from "ag-charts-community";
import { getStandaloneChartType } from "./chartTypeMapper";

export class ChartOptionsService extends BeanStub {

    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('columnApi') private readonly columnApi: ColumnApi;

    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init(): void {
    }

    public getChartType(): ChartType {
        return this.chartController.getChartType();
    }

    public getChartOption<T = string>(expression: string): T {
        return _.get(this.getChart(), expression, undefined) as T;
    }

    public setChartOption<T = string>(expression: string, value: T): void {
        const [chart, chartOptions] = [this.getChart(), this.getChartOptions()];

        const optionsType = getStandaloneChartType(this.getChartType());
        const options = _.get(chartOptions.overrides, `${optionsType}`, undefined);

        // update chart options
        _.set(options, expression, value);

        // update chart
        _.set(chart, expression, value);

        this.raiseChartOptionsChangedEvent();
    }

    public getAxisProperty<T = string>(expression: string): T {
        return _.get(this.getChart().axes[0], expression, undefined) as T;
    }

    public setAxisProperty<T = string>(expression: string, value: T) {
        const chart = this.getChart();

        chart.axes.forEach((axis: any) => {
            // update axis options
            this.updateAxisOptions<T>(axis, expression, value);

            // update chart axis
            _.set(axis, expression, value)
        });

        // chart axis properties are not reactive, need to schedule a layout
        chart.layoutPending = true;

        this.raiseChartOptionsChangedEvent();
    }

    public getLabelRotation(axisType: 'xAxis' | 'yAxis'): number {
        const axis = this.getAxis(axisType);
        return _.get(axis, 'label.rotation', undefined);
    }

    public setLabelRotation(axisType: 'xAxis' | 'yAxis', value: number) {
        const expression = 'label.rotation';

        // update axis options
        const chartAxis = this.getAxis(axisType);
        this.updateAxisOptions(chartAxis, expression, value);

        // update chart
        _.set(chartAxis, expression, value);

        // chart axis properties are not reactive, need to schedule a layout
        this.getChart().layoutPending = true;

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesOption<T = string>(expression: string): T {
        return _.get(this.getChart().series[0], expression, undefined) as T;
    }

    public setSeriesOption<T = string>(expression: string, value: T): void {
        // update chart series options
        _.set(this.getSeriesOptions(), expression, value);

        // update chart
        this.getChart().series.forEach((s: any) => _.set(s, expression, value));

        this.raiseChartOptionsChangedEvent();
    }

    private getChart() {
        return this.chartController.getChartProxy().getChart();
    }

    private getChartOptions() {
        return this.chartController.getChartProxy().getChartOptions();
    }

    private getAxis(axisType: string) {
        const chart = this.getChart();

        if (!chart.axes || chart.axes.length < 1) {
            return undefined;
        }

        if (axisType === 'xAxis') {
            return (chart.axes && chart.axes[0].direction === 'x') ? chart.axes[0] : chart.axes[1];
        }
        return (chart.axes && chart.axes[1].direction === 'y') ? chart.axes[1] : chart.axes[0];
    }

    private getAxesOptions() {
        const optionsType = getStandaloneChartType(this.getChartType());
        const options = _.get(this.getChartOptions().overrides, optionsType, undefined);
        return options ? options.axes : undefined;
    }

    private getSeriesOptions() {
        const optionsType = getStandaloneChartType(this.getChartType());
        return _.get(this.getChartOptions().overrides, `${optionsType}.series.${optionsType}`, undefined);
    }

    private updateAxisOptions<T = string>(chartAxis: any, expression: string, value: T) {
        let axesOptions = this.getAxesOptions();
        if (chartAxis instanceof NumberAxis) {
            _.set(axesOptions.number, expression, value);
        } else if (chartAxis instanceof CategoryAxis) {
            _.set(axesOptions.category, expression, value);
        } else if (chartAxis instanceof TimeAxis) {
            _.set(axesOptions.time, expression, value);
        } else if (chartAxis instanceof GroupedCategoryAxis) {
            _.set(axesOptions.groupedCategory, expression, value);
        }
    }

    private raiseChartOptionsChangedEvent(): void {
        const chartModel = this.chartController.getChartModel();

        const event: ChartOptionsChanged = Object.freeze({
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartModel.chartId,
            chartType: chartModel.chartType,
            chartThemeName: chartModel.chartThemeName!,
            api: this.gridApi,
            columnApi: this.columnApi,
        });

        this.eventService.dispatchEvent(event);
    }

    protected destroy(): void {
        super.destroy();
    }
}