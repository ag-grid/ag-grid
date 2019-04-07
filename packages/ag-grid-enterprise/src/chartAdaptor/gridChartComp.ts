import {
    _,
    Autowired,
    ChartType,
    Component,
    Dialog,
    EventService,
    PostConstruct,
    RefSelector,
    ResizeObserverService
} from "ag-grid-community";
import {ChartOptions, GridChartFactory} from "./gridChartFactory";
import {Chart} from "../charts/chart/chart";
import {BarSeries} from "../charts/chart/series/barSeries";
import {LineSeries} from "../charts/chart/series/lineSeries";
import {PieSeries} from "../charts/chart/series/pieSeries";
import colors from "../charts/chart/colors";
import {CartesianChart} from "../charts/chart/cartesianChart";
import {PolarChart} from "../charts/chart/polarChart";
import {ChartModel} from "./rangeChart/chartModel";
import {ChartMenu} from "./menu/chartMenu";

export interface IGridChartComp {
    getChart(): Chart<any, string, number>;
}

export class GridChartComp extends Component implements IGridChartComp {

    private static TEMPLATE =
        `<div class="ag-chart" tabindex="-1">
            <div ref="eChart" class="ag-chart-canvas-wrapper"></div>
            <div ref="eErrors" class="ag-chart-errors"></div>
        </div>`;

    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('eventService') eventService: EventService;

    @RefSelector('eChart') private eChart: HTMLElement;
    @RefSelector('eErrors') private eErrors: HTMLElement;

    private readonly chartOptions: ChartOptions;
    private readonly chartModel: ChartModel;

    private chartDialog: Dialog;
    private chartMenu: ChartMenu;

    private currentChartType: ChartType;
    private chart: Chart<any, string, number>;

    constructor(chartOptions: ChartOptions, chartModel: ChartModel) {
        super(GridChartComp.TEMPLATE);

        this.chartOptions = chartOptions;
        this.chartModel = chartModel;

        this.currentChartType = chartModel.getChartType();
        this.chart = GridChartFactory.createChart(chartModel.getChartType(), chartOptions, this.eChart);
    }

    @PostConstruct
    private postConstruct(): void {
        this.addMenu();
        this.addResizeListener();
        this.addRangeListener();

        this.addDestroyableEventListener(this.chartModel, ChartModel.EVENT_CHART_MODEL_UPDATED, this.refresh.bind(this));
        this.addDestroyableEventListener(this.chartMenu, ChartMenu.EVENT_DOWNLOAD_CHART, this.downloadChart.bind(this));
        this.addDestroyableEventListener(this.chartMenu, ChartMenu.EVENT_CLOSE_CHART, this.destroy.bind(this));

        this.refresh();
    }

    private addMenu() {
        this.chartMenu = new ChartMenu(this.chartModel);
        this.getContext().wireBean(this.chartMenu);

        if (this.chartOptions.insideDialog) {
            this.chartDialog = new Dialog({
                resizable: true,
                movable: true,
                title: 'Chart',
                component: this,
                centered: true,
                closable: false
            });
            this.getContext().wireBean(this.chartDialog);
            this.chartDialog.addTitleBarButton(this.chartMenu, 0);
        } else {
            const eChart: HTMLElement = this.getGui();
            eChart.appendChild(this.chartMenu.getGui());
        }
    }

    private downloadChart() {
        this.chart.scene.download("chart");
    }

    public getChart(): Chart<any, string, number> {
        return this.chart
    }

    public refresh(): void {
        const errors = this.chartModel.getErrors();
        const eGui = this.getGui();

        const errorsExist = errors && errors.length > 0;

        _.setVisible(this.eChart, !errorsExist);
        _.setVisible(this.eErrors, errorsExist);

        if (errorsExist) {
            const html: string[] = [];

            html.push(`Could not create chart:`);
            html.push(`<ul>`);
            errors.forEach(error => html.push(`<li>${error}</li>`));
            html.push(`</ul>`);

            eGui.innerHTML = html.join('');
        } else {

            if (this.chartModel.getChartType() !== this.currentChartType) {
                this.createNewChart();
            }

            this.updateChart();
        }
    }

    public createNewChart() {
        console.log('new chart');

        // capture current chart dimensions so new chart is same size
        this.chartOptions.height = this.chart.height;
        this.chartOptions.width = this.chart.width;

        // destroy chart and remove it from DOM
        this.chart.destroy();
        _.clearElement(this.eChart);

        this.currentChartType = this.chartModel.getChartType();
        this.chart = GridChartFactory.createChart(this.chartModel.getChartType(), this.chartOptions, this.eChart);
    }

