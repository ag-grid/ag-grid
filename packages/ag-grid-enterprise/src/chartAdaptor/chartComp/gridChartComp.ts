import {
    _,
    Autowired,
    CellRange,
    ChartType,
    Component,
    Dialog,
    Environment,
    PostConstruct,
    RefSelector,
    ResizeObserverService
} from "ag-grid-community";
import {GridChartFactory} from "./gridChartFactory";
import {Chart} from "../../charts/chart/chart";
import {BarSeries} from "../../charts/chart/series/barSeries";
import {LineSeries} from "../../charts/chart/series/lineSeries";
import {PieSeries} from "../../charts/chart/series/pieSeries";
import {all} from "../../charts/chart/colors";
import {CartesianChart} from "../../charts/chart/cartesianChart";
import {PolarChart} from "../../charts/chart/polarChart";
import {ChartMenu} from "./menu/chartMenu";
import {ChartController} from "./chartController";
import {ChartModel} from "./chartModel";
import {Color} from "../../charts/util/color";

export interface ChartOptions {
    chartType: ChartType;
    insideDialog: boolean;
    showTooltips: boolean;
    aggregate: boolean;
    height: number;
    width: number;
}

export class GridChartComp extends Component {
    private static TEMPLATE =
        `<div class="ag-chart" tabindex="-1">
            <div ref="eChart" class="ag-chart-canvas-wrapper"></div>
        </div>`;

    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('environment') private environment: Environment;

    @RefSelector('eChart') private eChart: HTMLElement;

    private chart: Chart<any, string, number>;
    private chartMenu: ChartMenu;
    private chartDialog: Dialog;

    private model: ChartModel;
    private chartController: ChartController;

    private currentChartType: ChartType;

    private readonly chartOptions: ChartOptions;
    private readonly initialCellRanges: CellRange[];

    constructor(chartOptions: ChartOptions, cellRanges: CellRange[]) {
        super(GridChartComp.TEMPLATE);
        this.chartOptions = chartOptions;
        this.initialCellRanges = cellRanges;
    }

    @PostConstruct
    public init(): void {

        this.model = new ChartModel(this.chartOptions, this.initialCellRanges);
        this.getContext().wireBean(this.model);

        this.chartController = new ChartController(this.model);
        this.getContext().wireBean(this.chartController);

        this.createChart();

        if (this.chartOptions.insideDialog) {
            this.addDialog();
        }

        this.addMenu();
        this.addResizeListener();

        this.addDestroyableEventListener(this.getGui(), 'focusin', this.setGridChartEditMode.bind(this));
        this.addDestroyableEventListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATED, this.refresh.bind(this));
        this.addDestroyableEventListener(this.chartMenu, ChartMenu.EVENT_DOWNLOAD_CHART, this.downloadChart.bind(this));

