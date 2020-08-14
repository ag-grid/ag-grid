import {
    _,
    AgDialog,
    Autowired,
    CellRange,
    ChartModel,
    ChartOptions,
    ChartType,
    Component,
    Environment,
    GridOptionsWrapper,
    IAggFunc,
    PostConstruct,
    ProcessChartOptionsParams,
    RefSelector,
    GridApi,
    ColumnApi,
    ChartCreated,
    ChartDestroyed,
    Events,
    PopupService
} from "@ag-grid-community/core";
import { ChartMenu } from "./menu/chartMenu";
import { TitleEdit } from "./titleEdit";
import { ChartController } from "./chartController";
import { ChartDataModel, ChartModelParams } from "./chartDataModel";
import { BarChartProxy } from "./chartProxies/cartesian/barChartProxy";
import { AreaChartProxy } from "./chartProxies/cartesian/areaChartProxy";
import { ChartProxy, ChartProxyParams, UpdateChartParams } from "./chartProxies/chartProxy";
import { LineChartProxy } from "./chartProxies/cartesian/lineChartProxy";
import { PieChartProxy } from "./chartProxies/polar/pieChartProxy";
import { DoughnutChartProxy } from "./chartProxies/polar/doughnutChartProxy";
import { ScatterChartProxy } from "./chartProxies/cartesian/scatterChartProxy";
import { HistogramChartProxy } from "./chartProxies/cartesian/histogramChartProxy";
import { ChartTranslator } from "./chartTranslator";
import { ChartTheme } from "ag-charts-community";

export interface GridChartParams {
    pivotChart: boolean;
    cellRange: CellRange;
    chartType: ChartType;
    chartThemeIndex: number;
    insideDialog: boolean;
    suppressChartRanges: boolean;
    aggFunc?: string | IAggFunc;
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions<any>;
}

export class GridChartComp extends Component {
    private static TEMPLATE = /* html */
        `<div class="ag-chart" tabindex="-1">
            <div ref="eChartContainer" tabindex="-1" class="ag-chart-components-wrapper">
                <div ref="eChart" class="ag-chart-canvas-wrapper"></div>
                <div ref="eEmpty" class="ag-chart-empty-text ag-unselectable"></div>
            </div>
            <div ref="eTitleEditContainer"></div>
            <div ref="eMenuContainer" class="ag-chart-docked-container"></div>
        </div>`;

    @RefSelector('eChart') private eChart: HTMLElement;
    @RefSelector('eChartContainer') private eChartContainer: HTMLElement;
    @RefSelector('eMenuContainer') private eMenuContainer: HTMLElement;
    @RefSelector('eEmpty') private eEmpty: HTMLElement;
    @RefSelector('eTitleEditContainer') private eTitleEditContainer: HTMLDivElement;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('environment') private environment: Environment;
    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('popupService') private popupService: PopupService;

    private chartMenu: ChartMenu;
    private titleEdit: TitleEdit;
    private chartDialog: AgDialog;

    private model: ChartDataModel;
    private chartController: ChartController;

    private chartProxy: ChartProxy<any, any>;
    private chartType: ChartType;

    constructor(private readonly params: GridChartParams) {
        super(GridChartComp.TEMPLATE);
        debugger;
    }

    @PostConstruct
    public init(): void {
        const modelParams: ChartModelParams = {
            pivotChart: this.params.pivotChart,
            chartType: this.params.chartType,
            chartThemeIndex: this.params.chartThemeIndex,
            aggFunc: this.params.aggFunc,
            cellRange: this.params.cellRange,
            suppressChartRanges: this.params.suppressChartRanges,
        };

        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        _.addCssClass(this.getGui(), isRtl ? 'ag-rtl' : 'ag-ltr');

        this.model = this.createBean(new ChartDataModel(modelParams));
        this.chartController = this.createManagedBean(new ChartController(this.model));

        // create chart before dialog to ensure dialog is correct size
        this.createChart();

        if (this.params.insideDialog) {
            this.addDialog();
        }

        this.addMenu();
        this.addTitleEditComp();

        this.addManagedListener(this.getGui(), 'focusin', this.setActiveChartCellRange.bind(this));
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, this.refresh.bind(this));
        this.addManagedListener(this.chartMenu, ChartMenu.EVENT_DOWNLOAD_CHART, this.downloadChart.bind(this));

