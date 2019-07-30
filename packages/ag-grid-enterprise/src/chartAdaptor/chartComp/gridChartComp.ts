import {
    _,
    AgDialog,
    Autowired,
    CellRange,
    ChartOptions,
    ChartType,
    Component,
    Environment,
    EventService,
    GridOptionsWrapper,
    IAggFunc,
    PostConstruct,
    ProcessChartOptionsParams,
    RefSelector,
    ResizeObserverService
} from "ag-grid-community";
import {ChartMenu} from "./menu/chartMenu";
import {ChartController} from "./chartController";
import {ChartModel, ChartModelParams} from "./chartModel";
import {BarChartProxy} from "./chartProxies/cartesian/barChartProxy";
import {AreaChartProxy} from "./chartProxies/cartesian/areaChartProxy";
import {ChartProxy, ChartProxyParams} from "./chartProxies/chartProxy";
import {LineChartProxy} from "./chartProxies/cartesian/lineChartProxy";
import {PieChartProxy} from "./chartProxies/polar/pieChartProxy";
import {DoughnutChartProxy} from "./chartProxies/polar/doughnutChartProxy";
import {ScatterChartProxy} from "./chartProxies/cartesian/scatterChartProxy";
import {Palette, palettes} from "../../charts/chart/palettes";

export interface GridChartParams {
    cellRange: CellRange;
    chartType: ChartType;
    insideDialog: boolean;
    suppressChartRanges: boolean;
    aggFunc?: string | IAggFunc,
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions;
    height: number;
    width: number;
}

export class GridChartComp extends Component {
    private static TEMPLATE =
        `<div class="ag-chart" tabindex="-1">
            <div ref="eChartComponentsWrapper" tabindex="-1" class="ag-chart-components-wrapper">
                <div ref="eChart" class="ag-chart-canvas-wrapper"></div>
            </div>
            <div ref="eDockedContainer" class="ag-chart-docked-container"></div>
        </div>`;

    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('environment') private environment: Environment;

    @RefSelector('eChartComponentsWrapper') private eChartComponentsWrapper: HTMLElement;
    @RefSelector('eChart') private eChart: HTMLElement;
    @RefSelector('eDockedContainer') private eDockedContainer: HTMLElement;

    @Autowired('eventService') private eventService: EventService;

    private chartMenu: ChartMenu;
    private chartDialog: AgDialog;

    private model: ChartModel;
    private chartController: ChartController;

    private currentChartType: ChartType;
    private chartProxy: ChartProxy<any>;

    private readonly params: GridChartParams;

    constructor(params: GridChartParams) {
        super(GridChartComp.TEMPLATE);
        this.params = params;
    }

    @PostConstruct
    public init(): void {
        const modelParams: ChartModelParams = {
            chartType: this.params.chartType,
            aggFunc: this.params.aggFunc,
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
            eventService: this.eventService
        };

        // local state used to detect when chart type changes
        this.currentChartType = this.model.getChartType();
        this.chartProxy = this.createChartProxy(chartProxyParams);

        // update chart proxy ref (used by format panel)
        this.model.setChartProxy(this.chartProxy);
    }

    private getSelectedPalette(): Palette {
        return this.model.getPalettes()[this.model.getActivePalette()];
    }

    private createChartProxy(chartOptions: ChartProxyParams): ChartProxy<any> {
        switch (chartOptions.chartType) {
            case ChartType.GroupedColumn:
            case ChartType.StackedColumn:
            case ChartType.NormalizedColumn:
            case ChartType.GroupedBar:
            case ChartType.StackedBar:
            case ChartType.NormalizedBar:
                return new BarChartProxy(chartOptions);
            case ChartType.Pie:
                return new PieChartProxy(chartOptions);
            case ChartType.Doughnut:
                return new DoughnutChartProxy(chartOptions);
            case ChartType.Area:
            case ChartType.StackedArea:
            case ChartType.NormalizedArea:
                return new AreaChartProxy(chartOptions);
            case ChartType.Line:
                return new LineChartProxy(chartOptions);
            case ChartType.Scatter:
                return new ScatterChartProxy(chartOptions);
        }
    }

    private addDialog() {
        this.chartDialog = new AgDialog({
            resizable: true,
            movable: true,
            maximizable: true,
            title: '',
            component: this,
            centered: true,
            closable: true
        });
        this.getContext().wireBean(this.chartDialog);
        const linkButton = this.createLinkButton();
        this.chartDialog.addTitleBarButton(linkButton, 0);

        this.chartDialog.addEventListener(AgDialog.EVENT_DESTROYED, () => this.destroy());
    }

    private createLinkButton(): Component {
        const button = new Component('<div style="color: #0091EA; text-align: center; font-size: 18px" title="Click to disconnect the data between the Chart and the Grid" class="active">&supdsub;</div>')
        const eGui = button.getGui();
        this.getContext().wireBean(button);

        button.addGuiEventListener('click', () => {
            const isActive = _.containsClass(eGui, 'active');
            _.addOrRemoveCssClass(eGui, 'active', !isActive);

            eGui.innerHTML = !isActive ? '&supdsub;' : '&suphsub;';
            eGui.style.color = !isActive ? '#0091EA' : '#7F8C8D';
            eGui.setAttribute('title', `Click to ${!isActive ? 'dis' : ''}connect the data between the Chart and the Grid`)
        });

        return button;
    }

    private addMenu() {
        this.chartMenu = new ChartMenu(this.chartController);
        this.chartMenu.setParentComponent(this);
        this.getContext().wireBean(this.chartMenu);

        this.eChartComponentsWrapper.appendChild(this.chartMenu.getGui());
    }

    private refresh(): void {
        if (this.model.getChartType() !== this.currentChartType) {
            this.createChart();
        }
        this.updateChart();
    }

    public getChartComponentsWrapper(): HTMLElement {
        return this.eChartComponentsWrapper;
    }

    public getDockedContainer(): HTMLElement {
        return this.eDockedContainer;
    }

    public slideDockedOut(width: number) {
        this.eDockedContainer.style.minWidth = width + 'px';
    }

    public slideDockedIn() {
        this.eDockedContainer.style.minWidth = '0';
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
        const chart = this.chartProxy.getChart();
        const fileName = chart.title ? chart.title.text : 'chart';
        chart.scene.download(fileName);
    }

    public refreshCanvasSize() {
        const eChartWrapper = this.eChart;

        const chart = this.chartProxy.getChart();
        chart.height = _.getInnerHeight(eChartWrapper);
        chart.width = _.getInnerWidth(eChartWrapper)
    }

    private addResizeListener() {
        const eGui = this.getGui();

        const resizeFunc = () => {
            if (!eGui || !eGui.offsetParent) {
                observeResizeFunc();
                return;
            }

            this.refreshCanvasSize();
        };

        const observeResizeFunc = this.resizeObserverService.observeResize(this.eChart, resizeFunc, 5);
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