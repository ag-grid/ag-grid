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
import { ChartController } from "../chartController";

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

        _.set(chartOptions.overrides.common, expression, value);
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
        return _.get(this.getChart().xAxis, expression, undefined) as T;
    }

    public setAxisProperty(expression: string, value: any) {
        const [chart, chartOptions] = [this.getChart(), this.getChartOptions()];

        _.set(chartOptions.xAxis, expression, value);
        _.set(chartOptions.yAxis, expression, value);

        chart.axes.forEach((axis: any) => _.set(axis, expression, value));

        // chart axis properties are not reactive, need to schedule a layout
        chart.layoutPending = true;

        this.raiseChartOptionsChangedEvent();
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