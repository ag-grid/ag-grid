import {
    _,
    Autowired,
    CellRange,
    ChartType,
    Component,
    Dialog,
    Environment,
    GridOptionsWrapper,
    PostConstruct,
    RefSelector,
    ResizeObserverService,
} from "ag-grid-community";
import {ChartMenu} from "./menu/chartMenu";
import {ChartController} from "./chartController";
import {ChartModel} from "./chartModel";
import {Color} from "../../charts/util/color";
import {BarChartProxy} from "./chartProxies/barChartProxy";
import {ChartProxy, CreateChartOptions} from "./chartProxies/chartProxy";
import {LineChartProxy} from "./chartProxies/lineChartProxy";
import {PolarChartProxy} from "./chartProxies/polarChartProxy";

export interface GridChartOptions {
    chartType: ChartType;
    insideDialog: boolean;
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
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('environment') private environment: Environment;

    @RefSelector('eChart') private eChart: HTMLElement;

    private chartMenu: ChartMenu;
    private chartDialog: Dialog;

    private model: ChartModel;
    private chartController: ChartController;

    private currentChartType: ChartType;

    private readonly gridChartOptions: GridChartOptions;
    private readonly initialCellRange: CellRange;
    private chartProxy: ChartProxy;

    constructor(gridChartOptions: GridChartOptions, cellRange: CellRange) {
        super(GridChartComp.TEMPLATE);
        this.gridChartOptions = gridChartOptions;
        this.initialCellRange = cellRange;
    }

    @PostConstruct
    public init(): void {
        this.model = new ChartModel(this.gridChartOptions, this.initialCellRange);
        this.getContext().wireBean(this.model);
        this.chartController = new ChartController(this.model);
        this.getContext().wireBean(this.chartController);

        this.createChart();

        if (this.gridChartOptions.insideDialog) {
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
        let {width, height} = this.gridChartOptions;

        // destroy chart and remove it from DOM
        if (this.chartProxy) {
            const chart = this.chartProxy.getChart();
            height = chart.height;
            width = chart.width;
            this.chartProxy.destroy();
            _.clearElement(this.eChart);
        }

        const chartOptions = {
            chartType: this.model.getChartType(),
            processChartOptions: this.gridOptionsWrapper.getProcessChartOptionsFunc(),
            getPalette: this.getPalette.bind(this),
            isDarkTheme: this.isDarkTheme.bind(this),
            parentElement: this.eChart,
            width: width,
            height: height,
        };

        this.chartProxy = this.createChartProxy(chartOptions);

        this.currentChartType = this.model.getChartType();
    }

    private createChartProxy(chartOptions: CreateChartOptions): ChartProxy {
        switch (chartOptions.chartType) {
            case ChartType.GroupedBar:
                return new BarChartProxy(chartOptions).create();
            case ChartType.StackedBar:
                return new BarChartProxy(chartOptions).create();
            case ChartType.Pie:
                return new PolarChartProxy(chartOptions).create();
            case ChartType.Doughnut:
                return new PolarChartProxy(chartOptions).create();
            case ChartType.Line:
                return new LineChartProxy(chartOptions).create();
        }
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
        const selectedCols = this.model.getSelectedColState();
        const fields = selectedCols.map(c => {
            return {colId: c.colId, displayName: c.displayName};
        });

        const chartUpdateParams = {
            data: this.model.getData(),
            categoryId: this.model.getSelectedDimensionId(),
            fields: fields
        };

        this.chartProxy.update(chartUpdateParams);
    }

    private downloadChart() {
        // TODO use chart / dialog title for filename
        this.chartProxy.getChart().scene.download({fileName: "chart"});
    }

    private addResizeListener() {
        const eGui = this.getGui();

        const resizeFunc = () => {
            const eParent = eGui.parentElement as HTMLElement;
            if (!eGui || !eGui.offsetParent) {
                observeResize();
                return;
            }

            const chart = this.chartProxy.getChart();
            chart.height = _.getInnerHeight(eParent);
            chart.width = _.getInnerWidth(eParent);
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
        if (this.chartProxy) {
            this.chartProxy.destroy();
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