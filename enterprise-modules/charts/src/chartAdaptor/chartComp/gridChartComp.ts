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
    ResizeObserverService,
    ChartModel
} from "@ag-grid-community/core";
import { ChartMenu } from "./menu/chartMenu";
import { ChartController } from "./chartController";
import { ChartDataModel, ChartModelParams } from "./chartDataModel";
import { BarChartProxy } from "./chartProxies/cartesian/barChartProxy";
import { AreaChartProxy } from "./chartProxies/cartesian/areaChartProxy";
import { ChartProxy, ChartProxyParams, UpdateChartParams } from "./chartProxies/chartProxy";
import { LineChartProxy } from "./chartProxies/cartesian/lineChartProxy";
import { PieChartProxy } from "./chartProxies/polar/pieChartProxy";
import { DoughnutChartProxy } from "./chartProxies/polar/doughnutChartProxy";
import { ScatterChartProxy } from "./chartProxies/cartesian/scatterChartProxy";
import { ChartPaletteName } from "../../charts/chart/palettes";
import { ChartTranslator } from "./chartTranslator";

export interface GridChartParams {
    pivotChart: boolean;
    cellRange: CellRange;
    chartType: ChartType;
    chartPaletteName: ChartPaletteName;
    insideDialog: boolean;
    suppressChartRanges: boolean;
    aggFunc?: string | IAggFunc;
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions<any>;
}

export class GridChartComp extends Component {
    private static TEMPLATE =
        `<div class="ag-chart" tabindex="-1">
            <div ref="eChartComponentsWrapper" tabindex="-1" class="ag-chart-components-wrapper">
                <div ref="eChart" class="ag-chart-canvas-wrapper">
                    <div ref="eEmpty" class="ag-chart-empty-text ag-unselectable"></div>
                </div>
            </div>
            <div ref="eDockedContainer" class="ag-chart-docked-container"></div>
        </div>`;

    @RefSelector('eChart') private eChart: HTMLElement;
    @RefSelector('eChartComponentsWrapper') private eChartComponentsWrapper: HTMLElement;
    @RefSelector('eDockedContainer') private eDockedContainer: HTMLElement;
    @RefSelector('eEmpty') private eEmpty: HTMLElement;

    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('environment') private environment: Environment;
    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;
    @Autowired('eventService') private eventService: EventService;

    private chartMenu: ChartMenu;
    private chartDialog: AgDialog;

    private model: ChartDataModel;
    private chartController: ChartController;

    private chartProxy: ChartProxy<any, any>;
    private chartType: ChartType;

    private readonly params: GridChartParams;

    constructor(params: GridChartParams) {
        super(GridChartComp.TEMPLATE);
        this.params = params;
    }

    @PostConstruct
    public init(): void {
        const modelParams: ChartModelParams = {
            pivotChart: this.params.pivotChart,
            chartType: this.params.chartType,
            aggFunc: this.params.aggFunc,
            cellRange: this.params.cellRange,
            suppressChartRanges: this.params.suppressChartRanges,
        };

        this.model = this.wireBean(new ChartDataModel(modelParams));
        this.chartController = this.wireBean(new ChartController(this.model, this.params.chartPaletteName));

        // create chart before dialog to ensure dialog is correct size
        this.createChart();

        if (this.params.insideDialog) {
            this.addDialog();
        }

        this.addResizeListener();
        this.addMenu();

        this.addDestroyableEventListener(this.getGui(), 'focusin', this.setActiveChartCellRange.bind(this));
        this.addDestroyableEventListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.refresh.bind(this));
        this.addDestroyableEventListener(this.chartMenu, ChartMenu.EVENT_DOWNLOAD_CHART, this.downloadChart.bind(this));

