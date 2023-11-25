import { ColumnModel, ColumnState, ColumnStateParams } from "../columns/columnModel";
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { CtrlsService } from "../ctrlsService";
import { Events } from "../eventKeys";
import { NewColumnsLoadedEvent, PaginationChangedEvent, RangeSelectionChangedEvent, StateUpdatedEvent } from "../events";
import { FilterManager } from "../filter/filterManager";
import { FocusService } from "../focusService";
import {
    AggregationColumnState,
    AggregationState,
    ColumnOrderState,
    ColumnPinningState,
    ColumnSizeState,
    ColumnSizingState,
    ColumnVisibilityState,
    FilterState,
    FocusedCellState,
    GridState,
    RowGroupState,
    PaginationState,
    PivotState,
    RangeSelectionState,
    ScrollState,
    SideBarState,
    SortState,
    ColumnGroupState,
    RowGroupExpansionState
} from "../interfaces/gridState";
import { IRangeService } from "../interfaces/IRangeService";
import { ISideBarService } from "../interfaces/iSideBar";
import { FilterModel } from "../interfaces/iFilter";
import { IRowModel } from "../interfaces/iRowModel";
import { ISelectionService } from "../interfaces/iSelectionService";
import { PaginationProxy } from "../pagination/paginationProxy";
import { SortModelItem } from "../sortController";
import { ServerSideRowGroupSelectionState, ServerSideRowSelectionState } from "../interfaces/selectionState";
import { IExpansionService } from "../interfaces/iExpansionService";
import { jsonEquals } from "../utils/generic";
import { AdvancedFilterModel } from "../interfaces/advancedFilterModel";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { debounce } from "../utils/function";

@Bean('stateService')
export class StateService extends BeanStub {
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Optional('rangeService') private readonly rangeService?: IRangeService;
    @Autowired('ctrlsService') private readonly ctrlsService: CtrlsService;
    @Optional('sideBarService') private readonly sideBarService?: ISideBarService;
    @Autowired('focusService') private readonly focusService: FocusService;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('paginationProxy') private readonly paginationProxy: PaginationProxy;
    @Autowired('rowModel') private readonly rowModel: IRowModel;
    @Autowired('selectionService') private readonly selectionService: ISelectionService;
    @Autowired('expansionService') private readonly expansionService: IExpansionService;

    private isClientSideRowModel: boolean;
    private cachedState: GridState;
    private suppressEvents = true;
    private queuedUpdateSources: Set<(keyof GridState | 'gridInitializing')> = new Set();
    private dispatchStateUpdateEventDebounced = debounce(() => this.dispatchQueuedStateUpdateEvents(), 0);

