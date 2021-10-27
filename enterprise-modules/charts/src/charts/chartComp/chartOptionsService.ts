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

    private getChart() {
        return this.chartController.getChartProxy().getChart();
    }

    private getChartOptions() {
        return this.chartController.getChartProxy().getChartOptions();
    }

    public getChartType(): ChartType {
        return this.chartController.getChartType();
    }

    public getChartOption<T = string>(expression: string): T {
        return _.get(this.getChart(), expression, undefined) as T;
    }

    public setChartOption(expression: string, value: any): void {
        const [chart, chartOptions] = [this.getChart(), this.getChartOptions()];

        if (_.get(chart, expression, undefined) === value) { return; }

        _.set(this.extractChartOptions(chartOptions), expression, value);
        _.set(chart, expression, value);

        this.raiseChartOptionsChangedEvent();
    }

    public getAxisProperty<T = string>(expression: string): T {
        return _.get(this.getChart().axes[0], expression, undefined) as T;
    }

    public setAxisProperty(expression: string, value: any) {
        const chart = this.getChart();

        chart.axes.forEach((axis: any) => {
            // update axis options
            this.updateAxisOption(axis, expression, value);

            // update chart
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

    public setLabelRotation(axisType: 'xAxis' | 'yAxis', value: any) {
        const expression = 'label.rotation';

        // update axis options
        const chartAxis = this.getAxis(axisType);
        this.updateAxisOption(chartAxis, expression, value);

        // update chart
        _.set(chartAxis, expression, value);

        // chart axis properties are not reactive, need to schedule a layout
        this.getChart().layoutPending = true;

        this.raiseChartOptionsChangedEvent();
    }

    public getSeriesOption<T = string>(expression: string): T {
        return _.get(this.getChart().series[0], expression, undefined) as T;
    }

    public setSeriesOption(expression: string, value: any): void {
        // update chart series options
        _.set(this.getSeriesOptions(), expression, value);

        // update chart
        this.getChart().series.forEach((s: any) => _.set(s, expression, value));

        this.raiseChartOptionsChangedEvent();
    }

    public getShadowEnabled = (): boolean => !!this.getShadowProperty('enabled');

    public getShadowProperty(property: keyof any): any {
        // const { seriesDefaults } = this.mergedThemeOverrides;
        // return seriesDefaults.shadow ? seriesDefaults.shadow[property] : '';
        return '';
    }

    public setShadowProperty(property: keyof any, value: any): void {
        // const { seriesDefaults } = this.iChartOptions;
        //
        // if (_.get(seriesDefaults.shadow, property, undefined) === value) {
        //     // option is already set to the specified value
        //     return;
        // }
        //
        // if (!seriesDefaults.shadow) {
        //     seriesDefaults.shadow = {
        //         enabled: false,
        //         blur: 0,
        //         xOffset: 0,
        //         yOffset: 0,
        //         color: 'rgba(0,0,0,0.5)'
        //     };
        // }
        //
        // seriesDefaults.shadow[property] = value;
        //
        // const series = this.getChart().series as (BarSeries | AreaSeries | PieSeries)[];
        //
        // series.forEach(s => {
        //     if (!s.shadow) {
        //         const shadow = new DropShadow();
        //         shadow.enabled = false;
        //         shadow.blur = 0;
        //         shadow.xOffset = 0;
        //         shadow.yOffset = 0;
        //         shadow.color = 'rgba(0,0,0,0.5)';
        //         s.shadow = shadow;
        //     }
        //
        //     (s.shadow as any)[property] = value;
        // });
        //
        // this.raiseChartOptionsChangedEvent();
    }

    private getAxis(axisType: string) {
        const chart = this.getChart();
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

    private updateAxisOption(chartAxis: any, expression: string, value: any) {
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

    private getSeriesOptions() {
        const optionsType = getStandaloneChartType(this.getChartType());
        const expression = `${optionsType}.series.${optionsType}`;
        return _.get(this.getChartOptions().overrides, expression, undefined);
    }

    private extractChartOptions(chartOptions: any) {
        // TODO: remove this workaround once bug in standalone themes is fixed - this won't work if users override in
        //  lower level objects such as 'bar', 'pie' etc...
        const chartType = getStandaloneChartType(this.getChartType());
        return chartType === 'pie' ? chartOptions.overrides.polar : chartOptions.overrides.cartesian;
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