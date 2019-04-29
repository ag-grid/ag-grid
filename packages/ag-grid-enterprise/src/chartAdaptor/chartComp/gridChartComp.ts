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
import {palettes} from "../../charts/chart/palettes";
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
    palette?: number;
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

        if (!this.chartOptions.palette) {
            this.chartOptions.palette = this.getPalette();
        }

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

        const chartOptions = {
            chartType: this.model.getChartType(),
            parentElement: this.eChart,
            width: width,
            height: height,
            showTooltips: this.chartOptions.showTooltips,
            isDarkTheme: this.isDarkTheme()
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
        barChart.xAxis.gridStyle;

        barSeries.data = data;
        barSeries.xField = categoryId;
        barSeries.yFields = fields.map(f => f.colId);
        barSeries.yFieldNames = fields.map(f => f.displayName);

        barSeries.colors = palettes[this.getPalette()];

        barSeries.tooltip = this.chartOptions.showTooltips;
        barSeries.tooltipRenderer = params => {
            const colDisplayName = fields.filter(f => f.colId === params.yField)[0].displayName;
            return `<div><b>${colDisplayName}</b>: ${params.datum[params.yField]}</div>`;
        };
    }

    private updateLineChart(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]) {
        if (fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const lineChart = this.chart as CartesianChart<any, string, number>;

        lineChart.xAxis.labelRotation = categoryId === ChartModel.DEFAULT_CATEGORY ? 0 : -90;

        const fieldIds = fields.map(f => f.colId);

        const existingSeriesMap: { [id: string]: LineSeries<any, string, number> } = {};
        lineChart.series.forEach(series => {
            const lineSeries = (series as LineSeries<any, string, number>);
            const id = lineSeries.yField as string;
            fieldIds.indexOf(id) > -1 ? existingSeriesMap[id] = lineSeries : lineChart.removeSeries(lineSeries);
        });

        fields.forEach((f: { colId: string, displayName: string }, index: number) => {
            const existingSeries = existingSeriesMap[f.colId];

            const lineSeries = existingSeries ? existingSeries : new LineSeries<any, string, number>();

            lineSeries.title = f.displayName;

            lineSeries.lineWidth = 3;
            lineSeries.markerRadius = 3;

            const colors = palettes[this.getPalette()];
            lineSeries.color = colors[index % colors.length];

            lineSeries.data = this.model.getData();
            lineSeries.xField = categoryId;
            lineSeries.yField = f.colId;

            lineSeries.tooltip = this.chartOptions.showTooltips;
            lineSeries.tooltipRenderer = params => {
                return `<div><b>${f.displayName}</b>: ${params.datum[params.yField]}</div>`;
            };

            if (!existingSeries) {
                lineChart.addSeries(lineSeries);
            }
        });
    }

    private updatePieChart(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]) {
        if (fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const pieChart = this.chart as PolarChart<any, string, number>;

        const existingSeries = pieChart.series[0] as PieSeries<any, string, number>;
        const existingSeriesId = existingSeries && existingSeries.angleField as string;

        const pieSeriesId = fields[0].colId;
        const pieSeriesName = fields[0].displayName;

        let pieSeries = existingSeries;
        if (existingSeriesId !== pieSeriesId) {
            pieChart.removeSeries(existingSeries);
            pieSeries = new PieSeries<any, string, number>();
        }

        pieSeries.title = pieSeriesName;
        pieSeries.tooltip = this.chartOptions.showTooltips;
        pieSeries.tooltipRenderer = params => {
            return `<div><b>${params.datum[params.labelField as string]}</b>: ${params.datum[params.angleField]}</div>`;
        };

        pieSeries.showInLegend = true;
        pieSeries.lineWidth = 1;
        pieSeries.calloutWidth = 1;

        pieSeries.data = data;
        pieSeries.angleField = pieSeriesId;

        pieSeries.labelField = categoryId;
        pieSeries.label = false;
        pieSeries.labelColor = this.isDarkTheme() ? 'rgb(221, 221, 221)' : 'black';

        pieSeries.colors = palettes[this.getPalette()];

        if (!existingSeries) {
            pieChart.addSeries(pieSeries)
        }
    }

    private updateDoughnutChart(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]) {
        if (fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const doughnutChart = this.chart as PolarChart<any, string, number>;
        const fieldIds = fields.map(f => f.colId);

        const existingSeriesMap: { [id: string]: PieSeries<any, string, number> } = {};
        doughnutChart.series.forEach(series => {
            const pieSeries = (series as PieSeries<any, string, number>);
            const id = pieSeries.angleField as string;
            fieldIds.indexOf(id) > -1 ? existingSeriesMap[id] = pieSeries : doughnutChart.removeSeries(pieSeries);
        });

        let offset = 0;
        fields.forEach((f: { colId: string, displayName: string }, index: number) => {
            const existingSeries = existingSeriesMap[f.colId];

            const pieSeries = existingSeries ? existingSeries : new PieSeries<any, string, number>();

            pieSeries.title = f.displayName;

            pieSeries.tooltip = this.chartOptions.showTooltips;
            pieSeries.tooltipRenderer = params => {
                return `<div><b>${params.datum[params.labelField as string]}:</b> ${params.datum[params.angleField]}</div>`;
            };

            pieSeries.showInLegend = index === 0;
            pieSeries.lineWidth = 1;
            pieSeries.calloutWidth = 1;

            pieSeries.outerRadiusOffset = offset;
            offset -= 20;
            pieSeries.innerRadiusOffset = offset;
            offset -= 20;

            pieSeries.data = data;
            pieSeries.angleField = f.colId;

            pieSeries.labelField = categoryId;
            pieSeries.label = false;


            pieSeries.labelColor = this.isDarkTheme() ? 'rgb(221, 221, 221)' : 'black';

            console.log(pieSeries.labelColor);

            pieSeries.colors = palettes[this.getPalette()];

            if (!existingSeries) {
                doughnutChart.addSeries(pieSeries)
            }
        });
    }

    private downloadChart() {
        // TODO use chart / dialog title for filename
        this.chart.scene.download("chart");
    }

    private addResizeListener() {
        const eGui = this.getGui();

        const resizeFunc = () => {
            const eParent = eGui.parentElement as HTMLElement;
            if (!eGui || !eGui.offsetParent) {
                observeResize();
                return;
            }

            this.chart.height = _.getInnerHeight(eParent);
            this.chart.width = _.getInnerWidth(eParent);
        };

        const observeResize = this.resizeObserverService.observeResize(eGui, resizeFunc, 5);
    }

    private setGridChartEditMode(focusEvent: FocusEvent) {
        if (this.getGui().contains(focusEvent.relatedTarget as HTMLElement)) {
            return;
        }
        this.chartController.setChartCellRangesInRangeController();
    }

    private getPalette(): number {
        const palette = this.model && this.model.getPalette();
        return palette ? this.model.getPalette() : this.isDarkTheme() ? 2 : 0;
    }

    private isDarkTheme(): boolean {
        const theme = this.environment.getTheme() as string;
        const el = document.querySelector(`.${theme}`);
        const background = window.getComputedStyle(el as HTMLElement).backgroundColor;
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