    @PostConstruct
    private postConstruct(): void {
        this.isClientSideRowModel = this.rowModel.getType() === 'clientSide';

        this.cachedState = this.gridOptionsService.get('initialState') ?? {};

        this.ctrlsService.whenReady(() => this.setupStateOnGridReady());

        const newColumnsLoadedDestroyFunc = this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, ({ source }: NewColumnsLoadedEvent) => {
            if (source === 'gridInitializing') {
                newColumnsLoadedDestroyFunc?.();
                this.setupStateOnColumnsInitialised();
            }
        });
        const rowCountReadyDestroyFunc = this.addManagedListener(this.eventService, Events.EVENT_ROW_COUNT_READY, () => {
            rowCountReadyDestroyFunc?.();
            this.setupStateOnRowCountReady();
        });
        const firstDataRenderedDestroyFunc = this.addManagedListener(this.eventService, Events.EVENT_FIRST_DATA_RENDERED, () => {
            firstDataRenderedDestroyFunc?.();
            this.setupStateOnFirstDataRendered();
            this.suppressEvents = false;
            this.dispatchStateUpdateEvent(['gridInitializing']);
        });
    }

    public getState(): GridState {
        return this.cachedState;
    }

    private setupStateOnGridReady(): void {
        // sidebar reads the initial state itself, so don't need to set

        this.updateCachedState('sideBar', this.getSideBarState());

        this.addManagedListener(this.eventService, Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED, () => this.updateCachedState('sideBar', this.getSideBarState()));
        this.addManagedListener(this.eventService, Events.EVENT_SIDE_BAR_UPDATED, () => this.updateCachedState('sideBar', this.getSideBarState()));
    }

    private setupStateOnColumnsInitialised(): void {
        const initialState = this.gridOptionsService.get('initialState') ?? {};
        const {
            filter: filterState,
            columnGroup: columnGroupState
        } = initialState;
        this.setColumnState(initialState);
        if (columnGroupState) {
            this.setColumnGroupState(columnGroupState);
        }
        const advancedFilterModel = this.gridOptionsService.get('advancedFilterModel');
        if (filterState || advancedFilterModel) {
            this.setFilterState(filterState, advancedFilterModel);
        }

        this.updateColumnState([
            'aggregation', 'columnOrder', 'columnPinning', 'columnSizing', 'columnVisibility', 'pivot', 'pivot', 'rowGroup', 'sort'
        ]);
        this.updateCachedState('columnGroup', this.getColumnGroupState());
        this.updateCachedState('filter', this.getFilterState());

        // aggregation
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, () => this.updateColumnState(['aggregation']));
        // columnOrder
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, () => this.updateColumnState(['columnOrder']));
        // columnPinning
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, () => this.updateColumnState(['columnPinning']));
        // columnSizing
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_RESIZED, () => this.updateColumnState(['columnSizing']));
        // columnVisibility
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, () => this.updateColumnState(['columnVisibility']));
        // pivot
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, () => this.updateColumnState(['pivot']));
        // pivot
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => this.updateColumnState(['pivot']));
        // rowGroup
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.updateColumnState(['rowGroup']));
        // sort
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, () => this.updateColumnState(['sort']));
        // any column
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.updateColumnState([
            'aggregation', 'columnOrder', 'columnPinning', 'columnSizing', 'columnVisibility', 'pivot', 'pivot', 'rowGroup', 'sort'
        ]));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_GROUP_OPENED, () => this.updateCachedState('columnGroup', this.getColumnGroupState()));
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, () => this.updateCachedState('filter', this.getFilterState()));
    }

    private setupStateOnRowCountReady(): void {
        const {
            rowGroupExpansion: rowGroupExpansionState,
            rowSelection: rowSelectionState,
            pagination: paginationState
        } = this.gridOptionsService.get('initialState') ?? {};
        if (rowGroupExpansionState) {
            this.setRowGroupExpansionState(rowGroupExpansionState);
        }
        if (rowSelectionState) {
            this.setRowSelectionState(rowSelectionState);
        }
        if (paginationState) {
            this.setPaginationState(paginationState);
        }

        this.updateCachedState('rowGroupExpansion', this.getRowGroupExpansionState());
        this.updateCachedState('rowSelection', this.getRowSelectionState());
        this.updateCachedState('pagination', this.getPaginationState());

        this.addManagedListener(this.eventService, Events.EVENT_ROW_GROUP_OPENED, () => this.updateCachedState('rowGroupExpansion', this.getRowGroupExpansionState()));
        this.addManagedListener(this.eventService, Events.EVENT_SELECTION_CHANGED, () => this.updateCachedState('rowSelection', this.getRowSelectionState()));
        this.addManagedListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, (event: PaginationChangedEvent) => {
            if (event.newPage || event.newPageSize) {
                this.updateCachedState('pagination', this.getPaginationState());
            }
        });
    }

    private setupStateOnFirstDataRendered(): void {
        const {
            scroll: scrollState,
            rangeSelection: rangeSelectionState,
            focusedCell: focusedCellState
        } = this.gridOptionsService.get('initialState') ?? {};
        if (focusedCellState) {
            this.setFocusedCellState(focusedCellState);
        }
        if (rangeSelectionState) {
            this.setRangeSelectionState(rangeSelectionState);
        }
        if (scrollState) {
            this.setScrollState(scrollState);
        }

        // reset sidebar as it could have updated when columns changed
        this.updateCachedState('sideBar', this.getSideBarState());
        this.updateCachedState('focusedCell', this.getFocusedCellState())
        this.updateCachedState('rangeSelection', this.getRangeSelectionState());
        this.updateCachedState('scroll', this.getScrollState());

        this.addManagedListener(this.eventService, Events.EVENT_CELL_FOCUSED, () => this.updateCachedState('focusedCell', this.getFocusedCellState()));
        this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, (event: RangeSelectionChangedEvent) => {
            if (event.finished) {
                this.updateCachedState('rangeSelection', this.getRangeSelectionState());
            }
        });
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL_END, () => this.updateCachedState('scroll', this.getScrollState()));
    }

    private getColumnState(): {
        sort?: SortState;
        rowGroup?: RowGroupState;
        aggregation?: AggregationState;
        pivot?: PivotState;
        columnPinning?: ColumnPinningState;
        columnVisibility?: ColumnVisibilityState;
        columnSizing?: ColumnSizingState;
        columnOrder?: ColumnOrderState;
    } {
        const pivotMode = this.columnModel.isPivotMode();
        const sortColumns: SortModelItem[] = [];
        const groupColumns: string[] = [];
        const aggregationColumns: AggregationColumnState[] = [];
        const pivotColumns: string[] = [];
        const leftColumns: string[] = [];
        const rightColumns: string[] = [];
        const hiddenColumns: string[] = [];
        const columnSizes: ColumnSizeState[] = [];
        const columns: string[] = [];

        const columnState = this.columnModel.getColumnState();
        for (let i = 0; i < columnState.length; i++) {
            const {
                colId,
                sort,
                sortIndex,
                rowGroup,
                rowGroupIndex,
                aggFunc,
                pivot,
                pivotIndex,
                pinned,
                hide,
                width,
                flex
            } = columnState[i];
            columns.push(colId);
            if (sort) {
                sortColumns[sortIndex ?? 0] = { colId, sort };
            }
            if (rowGroup) {
                groupColumns[rowGroupIndex ?? 0] = colId;
            }
            if (typeof aggFunc === 'string') {
                aggregationColumns.push({ colId, aggFunc });
            }
            if (pivot) {
                pivotColumns[pivotIndex ?? 0] = colId;
            }
            if (pinned) {
                (pinned === 'right' ? rightColumns : leftColumns).push(colId);
            }
            if (hide) {
                hiddenColumns.push(colId);
            }
            if (flex || width) {
                columnSizes.push({ colId, flex: flex ?? undefined, width });
            }
        }
        
        return {
            sort: sortColumns.length ? { sortModel: sortColumns } : undefined,
            rowGroup: groupColumns.length ? { groupColIds: groupColumns } : undefined,
            aggregation: aggregationColumns.length ? { aggregationModel: aggregationColumns } : undefined,
            pivot: pivotColumns.length || pivotMode ? { pivotMode, pivotColIds: pivotColumns } : undefined,
            columnPinning: leftColumns.length || rightColumns.length ? { leftColIds: leftColumns, rightColIds: rightColumns } : undefined,
            columnVisibility: hiddenColumns.length ? { hiddenColIds: hiddenColumns } : undefined,
            columnSizing: columnSizes.length ? { columnSizingModel: columnSizes } : undefined,
            columnOrder: columns.length ? { orderedColIds: columns } : undefined
        };
    }

    private setColumnState(initialState: GridState): void {
        const {
            sort: sortState,
            rowGroup: groupState,
            aggregation: aggregationState,
            pivot: pivotState,
            columnPinning: columnPinningState,
            columnVisibility: columnVisibilityState,
            columnSizing: columnSizingState,
            columnOrder: columnOrderState
        } = initialState;
        const columnStateMap: { [colId: string]: ColumnState } = {};
        const defaultState: ColumnStateParams = {};
        const getColumnState = (colId: string) => {
            let columnState = columnStateMap[colId];
            if (columnState) {
                return columnState;
            }
            columnState = { colId };
            columnStateMap[colId] = columnState;
            return columnState;
        }
        if (sortState) {
            sortState.sortModel.forEach(({ colId, sort }, sortIndex) => {
                const columnState = getColumnState(colId);
                columnState.sort = sort;
                columnState.sortIndex = sortIndex;
            });
            defaultState.sort = null;
            defaultState.sortIndex = null;
        }
        if (groupState) {
            groupState.groupColIds.forEach((colId, rowGroupIndex) => {
                const columnState = getColumnState(colId);
                columnState.rowGroup = true;
                columnState.rowGroupIndex = rowGroupIndex;
            });
            defaultState.rowGroup = null;
            defaultState.rowGroupIndex = null;
        }
        if (aggregationState) {
            aggregationState.aggregationModel.forEach(({ colId, aggFunc }) => {
                getColumnState(colId).aggFunc = aggFunc;
            });
            defaultState.aggFunc = null;
        }
        if (pivotState) {
            pivotState.pivotColIds.forEach((colId, pivotIndex) => {
                const columnState = getColumnState(colId);
                columnState.pivot = true;
                columnState.pivotIndex = pivotIndex;
            });
            defaultState.pivot = null;
            defaultState.pivotIndex = null;
            this.columnModel.setPivotMode(pivotState.pivotMode);
        }
        if (columnPinningState) {
            columnPinningState.leftColIds.forEach(colId => {
                getColumnState(colId).pinned = 'left';
            });
            columnPinningState.rightColIds.forEach(colId => {
                getColumnState(colId).pinned = 'right';
            });
            defaultState.pinned = null;
        }
        if (columnVisibilityState) {
            columnVisibilityState.hiddenColIds.forEach(colId => {
                getColumnState(colId).hide = true;
            });
            defaultState.hide = null;
        }
        if (columnSizingState) {
            columnSizingState.columnSizingModel.forEach(({ colId, flex, width }) => {
                const columnState = getColumnState(colId);
                columnState.flex = flex ?? null;
                columnState.width = width;
            });
            defaultState.flex = null;
        }
        const columns = columnOrderState?.orderedColIds;
        const applyOrder = !!columns?.length;
        const columnStates = applyOrder ? columns.map(colId => getColumnState(colId)) : Object.values(columnStateMap);

        if (columnStates.length) {
            this.columnModel.applyColumnState({
                state: columnStates,
                applyOrder,
                defaultState
            }, 'gridInitializing');
        }
    }

    private getColumnGroupState(): ColumnGroupState | undefined {
        const columnGroupState = this.columnModel.getColumnGroupState();
        const openColumnGroups: string[] = [];
        columnGroupState.forEach(({ groupId, open }) => {
            if (open) {
                openColumnGroups.push(groupId);
            }
        });
        return openColumnGroups.length ? { openColumnGroupIds: openColumnGroups } : undefined;
    }

    private setColumnGroupState(columnGroupState: ColumnGroupState): void {
        const { openColumnGroupIds: openColumnGroups } = columnGroupState;
        const openColumnGroupSet = new Set(openColumnGroups);
        const existingColumnGroupState = this.columnModel.getColumnGroupState();
        const stateItems = existingColumnGroupState.map(({ groupId }) => ({
            groupId,
            open: openColumnGroupSet.has(groupId)
        }));
        this.columnModel.setColumnGroupState(stateItems, 'gridInitializing');
    }

    private getFilterState(): FilterState | undefined {
        let filterModel: FilterModel | undefined = this.filterManager.getFilterModel();
        if (filterModel && Object.keys(filterModel).length === 0) {
            filterModel = undefined;
        }
        const advancedFilterModel = this.filterManager.getAdvancedFilterModel() ?? undefined;
        return filterModel || advancedFilterModel ? { filterModel, advancedFilterModel } : undefined;
    }

    private setFilterState(filterState?: FilterState, gridOptionAdvancedFilterModel?: AdvancedFilterModel | null): void {
        const { filterModel, advancedFilterModel } = filterState ?? { advancedFilterModel: gridOptionAdvancedFilterModel };
        if (filterModel) {
            this.filterManager.setFilterModel(filterModel, 'columnFilter');
        }
        if (advancedFilterModel) {
            this.filterManager.setAdvancedFilterModel(advancedFilterModel);
        }
    }

    private getRangeSelectionState(): RangeSelectionState | undefined {
        const cellRanges = this.rangeService?.getCellRanges().map(cellRange => {
            const { id, type, startRow, endRow, columns, startColumn } = cellRange;
            return {
                id,
                type,
                startRow,
                endRow,
                colIds: columns.map(column => column.getColId()),
                startColId: startColumn.getColId()
            }
        });
        return cellRanges?.length ? { cellRanges } : undefined;
    }

    private setRangeSelectionState(rangeSelectionState: RangeSelectionState): void {
        if (!this.gridOptionsService.get('enableRangeSelection')) { return; }
        const cellRanges = rangeSelectionState.cellRanges.map(cellRange => ({
            ...cellRange,
            columns: cellRange.colIds.map(colId => this.columnModel.getGridColumn(colId)!),
            startColumn: this.columnModel.getGridColumn(cellRange.startColId)!
        }));
        this.rangeService?.setCellRanges(cellRanges);
    }

    private getScrollState(): ScrollState | undefined {
        if (!this.isClientSideRowModel) {
            // can't restore, so don't provide
            return undefined;
        }
        const scrollFeature = this.ctrlsService.getGridBodyCtrl()?.getScrollFeature();
        const { left } = scrollFeature?.getHScrollPosition() ?? { left: 0 };
        const { top } = scrollFeature?.getVScrollPosition() ?? { top: 0 };
        return top || left ? {
            top,
            left
        } : undefined;
    }

    private setScrollState(scrollState: ScrollState): void {
        if (!this.isClientSideRowModel) { return; }
        const { top, left } = scrollState;
        this.ctrlsService.getGridBodyCtrl()?.getScrollFeature().setScrollPosition(top, left);
    }

    private getSideBarState(): SideBarState | undefined {
        return this.sideBarService?.getSideBarComp()?.getState();
    }

    private getFocusedCellState(): FocusedCellState | undefined {
        if (!this.isClientSideRowModel) {
            // can't restore, so don't provide
            return undefined;
        }
        const focusedCell = this.focusService.getFocusedCell();
        if (focusedCell) {
            const { column, rowIndex, rowPinned } = focusedCell;
            return {
                colId: column.getColId(),
                rowIndex,
                rowPinned
            };
        }
        return undefined;
    }

    private setFocusedCellState(focusedCellState: FocusedCellState): void {
        if (!this.isClientSideRowModel) { return; }
        const { colId, rowIndex, rowPinned } = focusedCellState;
        this.focusService.setFocusedCell({
            column: this.columnModel.getGridColumn(colId),
            rowIndex,
            rowPinned,
            forceBrowserFocus: true,
            preventScrollOnBrowserFocus: true
        });
    }

    private getPaginationState(): PaginationState | undefined {
        const page = this.paginationProxy.getCurrentPage();
        const pageSize = !this.gridOptionsService.get('paginationAutoPageSize')
            ? this.paginationProxy.getPageSize() : undefined;

        if (!page && !pageSize) { return; }
        return { page, pageSize }
    }

    private setPaginationState(paginationState: PaginationState): void {
        if (paginationState.pageSize && !this.gridOptionsService.get('paginationAutoPageSize')) {
            this.paginationProxy.setPageSize(paginationState.pageSize, 'initialState');
        }

        if (typeof paginationState.page === 'number') {
            this.paginationProxy.setPage(paginationState.page);
        }
    }

    private getRowSelectionState(): string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState | undefined {
        const selectionState = this.selectionService.getSelectionState();
        const noSelections = !selectionState || (
            !Array.isArray(selectionState) &&
            (
                (selectionState as ServerSideRowSelectionState).selectAll === false ||
                    (selectionState as ServerSideRowGroupSelectionState).selectAllChildren === false
            ) && !selectionState?.toggledNodes?.length
        );
        return noSelections ? undefined : selectionState;
    }

    private setRowSelectionState(rowSelectionState: string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState): void {
        this.selectionService.setSelectionState(rowSelectionState, 'gridInitializing');
    }

    private getRowGroupExpansionState(): RowGroupExpansionState | undefined {
        const expandedRowGroups = this.expansionService.getExpandedRows();
        return expandedRowGroups.length ? {
            expandedRowGroupIds: expandedRowGroups
        } : undefined;
    }

    private setRowGroupExpansionState(rowGroupExpansionState: RowGroupExpansionState): void {
        this.expansionService.expandRows(rowGroupExpansionState.expandedRowGroupIds);
    }

    private updateColumnState(features: (keyof GridState)[]): void {
        const newColumnState = this.getColumnState();
        let hasChanged = false;
        Object.entries(newColumnState).forEach(([key, value]: [keyof GridState, any]) => {
            if (!jsonEquals(value, this.cachedState[key])) {
                hasChanged = true;
            }
        });
        this.cachedState = {
            ...this.cachedState,
            ...newColumnState
        }
        if (hasChanged) {
            this.dispatchStateUpdateEvent(features);
        }
    }

    private updateCachedState<K extends keyof GridState>(key: K, value: GridState[K]): void {
        const existingValue = this.cachedState[key];
        this.cachedState = {
            ...this.cachedState,
            [key]: value
        }
        if (!jsonEquals(value, existingValue)) {
            this.dispatchStateUpdateEvent([key]);
        }
    }

    private dispatchStateUpdateEvent(sources: (keyof GridState | 'gridInitializing')[]): void {
        if (this.suppressEvents) { return; }
        sources.forEach(source => this.queuedUpdateSources.add(source));
        this.dispatchStateUpdateEventDebounced();
    }

    private dispatchQueuedStateUpdateEvents(): void {
        const sources = Array.from(this.queuedUpdateSources);
        this.queuedUpdateSources.clear();
        const event: WithoutGridCommon<StateUpdatedEvent> = {
            type: Events.EVENT_STATE_UPDATED,
            sources,
            state: this.cachedState
        }
        this.eventService.dispatchEvent(event);
    }
}
