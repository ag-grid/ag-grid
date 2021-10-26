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
import { LogAxis } from "ag-charts-community/dist/cjs/chart/axis/logAxis";
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

    public setChartOption(expression: string, value: any): void {
        const [chart, chartOptions] = [this.getChart(), this.getChartOptions()];

        if (_.get(chart, expression, undefined) === value) {
            // option is already set to the specified value
            return;
        }

        _.set(chartOptions.overrides.cartesian, expression, value); //TODO
        _.set(chart, expression, value);

        this.raiseChartOptionsChangedEvent();
    }

    // public setTitleOption(property: keyof any, value: any) {
    //     if (_.get(this.iChartOptions.title, property, undefined) === value) {
    //         // option is already set to the specified value
    //         return;
    //     }
    //
    //     (this.iChartOptions.title as any)[property] = value;
    //
    //     if (!this.chart.title) {
    //         this.chart.title = {} as Caption;
    //     }
    //
    //     (this.chart.title as any)[property] = value;
    //
    //     if (property === 'text') {
    //         this.setTitleOption('enabled', _.exists(value));
    //     }
    //
    //     this.raiseChartOptionsChangedEvent();
    // }


    public setTitleOption(expression: string, value: any): void {
        const [chart, chartOptions] = [this.getChart(), this.getChartOptions()];
        if (_.get(chart, expression, undefined) === value) {
            // option is already set to the specified value
            return;
        }

        _.set(chartOptions.overrides.common, expression, value);
        _.set(chart, expression, value);

        this.raiseChartOptionsChangedEvent();
    }

    public getTitleOption(expression: string) {
        return _.get(this.getChart(), expression, undefined);
    }

    public getAxisProperty<T = string>(expression: string): T {
        return _.get(this.getChart().axes[0], expression, undefined) as T;
    }

    public setAxisProperty(expression: string, value: any) {
        const chart = this.getChart();

        chart.axes.forEach((axis: any) => {
            // update axis options
            this.updateAxisOptions(axis, expression, value);

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
        this.updateAxisOptions(chartAxis, expression, value);

        // update chart
        _.set(chartAxis, expression, value);

        // chart axis properties are not reactive, need to schedule a layout
        this.getChart().layoutPending = true;

        this.raiseChartOptionsChangedEvent();
    }

    private updateAxisOptions(chartAxis: any, expression: string, value: any) {
        const chartOptions = this.getChartOptions();
        let axesOptions = this.getAxesObject(chartOptions);
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

    private getAxesObject(chartOptions: any) {
        const optionsType = getStandaloneChartType(this.getChartType());
        if (optionsType === 'bar') {
            return chartOptions.overrides.bar.axes;
        } else if (optionsType === 'column') {
            return chartOptions.overrides.column.axes;
        } else if (optionsType === 'line') {
            return chartOptions.overrides.line.axes;
        } else if (optionsType === 'scatter') {
            return chartOptions.overrides.scatter.axes;
        } else if (optionsType === 'histogram') {
            return chartOptions.overrides.histogram.axes;
        }
    }

    private getAxis(axisType: string) {
        const chart = this.getChart();
        if (axisType === 'xAxis') {
            return chart.axes[0].direction === 'x' ? chart.axes[0] : chart.axes[1];
        }
        return chart.axes[1].direction === 'y' ? chart.axes[1] : chart.axes[0];
    }

    public getSeriesOption<T = string>(expression: string): T {
        // return _.get(this.options.seriesDefaults, expression, undefined) as T;
        return undefined!;
    }

    public setSeriesOption(expression: string, value: any): void {
        // if (_.get(this.options.seriesDefaults, expression, undefined) === value) {
        //     // option is already set to the specified value
        //     return;
        // }
        //
        // _.set(this.options.seriesDefaults, expression, value);
        //
        // const mappings: { [key: string]: string; } = {
        //     'stroke.width': 'strokeWidth',
        //     'stroke.opacity': 'strokeOpacity',
        //     'fill.opacity': 'fillOpacity',
        // };
        //
        // const series = this.chart.series;
        // series.forEach(s => _.set(s, mappings[expression] || expression, value));
        //
        // this.raiseChartOptionsChangedEvent();
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

    public raiseChartOptionsChangedEvent(): void {
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

    private getChart() {
        return this.chartController.getChartProxy().getChart();
    }

    private getChartOptions() {
        return this.chartController.getChartProxy().getChartOptions();
    }

    protected destroy(): void {
        super.destroy();
    }
}