import {
    _,
    AgChartThemeOverrides,
    Autowired,
    BeanStub,
    ChartOptionsChanged,
    ChartType,
    ColumnApi,
    Events,
    GridApi,
    WithoutGridCommon
} from "@ag-grid-community/core";
import { AgChartInstance } from "ag-charts-community";
import { ChartController } from "../chartController";
import { ChartSeriesType, getSeriesType } from "../utils/seriesTypeMapper";

type ChartAxis = NonNullable<AgChartInstance['axes']>[number];
type SupportedSeries = AgChartInstance['series'][number];
export class ChartOptionsService extends BeanStub {

    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('columnApi') private readonly columnApi: ColumnApi;

    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    public getChartOption<T = string>(expression: string): T {
        return _.get(this.getChart(), expression, undefined) as T;
    }

    public setChartOption<T = string>(expression: string, value: T): void {
        const chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if(this.chartController.isComboChart()) {
            chartSeriesTypes.push('cartesian');
        }

        // we need to update chart options on each series type for combo charts
        chartSeriesTypes.forEach(optionsType => {
            // update options
            const options = _.get(this.getChartOptions(), `${optionsType}`, undefined);
            _.set(options, expression, value);
        });

        // update chart
        this.updateChart();

        this.raiseChartOptionsChangedEvent();
    }

    public getAxisProperty<T = string>(expression: string): T {
        return _.get(this.getChart().axes?.[0], expression, undefined) as T;
    }

    public setAxisProperty<T = string>(expression: string, value: T) {
        // update axis options
        const chart = this.getChart();
        chart.axes?.forEach((axis: any) => {
            this.updateAxisOptions<T>(axis, expression, value);
        });

        // update chart
        this.updateChart();

        this.raiseChartOptionsChangedEvent();
    }

    public getLabelRotation(axisType: 'xAxis' | 'yAxis'): number {
        const axis = this.getAxis(axisType);
        return _.get(axis, 'label.rotation', undefined);
    }

    public setLabelRotation(axisType: 'xAxis' | 'yAxis', value: number | undefined) {
        const chartAxis = this.getAxis(axisType);
        if (chartAxis) {
            this.updateAxisOptions(chartAxis, 'label.rotation', value);
            this.updateChart();
            this.raiseChartOptionsChangedEvent();
        }
    }

    public getSeriesOption<T = string>(expression: string, seriesType: ChartSeriesType): T {
        const series = this.getChart().series.find((s: any) => ChartOptionsService.isMatchingSeries(seriesType, s));
        return _.get(series, expression, undefined) as T;
    }

    public setSeriesOption<T = string>(expression: string, value: T, seriesType: ChartSeriesType): void {
        // update series options
        const options = this.getChartOptions();
        if (!options[seriesType]) {
            options[seriesType] = {};
        }
        _.set(options[seriesType].series, expression, value);

        // update chart
        this.updateChart();

        this.raiseChartOptionsChangedEvent();
    }

    public getPairedMode(): boolean {
        const optionsType = getSeriesType(this.getChartType());
        return _.get(this.getChartOptions(), `${optionsType}.paired`, undefined);
    }

    public setPairedMode(paired: boolean): void {
        const optionsType = getSeriesType(this.getChartType());
        const options = _.get(this.getChartOptions(), `${optionsType}`, undefined);
        _.set(options, 'paired', paired);
    }

    private getAxis(axisType: string): ChartAxis | undefined {
        const chart = this.getChart();
        if (!chart.axes || chart.axes.length < 1) { return undefined; }

        if (axisType === 'xAxis') {
            return (chart.axes && chart.axes[0].direction === 'x') ? chart.axes[0] : chart.axes[1];
        }
        return (chart.axes && chart.axes[1].direction === 'y') ? chart.axes[1] : chart.axes[0];
    }

    private updateAxisOptions<T = string>(chartAxis: ChartAxis, expression: string, value: T) {
        const optionsType = getSeriesType(this.getChartType());
        const axisOptions = this.getChartOptions()[optionsType].axes;
        if (chartAxis.type === 'number') {
            _.set(axisOptions.number, expression, value);
        } else if (chartAxis.type === 'category') {
            _.set(axisOptions.category, expression, value);
        } else if (chartAxis.type === 'time') {
            _.set(axisOptions.time, expression, value);
        } else if (chartAxis.type === 'groupedCategory') {
            _.set(axisOptions.groupedCategory, expression, value);
        }
    }

    public getChartType(): ChartType {
        return this.chartController.getChartType();
    }

    private getChart(): AgChartInstance {
        return this.chartController.getChartProxy().getChart();
    }

    private getChartOptions(): AgChartThemeOverrides {
        return this.chartController.getChartProxy().getChartOptions();
    }

    private updateChart() {
        let chartUpdateParams = this.chartController.getChartUpdateParams();
        this.chartController.getChartProxy().update(chartUpdateParams);
    }

    private raiseChartOptionsChangedEvent(): void {
        const chartModel = this.chartController.getChartModel();

        const event: WithoutGridCommon<ChartOptionsChanged> = Object.freeze({
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartModel.chartId,
            chartType: chartModel.chartType,
            chartThemeName: chartModel.chartThemeName!,
            chartOptions: chartModel.chartOptions            
        });

        this.eventService.dispatchEvent(event);
    }

    private static isMatchingSeries(seriesType: ChartSeriesType, series: SupportedSeries): boolean {
        return seriesType === 'area' && series.type === seriesType ? true :
               seriesType === 'bar' && series.type === seriesType ? true :
               seriesType === 'column' && series.type === seriesType ? true :
               seriesType === 'histogram' && series.type === seriesType ? true :
               seriesType === 'line' && series.type === seriesType ? true :
               seriesType === 'pie' && series.type === seriesType ? true :
               seriesType === 'scatter' && series.type === seriesType;
    }

    protected destroy(): void {
        super.destroy();
    }
}