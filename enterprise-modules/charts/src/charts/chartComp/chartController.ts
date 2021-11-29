import {
    _,
    AgChartThemePalette,
    AgEvent,
    Autowired,
    BeanStub,
    ChartModel,
    ChartOptionsChanged,
    ChartRangeSelectionChanged,
    ChartType,
    ColumnApi,
    Events,
    GridApi,
    IRangeService,
    PostConstruct,
} from "@ag-grid-community/core";
import { ChartDataModel, ColState } from "./chartDataModel";
import { ChartProxy } from "./chartProxies/chartProxy";
import { getChartTheme } from "ag-charts-community";
import { ChartModelType } from "@ag-grid-community/core";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export class ChartController extends BeanStub {

    public static EVENT_CHART_UPDATED = 'chartUpdated';

    @Autowired('rangeService') private readonly rangeService: IRangeService;
    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('columnApi') private readonly columnApi: ColumnApi;

    private chartProxy: ChartProxy;

    public constructor(private readonly model: ChartDataModel) {
        super();
    }

    @PostConstruct
    private init(): void {
        this.setChartRange();

        this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, event => {
            if (event.id && event.id === this.model.getChartId()) {
                this.updateForRangeChange();
            }
        });

        if (this.model.isUnlinked()) {
            if (this.rangeService) {
                this.rangeService.setCellRanges([]);
            }
        }

        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.updateForGridChange.bind(this));

        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.updateForGridChange.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_CELL_VALUE_CHANGED, this.updateForDataChange.bind(this));
    }

    public updateForGridChange(): void {
        if (this.model.isUnlinked()) { return; }

        this.model.updateCellRanges();
        this.setChartRange();
    }

    public updateForDataChange(): void {
        if (this.model.isUnlinked()) { return; }

        this.model.updateData();
        this.raiseChartUpdatedEvent();
    }

    public updateForRangeChange(): void {
        this.updateForGridChange();
        this.raiseChartRangeSelectionChangedEvent();
    }

    public updateForPanelChange(updatedCol: ColState): void {
        this.model.updateCellRanges(updatedCol);
        this.setChartRange();
        this.raiseChartRangeSelectionChangedEvent();
    }

    public getChartModel(): ChartModel {
        const modelType: ChartModelType = this.model.isPivotChart() ? 'pivot' : 'range';

        return {
            modelType,
            chartId: this.model.getChartId(),
            chartType: this.model.getChartType(),
            chartThemeName: this.getThemeName(),
            chartOptions: this.chartProxy.getChartOptions(),
            cellRange: this.model.getCellRangeParams(),
            suppressChartRanges: this.model.isSuppressChartRanges(),
            aggFunc: this.model.getAggFunc(),
            unlinkChart: this.model.isUnlinked(),
        };
    }

    public getChartType(): ChartType {
        return this.model.getChartType();
    }

    public isPivotChart(): boolean {
        return this.model.isPivotChart();
    }

    public isGrouping(): boolean {
        return this.model.isGrouping();
    }

    public getThemeName(): string {
        return this.model.getChartThemeName();
    }

    public getThemes(): string[] {
        return this.gridOptionsWrapper.getChartThemes();
    }

    public getPalettes(): AgChartThemePalette[] {
        const themeNames = this.gridOptionsWrapper.getChartThemes();

        return themeNames.map(themeName => {
            const stockTheme = this.chartProxy.isStockTheme(themeName);
            const theme = stockTheme ? themeName : this.chartProxy.lookupCustomChartTheme(themeName);
            return getChartTheme(theme).palette;
        });
    }

    public setChartType(chartType: ChartType): void {
        this.model.setChartType(chartType);
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    }

    public setChartThemeName(chartThemeName: string): void {
        this.model.setChartThemeName(chartThemeName);
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    }

    public getColStateForMenu(): { dimensionCols: ColState[]; valueCols: ColState[]; } {
        return { dimensionCols: this.model.getDimensionColState(), valueCols: this.model.getValueColState() };
    }

    public isDefaultCategorySelected(): boolean {
        return this.model.getSelectedDimension().colId === ChartDataModel.DEFAULT_CATEGORY;
    }

    public setChartRange(silent = false): void {
        if (this.rangeService && !this.model.isSuppressChartRanges() && !this.model.isUnlinked()) {
            this.rangeService.setCellRanges(this.model.getCellRanges());
        }

        if (!silent) {
            this.raiseChartUpdatedEvent();
        }
    }

    public detachChartRange(): void {
        // when chart is detached it won't listen to changes from the grid
        this.model.toggleUnlinked();

        if (this.model.isUnlinked()) {
            // remove range from grid
            if (this.rangeService) {
                this.rangeService.setCellRanges([]);
            }
        } else {
            // update chart data may have changed
            this.updateForGridChange();
        }
    }

    public setChartProxy(chartProxy: ChartProxy): void {
        this.chartProxy = chartProxy;
    }

    public getChartProxy(): ChartProxy {
        return this.chartProxy;
    }

    public isActiveXYChart(): boolean {
        return _.includes([ChartType.Scatter, ChartType.Bubble], this.getChartType());
    }

    public isChartLinked(): boolean {
        return !this.model.isUnlinked();
    }

    private raiseChartUpdatedEvent(): void {
        const event: ChartModelUpdatedEvent = Object.freeze({
            type: ChartController.EVENT_CHART_UPDATED
        });

        this.dispatchEvent(event);
    }

    private raiseChartOptionsChangedEvent(): void {
        const {chartId, chartType} = this.getChartModel();
        const event: ChartOptionsChanged = Object.freeze({
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId,
            chartType,
            chartThemeName: this.getThemeName(),
            chartOptions: this.chartProxy.getChartOptions(),
            api: this.gridApi,
            columnApi: this.columnApi,
        });

        this.eventService.dispatchEvent(event);
    }

    private raiseChartRangeSelectionChangedEvent(): void {
        const event: ChartRangeSelectionChanged = Object.freeze({
            type: Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.getChartId(),
            chartId: this.model.getChartId(),
            cellRange: this.model.getCellRangeParams(),
            api: this.gridApi,
            columnApi: this.columnApi,
        });

        this.eventService.dispatchEvent(event);
    }

    protected destroy(): void {
        super.destroy();

        if (this.rangeService) {
            this.rangeService.setCellRanges([]);
        }
    }

}