        this.refresh();
    }

    private createChart(): void {
        let width, height;

        // if chart already exists, destroy it and remove it from DOM
        if (this.chartProxy) {
            const chart = this.chartProxy.getChart();

            if (chart) {
                // preserve existing width/height
                width = chart.width;
                height = chart.height;
            }

            this.chartProxy.destroy();
        }

        const processChartOptionsFunc = this.params.processChartOptions || this.gridOptionsWrapper.getProcessChartOptionsFunc();
        const chartType = this.model.getChartType();
        const isGrouping = this.model.isGrouping();

        const chartProxyParams: ChartProxyParams = {
            chartType,
            processChartOptions: processChartOptionsFunc,
            getChartPaletteName: this.getChartPaletteName.bind(this),
            allowPaletteOverride: !this.params.chartPaletteName,
            isDarkTheme: this.environment.isThemeDark.bind(this.environment),
            parentElement: this.eChart,
            width,
            height,
            eventService: this.eventService,
            grouping: isGrouping,
            document: this.gridOptionsWrapper.getDocument()
        };

        // set local state used to detect when chart type changes
        this.chartType = chartType;
        this.chartProxy = this.createChartProxy(chartProxyParams);
        this.chartController.setChartProxy(this.chartProxy);
    }

    private getChartPaletteName(): ChartPaletteName {
        return this.chartController.getPaletteName();
    }

    private createChartProxy(chartProxyParams: ChartProxyParams): ChartProxy<any, any> {
        switch (chartProxyParams.chartType) {
            case ChartType.GroupedColumn:
            case ChartType.StackedColumn:
            case ChartType.NormalizedColumn:
            case ChartType.GroupedBar:
            case ChartType.StackedBar:
            case ChartType.NormalizedBar:
                return new BarChartProxy(chartProxyParams);
            case ChartType.Pie:
                return new PieChartProxy(chartProxyParams);
            case ChartType.Doughnut:
                return new DoughnutChartProxy(chartProxyParams);
            case ChartType.Area:
            case ChartType.StackedArea:
            case ChartType.NormalizedArea:
                return new AreaChartProxy(chartProxyParams);
            case ChartType.Line:
                return new LineChartProxy(chartProxyParams);
            case ChartType.Scatter:
            case ChartType.Bubble:
                return new ScatterChartProxy(chartProxyParams);
        }
    }

    private addDialog(): void {
        const title = this.chartTranslator.translate(this.params.pivotChart ? 'pivotChartTitle' : 'rangeChartTitle');

        this.chartDialog = new AgDialog({
            resizable: true,
            movable: true,
            maximizable: true,
            title,
            component: this,
            centered: true,
            closable: true
        });

        this.getContext().wireBean(this.chartDialog);

        this.chartDialog.addEventListener(AgDialog.EVENT_DESTROYED, () => this.destroy());
    }

    private addMenu(): void {
        this.chartMenu = new ChartMenu(this.chartController);
        this.chartMenu.setParentComponent(this);
        this.getContext().wireBean(this.chartMenu);

        this.eChartComponentsWrapper.appendChild(this.chartMenu.getGui());
    }

    private refresh(): void {
        if (this.shouldRecreateChart()) {
            this.createChart();
        }

        this.updateChart();
    }

    private shouldRecreateChart(): boolean {
        return this.chartType !== this.model.getChartType();
    }

    public getChartComponentsWrapper(): HTMLElement {
        return this.eChartComponentsWrapper;
    }

    public getDockedContainer(): HTMLElement {
        return this.eDockedContainer;
    }

    public slideDockedOut(width: number): void {
        this.eDockedContainer.style.minWidth = `${width}px`;
    }

    public slideDockedIn(): void {
        this.eDockedContainer.style.minWidth = '0';
    }

    public getCurrentChartType(): ChartType {
        return this.chartType;
    }

    public getChartModel(): ChartModel {
        return this.chartController.getChartModel();
    }

    public updateChart(): void {
        const { model, chartProxy } = this;

        const selectedCols = model.getSelectedValueColState();
        const fields = selectedCols.map(c => ({ colId: c.colId, displayName: c.displayName }));
        const data = model.getData();
        const chartEmpty = this.handleEmptyChart(data, fields);

        if (chartEmpty) {
            return;
        }

        const selectedDimension = model.getSelectedDimension();
        const chartUpdateParams: UpdateChartParams = {
            data,
            grouping: model.isGrouping(),
            category: {
                id: selectedDimension.colId,
                name: selectedDimension.displayName
            },
            fields
        };

        chartProxy.update(chartUpdateParams);
    }

    private handleEmptyChart(data: any[], fields: any[]): boolean {
        const parent = this.chartProxy.getChart().parent;
        const pivotModeDisabled = this.model.isPivotChart() && !this.model.isPivotMode();
        let minFieldsRequired = 1;

        if (this.chartController.isActiveXYChart()) {
            minFieldsRequired = this.model.getChartType() === ChartType.Bubble ? 3 : 2;
        }

        const isEmptyChart = fields.length < minFieldsRequired || data.length === 0;

        if (parent) {
            _.addOrRemoveCssClass(parent, 'ag-chart-empty', pivotModeDisabled || isEmptyChart);
        }

        if (pivotModeDisabled) {
            this.eEmpty.innerText = this.chartTranslator.translate('pivotChartRequiresPivotMode');
            return true;
        }

        if (isEmptyChart) {
            this.eEmpty.innerText = this.chartTranslator.translate('noDataToChart');
            return true;
        }

        return false;
    }

    private downloadChart(): void {
        this.chartProxy.downloadChart();
    }

    public refreshCanvasSize(): void {
        const { chartProxy, eChart } = this;

        chartProxy.setChartOption('width', _.getInnerWidth(eChart));
        chartProxy.setChartOption('height', _.getInnerHeight(eChart));
    }

    private addResizeListener(): void {
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

    private setActiveChartCellRange(focusEvent: FocusEvent): void {
        if (this.getGui().contains(focusEvent.relatedTarget as HTMLElement)) {
            return;
        }

        this.chartController.setChartRange(true);
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