    public updateChart() {
        switch (this.chartModel.getChartType()) {
            case ChartType.GroupedBar:
                this.updateBarChart();
                break;
            case ChartType.StackedBar:
                this.updateBarChart();
                break;
            case ChartType.Line:
                this.updateLineChart();
                break;
            case ChartType.Pie:
                this.updatePieChart();
                break;
        }
    }

    private updateBarChart() {
        const data = this.chartModel.getData();
        const fields = this.chartModel.getFields();

        const barSeries = this.chart.series[0] as BarSeries<any, string, number>;
        barSeries.yFieldNames = this.chartModel.getFieldNames();
        barSeries.setDataAndFields(data, 'category', fields);
    }

    private updateLineChart() {
        const data = this.chartModel.getData();
        const fields = this.chartModel.getFields();

        const lineChart = this.chart as CartesianChart<any, string, number>;

        fields.forEach((field: string, index: number) => {
            let lineSeries = (lineChart.series as LineSeries<any, string, number>[])
                .filter(series => {
                    const lineSeries = series as LineSeries<any, string, number>;
                    return lineSeries.yField === field;
                })[0];

            if (!lineSeries) {
                lineSeries = new LineSeries<any, string, number>();
                lineSeries.lineWidth = 2;
                lineSeries.markerRadius = 3;
                lineSeries.color = colors[index % colors.length];
                lineChart.addSeries(lineSeries);
            }

            lineSeries.setDataAndFields(data, 'category', field);
        });
    }

    private updatePieChart() {
        const data = this.chartModel.getData();
        const fields = this.chartModel.getFields();

        const pieChart = this.chart as PolarChart<any, string, number>;

        const singleField = fields.length === 1;
        const thickness = singleField ? 0 : 20;
        const padding = singleField ? 0 : 10;
        let offset = 0;

        fields.forEach((field: string) => {
            let pieSeries = (pieChart.series as PieSeries<any, string, number>[])
                .filter(series => {
                    const pieSeries = series as PieSeries<any, string, number>;
                    return pieSeries.angleField === field;
                })[0];

            if (!pieSeries) {
                pieSeries = new PieSeries<any, string, number>();
                pieSeries.lineWidth = 1;
                pieSeries.calloutWidth = 1;
                pieChart.addSeries(pieSeries);
            }

            pieSeries.outerRadiusOffset = offset;
            offset -= thickness;
            pieSeries.innerRadiusOffset = offset;
            offset -= padding;

            pieSeries.setDataAndFields(data, field, 'category');
        });
    }

    private addResizeListener() {
        const eGui = this.getGui();

        const observeResize = this.resizeObserverService.observeResize(eGui, () => {
            if (!eGui || !eGui.offsetParent) {
                observeResize();
                return;
            }
            this.chart.height = _.getInnerHeight(eGui.parentElement as HTMLElement);
            this.chart.width = _.getInnerWidth(eGui.parentElement as HTMLElement);
        });
    }

    private addRangeListener() {
        if (!this.chartOptions.isRangeChart) return;

        // TODO
        // const eGui = this.getGui();
        //
        // this.addDestroyableEventListener(eGui, 'focusin', (e: FocusEvent) => {
        //     if (eGui.contains(e.relatedTarget as HTMLElement)) { return; }
        //     const ds = this.datasource as RangeChartDatasource;
        //     const rangeController = ds.rangeController;
        //     const selection = ds.getRangeSelection();
        //     const { startRow, endRow, columns } = selection;
        //
        //     rangeController.setCellRange({
        //         rowStartIndex: startRow && startRow.rowIndex,
        //         rowStartPinned: startRow && startRow.rowPinned,
        //         rowEndIndex: endRow && endRow.rowIndex,
        //         rowEndPinned: endRow && endRow.rowPinned,
        //         columns: columns
        //     });
        // });
    }

    public destroy(): void {
        super.destroy();

        if (this.chartModel) {
            this.chartModel.destroy();
        }
        if (this.chart) {
            this.chart.destroy();
        }
        if (this.chartMenu) {
            this.chartMenu.destroy();
        }
        if (this.chartDialog) {
            this.chartDialog.destroy();
        }

        // if the user is providing containers for the charts, we need to clean up, otherwise the old chart
        // data will still be visible although the chart is no longer bound to the grid
        _.clearElement(this.getGui());
    }
}