        this.refresh();
    }

    private createChart() {
        let {width, height} = this.chartOptions;

        // destroy chart and remove it from DOM
        if (this.chart) {
            height = this.chart.height;
            width = this.chart.width;
            this.chart.destroy();
            _.clearElement(this.eChart);
        }

        const theme = this.environment.getTheme() as string;

        const chartOptions = {
            chartType: this.model.getChartType(),
            parentElement: this.eChart,
            width: width,
            height: height,
            showTooltips: this.chartOptions.showTooltips,
            isDarkTheme: this.isDarkTheme(theme)
        };

        this.chart = GridChartFactory.createChart(chartOptions);
        this.currentChartType = this.model.getChartType();
    }

    private addDialog() {
        this.chartDialog = new Dialog({
            resizable: true,
            movable: true,
            maximizable: true,
            title: '',
            component: this,
            centered: true,
            closable: true
        });
        this.getContext().wireBean(this.chartDialog);

        this.chartDialog.addEventListener(Dialog.EVENT_DESTROYED, () => this.destroy());
    }

    private addMenu() {
        this.chartMenu = new ChartMenu(this.chartController);
        this.chartMenu.setParentComponent(this);
        this.getContext().wireBean(this.chartMenu);

        const eChart: HTMLElement = this.getGui();
        eChart.appendChild(this.chartMenu.getGui());
    }

    private refresh(): void {
        if (this.model.getChartType() !== this.currentChartType) {
            this.createChart();
        }
        this.updateChart();
    }

    public getCurrentChartType(): ChartType {
        return this.currentChartType;
    }

    public updateChart() {
        const chartType = this.model.getChartType();

        const data = this.model.getData();
        const categoryId = this.model.getSelectedDimensionId();
        const fields = this.model.getSelectedColState().map(cs => {
            return {colId: cs.colId, displayName: cs.displayName};
        });

        if (chartType === ChartType.GroupedBar || chartType === ChartType.StackedBar) {
            this.updateBarChart(categoryId, fields, data);

        } else if (chartType === ChartType.Line) {
            this.updateLineChart(categoryId, fields, data);

        } else if (chartType === ChartType.Pie) {
            this.updatePieChart(categoryId, fields, data);

        } else if (chartType === ChartType.Doughnut) {
            this.updateDoughnutChart(categoryId, fields, data);
        }
    }

    private updateBarChart(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]) {
        const barSeries = this.chart.series[0] as BarSeries<any, string, number>;

        const barChart = barSeries.chart as CartesianChart<any, string, number>;

        barChart.xAxis.labelRotation = categoryId === ChartModel.DEFAULT_CATEGORY ? 0 : -90;

        barSeries.data = data;
        barSeries.xField = categoryId;
        barSeries.yFields = fields.map(f => f.colId);
        barSeries.yFieldNames = fields.map(f => f.displayName);

        barChart.xAxis.gridStyle
    }

    private updateLineChart(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]) {
        const lineChart = this.chart as CartesianChart<any, string, number>;
        lineChart.xAxis.labelRotation = categoryId === ChartModel.DEFAULT_CATEGORY ? 0 : -90;

        lineChart.removeAllSeries();

        lineChart.series = fields.map((f: {colId: string, displayName: string}, index: number)  => {
            const lineSeries = new LineSeries<any, string, number>();

            lineSeries.title = f.displayName;

            lineSeries.tooltip = this.chartOptions.showTooltips;
            lineSeries.lineWidth = 2;
            lineSeries.markerRadius = 3;
            lineSeries.color = all[0][index % all[0].length];

            lineSeries.data = this.model.getData();
            lineSeries.xField = categoryId;
            lineSeries.yField = f.colId;

            return lineSeries;
        });
    }

    private updatePieChart(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]) {
        const pieChart = this.chart as PolarChart<any, string, number>;

        pieChart.removeAllSeries();

        const pieSeries = new PieSeries<any, string, number>();

        if (fields.length > 0) {
            pieSeries.title = fields[0].displayName;

            pieSeries.tooltip = this.chartOptions.showTooltips;
            pieSeries.showInLegend = true;
            pieSeries.lineWidth = 1;
            pieSeries.calloutWidth = 1;
            pieChart.addSeries(pieSeries);

            pieSeries.data = data;
            pieSeries.angleField = fields[0].colId;

            pieSeries.labelField = categoryId;
            pieSeries.label = false;

            pieChart.series = [pieSeries];
        }
    }

    private updateDoughnutChart(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]) {
        const pieChart = this.chart as PolarChart<any, string, number>;

        pieChart.removeAllSeries();

        const thickness = 20;
        const padding = 20;

        let offset = 0;
        pieChart.series = fields.map((f: {colId: string, displayName: string}, index: number) => {
            const pieSeries = new PieSeries<any, string, number>();

            pieSeries.title = f.displayName;

            pieSeries.tooltip = this.chartOptions.showTooltips;
            pieSeries.showInLegend = index === 0;
            pieSeries.lineWidth = 1;
            pieSeries.calloutWidth = 1;
            pieChart.addSeries(pieSeries);

            pieSeries.outerRadiusOffset = offset;
            offset -= thickness;
            pieSeries.innerRadiusOffset = offset;
            offset -= padding;

            pieSeries.data = data;
            pieSeries.angleField = f.colId;

            pieSeries.labelField = categoryId;
            pieSeries.label = false;

            return pieSeries;
        });
    }

    private downloadChart() {
        // TODO use chart / dialog title for filename
        this.chart.scene.download("chart");
    }

    private addResizeListener() {
        const eGui = this.getGui();

        const observeResize = this.resizeObserverService.observeResize(eGui, () => {
            const eParent = eGui.parentElement as HTMLElement;
            if (!eGui || !eGui.offsetParent) {
                observeResize();
                return;
            }

            this.chart.height = _.getInnerHeight(eParent);
            this.chart.width = _.getInnerWidth(eParent);
        });
    }

    private setGridChartEditMode(focusEvent: FocusEvent) {
        if (this.getGui().contains(focusEvent.relatedTarget as HTMLElement)) { return; }
        this.chartController.setChartCellRangesInRangeController();
    }

    private isDarkTheme(theme: string): boolean {
        const el = document.querySelector(`.${theme}`);
        const background = window.getComputedStyle(el as HTMLElement).background;
        return Color.fromString(background as string).toHSB()[2] < 0.4;
    }

    public destroy(): void {
        super.destroy();

        if (this.chartController) {
            this.chartController.destroy();
        }
        if (this.chart) {
            this.chart.destroy();
        }
        if (this.chartMenu) {
            this.chartMenu.destroy();
        }

        // don't want to invoke destroy() on the Dialog / MessageBox (prevents destroy loop)
        if (this.chartDialog && this.chartDialog.isAlive()) {
            this.chartDialog.destroy();
        }

        // if the user is providing containers for the charts, we need to clean up, otherwise the old chart
        // data will still be visible although the chart is no longer bound to the grid
        _.clearElement(this.getGui());
    }
}