        this.refresh();
        this.raiseChartCreatedEvent();
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
            chartId: this.model.getChartId(),
            chartType,
            chartThemeIndex: this.model.getChartThemeIndex(),
            processChartOptions: processChartOptionsFunc,
            getChartThemeIndex: this.getChartThemeIndex.bind(this),
            getChartThemes: this.getChartThemes.bind(this),
            allowPaletteOverride: !this.params.chartThemeIndex,
            isDarkTheme: this.environment.isThemeDark.bind(this.environment),
            parentElement: this.eChart,
            width,
            height,
            grouping: isGrouping,
            document: this.gridOptionsWrapper.getDocument(),
            eventService: this.eventService,
            gridApi: this.gridApi,
            columnApi: this.columnApi,
        };

        // set local state used to detect when chart type changes
        this.chartType = chartType;
        this.chartProxy = this.createChartProxy(chartProxyParams);
        this.titleEdit && this.titleEdit.setChartProxy(this.chartProxy);

        _.addCssClass(this.eChart.querySelector('canvas'), 'ag-charts-canvas');
        this.chartController.setChartProxy(this.chartProxy);
    }

    private getChartThemeIndex(): number {
        return this.chartController.getThemeIndex();
    }

    private getChartThemes(): ChartTheme[] {
        return this.chartController.getThemes();
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
            case ChartType.Histogram:
                return new HistogramChartProxy(chartProxyParams);
        }
    }

    private addDialog(): void {
        const title = this.chartTranslator.translate(this.params.pivotChart ? 'pivotChartTitle' : 'rangeChartTitle');

        const { width, height } = this.getBestDialogSize();

        this.chartDialog = new AgDialog({
            resizable: true,
            movable: true,
            maximizable: true,
            title,
            width,
            height,
            component: this,
            centered: true,
            closable: true
        });

        this.getContext().createBean(this.chartDialog);

        this.chartDialog.addEventListener(AgDialog.EVENT_DESTROYED, () => this.destroy());
    }

    private getBestDialogSize(): { width: number, height: number } {
        const popupParent = this.popupService.getPopupParent();
        const maxWidth = _.getAbsoluteWidth(popupParent) * 0.75;
        const maxHeight = _.getAbsoluteHeight(popupParent) * 0.75;
        const ratio = 0.553;

        {
            const { width, height } = this.chartProxy.getChartOptions();
            if (width && height) {
                return { width, height };
            }
        }

        const chart = this.chartProxy.getChart() as any;
        let width = this.params.insideDialog ? 850 : chart.width;
        let height = this.params.insideDialog ? 470 : chart.height;

        if (width > maxWidth || height > maxHeight) {
            width = Math.min(width, maxWidth);
            height = Math.round(width * ratio);

            if (height > maxHeight) {
                height = maxHeight;
                width = Math.min(width, Math.round(height / ratio));
            }
        }

        return { width, height };
    }

    private addMenu(): void {
        this.chartMenu = this.createBean(new ChartMenu(this.eChartContainer, this.eMenuContainer, this.chartController));
        this.eChartContainer.appendChild(this.chartMenu.getGui());
    }

    private addTitleEditComp(): void {
        this.titleEdit = this.createBean(new TitleEdit(this.chartMenu));
        this.eTitleEditContainer.appendChild(this.titleEdit.getGui());

        if( this.chartProxy ) {
            this.titleEdit.setChartProxy(this.chartProxy)
        }
    }

    private refresh(): void {
        debugger;
        // if (this.shouldRecreateChart()) {
            this.createChart();
        // }

        this.updateChart();
    }

    private shouldRecreateChart(): boolean {
        return this.chartType !== this.model.getChartType()
            || this.getChartThemeIndex() !== this.model.getChartThemeIndex();
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
        const container = this.chartProxy.getChart().container;
        const pivotModeDisabled = this.model.isPivotChart() && !this.model.isPivotMode();
        let minFieldsRequired = 1;

        if (this.chartController.isActiveXYChart()) {
            minFieldsRequired = this.model.getChartType() === ChartType.Bubble ? 3 : 2;
        }

        const isEmptyChart = fields.length < minFieldsRequired || data.length === 0;

        if (container) {
            const isEmpty = pivotModeDisabled || isEmptyChart;
            _.setDisplayed(this.eChart, !isEmpty);
            _.setDisplayed(this.eEmpty, isEmpty);
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
        if (!this.params.insideDialog) {
            return;
        }

        const { chartProxy, eChart } = this;

        if (this.chartMenu.isVisible()) {
            // we don't want the menu showing to affect the chart options
            const chart = this.chartProxy.getChart();

            chart.height = _.getInnerHeight(eChart);
            chart.width = _.getInnerWidth(eChart);
        } else {
            chartProxy.setChartOption('width', _.getInnerWidth(eChart));
            chartProxy.setChartOption('height', _.getInnerHeight(eChart));
        }
    }

    private setActiveChartCellRange(focusEvent: FocusEvent): void {
        if (this.getGui().contains(focusEvent.relatedTarget as HTMLElement)) {
            return;
        }

        this.chartController.setChartRange(true);
        (this.gridApi as any).focusController.clearFocusedCell();
    }

    private raiseChartCreatedEvent(): void {
        const chartModel = this.chartController.getChartModel();
        const event: ChartCreated = Object.freeze({
            type: Events.EVENT_CHART_CREATED,
            chartId: chartModel.chartId,
            chartModel,
            api: this.gridApi,
            columnApi: this.columnApi,
        });

        this.eventService.dispatchEvent(event);
    }

    private raiseChartDestroyedEvent(): void {
        const event: ChartDestroyed = Object.freeze({
            type: Events.EVENT_CHART_DESTROYED,
            chartId: this.model.getChartId(),
            api: this.gridApi,
            columnApi: this.columnApi,
        });

        this.eventService.dispatchEvent(event);
    }

    protected destroy(): void {
        super.destroy();

        if (this.chartProxy) {
            this.chartProxy.destroy();
        }

        this.destroyBean(this.chartMenu);

        // don't want to invoke destroy() on the Dialog (prevents destroy loop)
        if (this.chartDialog && this.chartDialog.isAlive()) {
            this.destroyBean(this.chartDialog);
        }

        // if the user is providing containers for the charts, we need to clean up, otherwise the old chart
        // data will still be visible although the chart is no longer bound to the grid
        const eGui = this.getGui();
        _.clearElement(eGui);
        // remove from parent, so if user provided container, we detach from the provided dom element
        _.removeFromParent(eGui);

        this.raiseChartDestroyedEvent();
    }
}
