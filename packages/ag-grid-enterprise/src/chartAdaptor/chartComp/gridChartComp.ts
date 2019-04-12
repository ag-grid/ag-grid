import {
    _,
    Autowired,
    ChartType,
    Component,
    Dialog,
    PostConstruct,
    RefSelector,
    ResizeObserverService
} from "ag-grid-community";
import {GridChartFactory} from "./gridChartFactory";
import {Chart} from "../../charts/chart/chart";
import {BarSeries} from "../../charts/chart/series/barSeries";
import {LineSeries} from "../../charts/chart/series/lineSeries";
import {PieSeries} from "../../charts/chart/series/pieSeries";
import colors from "../../charts/chart/colors";
import {CartesianChart} from "../../charts/chart/cartesianChart";
import {PolarChart} from "../../charts/chart/polarChart";
import {ChartMenu} from "./menu/chartMenu";
import {ChartModel} from "./chartModel";

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
             <div ref="eErrors" class="ag-chart-errors"></div>
        </div>`;

    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;

    @RefSelector('eChart') private eChart: HTMLElement;
    @RefSelector('eErrors') private eErrors: HTMLElement;

    private readonly chartModel: ChartModel;

    private chart: Chart<any, string, number>;
    private chartDialog: Dialog;
    private chartMenu: ChartMenu;

    private currentChartType: ChartType;

    constructor(chartModel: ChartModel) {
        super(GridChartComp.TEMPLATE);
        this.chartModel = chartModel;
    }

    @PostConstruct
    public init(): void {
        this.createChart();

        if (this.chartModel.isInsideDialog()) {
            this.addDialog();
        }

        this.addMenu();
        this.addResizeListener();

        this.addDestroyableEventListener(this.getGui(), 'focusin', this.setGridChartEditMode.bind(this));

        this.addDestroyableEventListener(this.chartModel, ChartModel.EVENT_CHART_MODEL_UPDATED, this.refresh.bind(this));
        this.addDestroyableEventListener(this.chartMenu, ChartMenu.EVENT_DOWNLOAD_CHART, this.downloadChart.bind(this));

        this.refresh();
    }

    private createChart() {
        // destroy chart and remove it from DOM
        if (this.chart) {
            this.chart.destroy();
            _.clearElement(this.eChart);
        }

        const chartOptions = {
            chartType: this.chartModel.getChartType(),
            parentElement: this.eChart,
            width: this.chartModel.getWidth(),
            height: this.chartModel.getHeight(),
            showTooltips: this.chartModel.isShowTooltips()
        };

        this.chart = GridChartFactory.createChart(chartOptions);
        this.currentChartType = this.chartModel.getChartType();
    }

    private addDialog() {
        this.chartDialog = new Dialog({
            resizable: true,
            movable: true,
            title: '',
            component: this,
            centered: true,
            closable: true
        });
        this.getContext().wireBean(this.chartDialog);

        this.chartDialog.addEventListener(Dialog.EVENT_DESTROYED, () => this.destroy());
    }

    private addMenu() {
        this.chartMenu = new ChartMenu(this.chartModel);
        this.getContext().wireBean(this.chartMenu);

        const eChart: HTMLElement = this.getGui();
        eChart.appendChild(this.chartMenu.getGui());
    }

    private refresh(): void {
        const eGui = this.getGui();

        const errors = this.chartModel.getErrors();
        const errorsExist = errors && errors.length > 0;

        _.setVisible(this.eChart, !errorsExist);
        _.setVisible(this.eErrors, errorsExist);

        if (errorsExist) {
            const html: string[] = [];

            //TODO: update error styles
            html.push(`Could not create chart:`);
            html.push(`<ul>`);
            errors.forEach(error => html.push(`<li>${error}</li>`));
            html.push(`</ul>`);

            eGui.innerHTML = html.join('');
        } else {
            if (this.chartModel.getChartType() !== this.currentChartType) {
                this.createChart();
            }
            this.updateChart();
        }
    }

    public updateChart() {
        const chartType = this.chartModel.getChartType();

        if (chartType === ChartType.GroupedBar || chartType === ChartType.StackedBar) {
            this.updateBarChart();

        } else if (chartType === ChartType.Line) {
            this.updateLineChart();

        } else if (chartType === ChartType.Pie) {
            this.updatePieChart();
        }
    }

    private updateBarChart() {
        const barSeries = this.chart.series[0] as BarSeries<any, string, number>;
        barSeries.yFieldNames = this.chartModel.getFields().map(f => f.displayName);

        const categoryId = this.chartModel.getSelectedCategory();

        const barChart = barSeries.chart as CartesianChart<any, string, number>;
        barChart.xAxis.labelRotation = categoryId === ChartModel.DEFAULT_CATEGORY ? 0 : -90;

        barSeries.data = this.chartModel.getData();
        barSeries.xField = categoryId;
        barSeries.yFields = this.chartModel.getFields().map(f => f.colId);
    }

    private updateLineChart() {
        const data = this.chartModel.getData();
        const categoryId = this.chartModel.getSelectedCategory();
        const fields = this.chartModel.getFields();

        const lineChart = this.chart as CartesianChart<any, string, number>;
        lineChart.xAxis.labelRotation = categoryId === ChartModel.DEFAULT_CATEGORY ? 0 : -90;

        lineChart.removeAllSeries();

        lineChart.series = fields.map((f: {colId: string, displayName: string}, index: number)  => {
            const lineSeries = new LineSeries<any, string, number>();

            lineSeries.name = f.displayName;

            lineSeries.tooltip = this.chartModel.isShowTooltips();
            lineSeries.lineWidth = 2;
            lineSeries.markerRadius = 3;
            lineSeries.color = colors[index % colors.length];

            lineSeries.data = this.chartModel.getData();
            lineSeries.xField = categoryId;
            lineSeries.yField = f.colId;

            return lineSeries;
        });
    }

    private updatePieChart() {
        const data = this.chartModel.getData();
        const categoryId = this.chartModel.getSelectedCategory();
        const fields = this.chartModel.getFields();

        const pieChart = this.chart as PolarChart<any, string, number>;

        const singleField = fields.length === 1;
        const thickness = singleField ? 0 : 20;
        const padding = singleField ? 0 : 10;
        let offset = 0;

        pieChart.removeAllSeries();

        pieChart.series = fields.map((f: {colId: string, displayName: string}) => {
            const pieSeries = new PieSeries<any, string, number>();

            pieSeries.name = f.displayName;

            pieSeries.tooltip = this.chartModel.isShowTooltips();
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
        const eParent = eGui.parentElement as HTMLElement;

        const observeResize = this.resizeObserverService.observeResize(eGui, () => {
            if (!eGui || !eGui.offsetParent) {
                observeResize();
                return;
            }
            this.chartModel.setHeight(_.getInnerHeight(eParent));
            this.chartModel.setWidth(_.getInnerWidth(eParent));

            this.chart.height = this.chartModel.getHeight();
            this.chart.width = this.chartModel.getWidth();
        });
    }

    private setGridChartEditMode(focusEvent: FocusEvent) {
        if (this.getGui().contains(focusEvent.relatedTarget as HTMLElement)) return;
        
        this.chartModel.updateCellRange();
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

        // don't want to invoke destroy() on the Dialog / MessageBox (prevents destroy loop)
        if (this.chartDialog && this.chartDialog.isAlive()) {
            this.chartDialog.destroy();
        }

        // if the user is providing containers for the charts, we need to clean up, otherwise the old chart
        // data will still be visible although the chart is no longer bound to the grid
        _.clearElement(this.getGui());
    }
}