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
    Events,
    IRangeService,
    PostConstruct,
    SeriesChartType,
    WithoutGridCommon
} from "@ag-grid-community/core";
import { ChartDataModel, ColState } from "./chartDataModel";
import { ChartProxy, UpdateChartParams } from "./chartProxies/chartProxy";
import { _Theme } from "ag-charts-community";
import { ChartSeriesType, getSeriesType } from "./utils/seriesTypeMapper";

export class ChartController extends BeanStub {

    public static EVENT_CHART_UPDATED = 'chartUpdated';
    public static EVENT_CHART_MODEL_UPDATE = 'chartModelUpdate';
    public static EVENT_CHART_TYPE_CHANGED = 'chartTypeChanged';
    public static EVENT_CHART_SERIES_CHART_TYPE_CHANGED = 'chartSeriesChartTypeChanged';

    @Autowired('rangeService') private readonly rangeService: IRangeService;

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
        this.raiseChartModelUpdateEvent();
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

    public getChartUpdateParams(): UpdateChartParams {
        const selectedCols = this.getSelectedValueColState();
        const fields = selectedCols.map(c => ({ colId: c.colId, displayName: c.displayName }));
        const data = this.getChartData();
        const selectedDimension = this.getSelectedDimension();

        return {
            data,
            grouping: this.isGrouping(),
            category: {
                id: selectedDimension.colId,
                name: selectedDimension.displayName!,
                chartDataType: this.model.getChartDataType(selectedDimension.colId)
            },
            fields,
            chartId: this.getChartId(),
            getCrossFilteringContext: () => ({lastSelectedChartId: 'xxx'}), //this.params.crossFilteringContext, //TODO
            seriesChartTypes: this.getSeriesChartTypes()
        };
    }

    public getChartModel(): ChartModel {
        const modelType: ChartModelType = this.model.pivotChart ? 'pivot' : 'range';

        const seriesChartTypes = this.isComboChart() ? this.model.seriesChartTypes : undefined;

        return {
            modelType,
            chartId: this.model.chartId,
            chartType: this.model.chartType,
            chartThemeName: this.model.chartThemeName,
            chartOptions: this.chartProxy.getChartOptions(),
            chartPalette: this.chartProxy.getChartPalette(),
            cellRange: this.getCellRangeParams(),
            suppressChartRanges: this.model.suppressChartRanges,
            aggFunc: this.model.aggFunc,
            unlinkChart: this.model.unlinked,
            seriesChartTypes
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

        this.model.updateSeriesChartTypes();

        this.raiseChartModelUpdateEvent();
        this.raiseChartOptionsChangedEvent();
    }

    public setChartThemeName(chartThemeName: string): void {
        this.model.chartThemeName = chartThemeName;
        this.raiseChartModelUpdateEvent();
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
            return _Theme.getChartTheme(theme).palette;
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
            this.raiseChartModelUpdateEvent();
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

            const prevSeriesChartType = seriesChartType.chartType;
            if (chartType != null) {
                seriesChartType.chartType = chartType;
            }

            if (secondaryAxis != null) {
                seriesChartType.secondaryAxis = secondaryAxis;
            }

            // replace existing custom series types with this latest version
            this.model.savedCustomSeriesChartTypes = this.model.seriesChartTypes;

            // series chart types can be modified, i.e. column chart types should be moved to primary axis
            this.model.updateSeriesChartTypes();

            this.updateForDataChange();

            if (updateChartType) {
                // update the settings panel by raising an EVENT_CHART_TYPE_CHANGED event
                this.dispatchEvent(Object.freeze({
                    type: ChartController.EVENT_CHART_TYPE_CHANGED
                }));
            }

            if (prevSeriesChartType !== chartType) {
                // update the format panel by raising an EVENT_CHART_SERIES_CHART_TYPE_CHANGED event
                this.dispatchEvent(Object.freeze({
                    type: ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED
                }));
            }
        }
    }

    public getActiveSeriesChartTypes(): SeriesChartType[] {
        const selectedColIds = this.getSelectedValueColState().map(c => c.colId);
        return this.getSeriesChartTypes().filter(s => selectedColIds.includes(s.colId));
    }

    public getChartSeriesTypes(): ChartSeriesType[] {
        const supportedComboSeriesTypes: ChartSeriesType[] = ['line', 'column', 'area'];
        return this.isComboChart() ? supportedComboSeriesTypes : [getSeriesType(this.getChartType())];
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

    private raiseChartModelUpdateEvent(): void {
        const event = Object.freeze({
            type: ChartController.EVENT_CHART_MODEL_UPDATE
        });

        this.dispatchEvent(event);
    }

    public raiseChartUpdatedEvent(): void {
        const event = Object.freeze({
            type: ChartController.EVENT_CHART_UPDATED
        });

        this.dispatchEvent(event);
    }

    private raiseChartOptionsChangedEvent(): void {
        const {chartId, chartType} = this.getChartModel();
        const event: WithoutGridCommon<ChartOptionsChanged> = Object.freeze({
            type: Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId,
            chartType,
            chartThemeName: this.model.chartThemeName,
            chartOptions: this.chartProxy.getChartOptions()
        });

        this.eventService.dispatchEvent(event);
    }

    private raiseChartRangeSelectionChangedEvent(): void {
        const event: WithoutGridCommon<ChartRangeSelectionChanged> = Object.freeze({
            type: Events.EVENT_CHART_RANGE_SELECTION_CHANGED,
            id: this.model.chartId,
            chartId: this.model.chartId,
            cellRange: this.getCellRangeParams()
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