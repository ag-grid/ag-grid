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
    ProcessChartOptionsParams,
    ChartOptions
} from "ag-grid-community";
import { ChartMenu } from "./menu/chartMenu";
import { ChartController } from "./chartController";
import { ChartModel, ChartModelParams } from "./chartModel";
import { BarChartProxy } from "./chartProxies/barChartProxy";
import { ChartProxy, ChartProxyParams } from "./chartProxies/chartProxy";
import { LineChartProxy } from "./chartProxies/lineChartProxy";
import { PieChartProxy } from "./chartProxies/pieChartProxy";
import { DoughnutChartProxy } from "./chartProxies/doughnutChartProxy";
import { Palette, palettes } from "../../charts/chart/palettes";

export interface GridChartParams {
    cellRange: CellRange;
    chartType: ChartType;
    insideDialog: boolean;
    suppressChartRanges: boolean;
    aggregate: boolean;
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions;
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
    private chartProxy: ChartProxy;

    private readonly params: GridChartParams;

    constructor(params: GridChartParams) {
        super(GridChartComp.TEMPLATE);
        this.params = params;
    }

    @PostConstruct
    public init(): void {
        const modelParams: ChartModelParams = {
            chartType: this.params.chartType,
            aggregate: this.params.aggregate,
            cellRanges: [this.params.cellRange],
            suppressChartRanges: this.params.suppressChartRanges,
            palettes: palettes,
            activePalette: 0
        };

        this.model = new ChartModel(modelParams);
        this.getContext().wireBean(this.model);

        this.chartController = new ChartController(this.model);
        this.getContext().wireBean(this.chartController);

        this.createChart();

        if (this.params.insideDialog) {
            this.addDialog();
        }
        this.addResizeListener();

        this.addMenu();

        this.addDestroyableEventListener(this.getGui(), 'focusin', this.setActiveChartCellRange.bind(this));
        this.addDestroyableEventListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATED, this.refresh.bind(this));
        this.addDestroyableEventListener(this.chartMenu, ChartMenu.EVENT_DOWNLOAD_CHART, this.downloadChart.bind(this));

        this.refresh();
    }

    private createChart() {
        let {width, height} = this.params;

        // destroy chart and remove it from DOM
        if (this.chartProxy) {
            const chart = this.chartProxy.getChart();
            height = chart.height;
            width = chart.width;
            this.chartProxy.destroy();
            _.clearElement(this.eChart);
        }

        const processChartOptionsFunc = this.params.processChartOptions ?
            this.params.processChartOptions : this.gridOptionsWrapper.getProcessChartOptionsFunc();

        const chartProxyParams: ChartProxyParams = {
            chartType: this.model.getChartType(),
            processChartOptions: processChartOptionsFunc,
            getSelectedPalette: this.getSelectedPalette.bind(this),
            isDarkTheme: this.environment.isThemeDark.bind(this.environment),
            parentElement: this.eChart,
            width: width,
            height: height,
        };

        this.chartProxy = this.createChartProxy(chartProxyParams);

        this.currentChartType = this.model.getChartType();
    }

    private getSelectedPalette(): Palette {
        return this.model.getPalettes()[this.model.getActivePalette()];
    }

    private createChartProxy(chartOptions: ChartProxyParams): ChartProxy {
        switch (chartOptions.chartType) {
            case ChartType.GroupedBar:
                return new BarChartProxy(chartOptions);
            case ChartType.StackedBar:
                return new BarChartProxy(chartOptions);
            case ChartType.Pie:
                return new PieChartProxy(chartOptions);
            case ChartType.Doughnut:
                return new DoughnutChartProxy(chartOptions);
            case ChartType.Line:
                return new LineChartProxy(chartOptions);
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
                observeResizeFunc();
                return;
            }

            const chart = this.chartProxy.getChart();
            chart.height = _.getInnerHeight(eParent);
            chart.width = _.getInnerWidth(eParent);
        };

        const observeResizeFunc = this.resizeObserverService.observeResize(eGui, resizeFunc, 5);
    }

    private setActiveChartCellRange(focusEvent: FocusEvent) {
        if (this.getGui().contains(focusEvent.relatedTarget as HTMLElement)) {
            return;
        }
        this.chartController.setChartRange();
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
        const eGui = this.getGui();
        _.clearElement(eGui);
        // remove from parent, so if user provided container, we detach from the provided dom element
        _.removeFromParent(eGui);
    }
}