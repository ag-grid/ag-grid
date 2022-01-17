import {
    _,
    AgChartThemePalette,
    AgEvent,
    Autowired,
    BeanStub,
    CellRange,
    CellRangeParams,
    ChartModel,
    ChartModelType,
    ChartOptionsChanged,
    ChartRangeSelectionChanged,
    ChartType,
    ColumnApi,
    Events,
    GridApi,
    IRangeService,
    PostConstruct,
    SeriesChartType
} from "@ag-grid-community/core";
import { ChartDataModel, ColState } from "./chartDataModel";
import { ChartProxy } from "./chartProxies/chartProxy";
import { getChartTheme } from "ag-charts-community";

export interface ChartModelUpdatedEvent extends AgEvent {
}

export class ChartController extends BeanStub {

    public static EVENT_CHART_UPDATED = 'chartUpdated';
    public static EVENT_CHART_TYPE_CHANGED = 'chartTypeChanged';

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
            if (event.id && event.id === this.model.chartId) {
                this.updateForRangeChange();
            }
        });

        if (this.model.unlinked) {
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
        if (this.model.unlinked) { return; }

        this.model.updateCellRanges();
        this.setChartRange();
    }

    public updateForDataChange(): void {
        if (this.model.unlinked) { return; }

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
        const modelType: ChartModelType = this.model.pivotChart ? 'pivot' : 'range';

        return {
            modelType,
            chartId: this.model.chartId,
            chartType: this.model.chartType,
            chartThemeName: this.model.chartThemeName,
            chartOptions: this.chartProxy.getChartOptions(),
            cellRange: this.getCellRangeParams(),
            suppressChartRanges: this.model.suppressChartRanges,
            aggFunc: this.model.aggFunc,
            unlinkChart: this.model.unlinked,
            seriesChartTypes: this.model.seriesChartTypes
        };
    }

    public getChartId(): string {
        return this.model.chartId;
    }

    public getChartData(): any[] {
        return this.model.chartData;
    }

    public getChartType(): ChartType {
        return this.model.chartType;
    }

    public setChartType(chartType: ChartType): void {
        this.model.chartType = chartType;

        if (this.isComboChart()) {
            this.model.updateSeriesChartTypes();
        }

        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    }

    public setChartThemeName(chartThemeName: string): void {
        this.model.chartThemeName = chartThemeName;
        this.raiseChartUpdatedEvent();
        this.raiseChartOptionsChangedEvent();
    }

    public getChartThemeName(): string {
        return this.model.chartThemeName;
    }

    public isPivotChart(): boolean {
        return this.model.pivotChart;
    }

    public isPivotMode(): boolean {
        return this.model.isPivotMode();
    }

    public isGrouping(): boolean {
        return this.model.isGrouping();
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

    public getValueColState(): ColState[] {
        return this.model.valueColState.map(this.displayNameMapper.bind(this));
    }

    public getSelectedValueColState(): { colId: string; displayName: string | null; }[] {
        return this.getValueColState().filter(cs => cs.selected);
    }

    public getDimensionColState(): ColState[] {
        return this.model.dimensionColState;
    }

    public getSelectedDimension(): ColState {
        return this.model.getSelectedDimension();
    }

    private displayNameMapper(col: ColState): ColState {
        const columnNames = this.model.columnNames[col.colId];
        col.displayName = columnNames ? columnNames.join(' - ') : this.model.getColDisplayName(col.column!);
        return col;
    }

    public getColStateForMenu(): { dimensionCols: ColState[]; valueCols: ColState[]; } {
        return { dimensionCols: this.model.dimensionColState, valueCols: this.getValueColState() };
    }

    public isDefaultCategorySelected(): boolean {
        return this.model.getSelectedDimension().colId === ChartDataModel.DEFAULT_CATEGORY;
    }

    public setChartRange(silent = false): void {
        if (this.rangeService && !this.model.suppressChartRanges && !this.model.unlinked) {
            this.rangeService.setCellRanges(this.getCellRanges());
        }

        if (!silent) {
            this.raiseChartUpdatedEvent();
        }
    }

    public detachChartRange(): void {
        // when chart is detached it won't listen to changes from the grid
        this.model.unlinked = !this.model.unlinked;

        if (this.model.unlinked) {
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
        return _.includes(['scatter', 'bubble'], this.getChartType());
    }

    public isChartLinked(): boolean {
        return !this.model.unlinked;
    }

    public customComboExists(): boolean {
        return this.model.savedCustomSeriesChartTypes && this.model.savedCustomSeriesChartTypes.length > 0;
    }

    public getSeriesChartTypes(): SeriesChartType[] {
        return this.model.seriesChartTypes;
    }

    public isComboChart(): boolean {
        return this.model.isComboChart();
    }

    public updateSeriesChartType(colId: string, chartType?: ChartType, secondaryAxis?: boolean): void {
        const seriesChartType = this.model.seriesChartTypes.find(s => s.colId === colId);
        if (seriesChartType) {

            // once a combo chart has been modified it is now a 'customCombo' chart
            const updateChartType = this.model.chartType !== 'customCombo';
            if (updateChartType) {
                this.model.chartType = 'customCombo';
            }

            if (chartType != null) {
                seriesChartType.chartType = chartType;
            }

            if (secondaryAxis != null) {
                seriesChartType.secondaryAxis = secondaryAxis;
            }

            // replace existing custom series types with this latest version
            this.model.savedCustomSeriesChartTypes = this.model.seriesChartTypes;

            this.updateForDataChange();

            if (updateChartType) {
                // update the settings panel by raising an EVENT_CHART_TYPE_CHANGED event
                this.dispatchEvent(Object.freeze({
                    type: ChartController.EVENT_CHART_TYPE_CHANGED
                }));
            }
        }
    }


    private getCellRanges(): CellRange[] {
        return [this.model.dimensionCellRange!, this.model.valueCellRange!].filter(r => r);
    }

    private getCellRangeParams(): CellRangeParams {
        const cellRanges = this.getCellRanges();
        const firstCellRange = cellRanges[0];
        const startRow = (firstCellRange && firstCellRange.startRow) || null;
        const endRow = (firstCellRange && firstCellRange.endRow) || null;

        return {
            rowStartIndex: startRow && startRow.rowIndex,
            rowStartPinned: startRow && startRow.rowPinned,
            rowEndIndex: endRow && endRow.rowIndex,
            rowEndPinned: endRow && endRow.rowPinned,
            columns: cellRanges.reduce((columns, value) => columns.concat(value.columns.map(c => c.getId())), [] as string[])
        };
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
            chartThemeName: this.model.chartThemeName,
            chartOptions: this.chartProxy.getChartOptions(),
            api: this.gridApi,
            columnApi: this.columnApi,
        });

        this.eventService.dispatchEvent(event);
    }

    private raiseChartRangeSelectionChangedEvent(): void {
        const event: ChartRangeSelectionChanged = Object.freeze({
            type: Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.chartId,
            chartId: this.model.chartId,
            cellRange: this.getCellRangeParams(),
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