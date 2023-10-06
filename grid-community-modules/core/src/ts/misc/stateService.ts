import { ColumnModel, ColumnState, ColumnStateParams } from "../columns/columnModel";
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { CtrlsService } from "../ctrlsService";
import { Events } from "../eventKeys";
import { NewColumnsLoadedEvent } from "../events";
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
import { ServerSideRowGroupSelectionState, RowSelectionState } from "../interfaces/selectionState";
import { IExpansionService } from "../interfaces/iExpansionService";

@Bean('stateService')
export class StateService extends BeanStub {
    @Autowired('filterManager') private filterManager: FilterManager;
    @Optional('rangeService') private rangeService?: IRangeService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Optional('sideBarService') private sideBarService?: ISideBarService;
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('selectionService') private selectionService: ISelectionService;
    @Autowired('expansionService') private expansionService: IExpansionService;

    private isClientSideRowModel: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.isClientSideRowModel = this.rowModel.getType() === 'clientSide';

        const newColumnsLoadedDestroyFunc = this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, ({ source }: NewColumnsLoadedEvent) => {
            if (source === 'gridInitializing') {
                newColumnsLoadedDestroyFunc?.();
                this.setInitialStateOnColumnsInitialised();
            }
        });
        const rowCountReadyDestroyFunc = this.addManagedListener(this.eventService, Events.EVENT_ROW_COUNT_READY, () => {
            rowCountReadyDestroyFunc?.();
            this.setInitialStateOnRowCountReady();
        });
        const firstDataRenderedDestroyFunc = this.addManagedListener(this.eventService, Events.EVENT_FIRST_DATA_RENDERED, () => {
            firstDataRenderedDestroyFunc?.();
            this.setInitialStateOnFirstDataRendered();
        });
    }

    public getState(): GridState {
        return {
            ...this.getColumnState(),
            columnGroup: this.getColumnGroupState(),
            filter: this.getFilterState(),
            rangeSelection: this.getRangeSelectionState(),
            scroll: this.getScrollState(),
            sideBar: this.getSideBarState(),
            focusedCell: this.getFocusedCellState(),
            pagination: this.getPaginationState(),
            rowSelection: this.getRowSelectionState(),
            rowGroupExpansion: this.getRowGroupExpansionState()
        };
    }

    private setInitialStateOnColumnsInitialised(): void {
        const initialState = this.gridOptionsService.get('initialState') ?? {};
        const { filter: filterState } = initialState
        this.setColumnState(initialState);
        if (filterState) {
            this.setFilterState(filterState);
        }
    }

    private setInitialStateOnRowCountReady(): void {
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
    }

    private setInitialStateOnFirstDataRendered(): void {
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
        const pivotMode = this.gridOptionsService.is('pivotMode');
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
            sort: sortColumns.length ? { sortColumns } : undefined,
            rowGroup: groupColumns.length ? { groupColumns } : undefined,
            aggregation: aggregationColumns.length ? { aggregationColumns } : undefined,
            pivot: pivotColumns.length || pivotMode ? { pivotMode, pivotColumns } : undefined,
            columnPinning: leftColumns.length || rightColumns.length ? { leftColumns, rightColumns } : undefined,
            columnVisibility: hiddenColumns.length ? { hiddenColumns } : undefined,
            columnSizing: columnSizes.length ? { columnSizes } : undefined,
            columnOrder: columns.length ? { columns } : undefined
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
            sortState.sortColumns.forEach(({ colId, sort }, sortIndex) => {
                const columnState = getColumnState(colId);
                columnState.sort = sort;
                columnState.sortIndex = sortIndex;
            });
            defaultState.sort = null;
            defaultState.sortIndex = null;
        }
        if (groupState) {
            groupState.groupColumns.forEach((colId, rowGroupIndex) => {
                const columnState = getColumnState(colId);
                columnState.rowGroup = true;
                columnState.rowGroupIndex = rowGroupIndex;
            });
            defaultState.rowGroup = null;
            defaultState.rowGroupIndex = null;
        }
        if (aggregationState) {
            aggregationState.aggregationColumns.forEach(({ colId, aggFunc }) => {
                getColumnState(colId).aggFunc = aggFunc;
            });
            defaultState.aggFunc = null;
        }
        if (pivotState) {
            pivotState.pivotColumns.forEach((colId, pivotIndex) => {
                const columnState = getColumnState(colId);
                columnState.pivot = true;
                columnState.pivotIndex = pivotIndex;
            });
            defaultState.pivot = null;
            defaultState.pivotIndex = null;
            this.columnModel.setPivotMode(pivotState.pivotMode);
        }
        if (columnPinningState) {
            columnPinningState.leftColumns.forEach(colId => {
                getColumnState(colId).pinned = 'left';
            });
            columnPinningState.rightColumns.forEach(colId => {
                getColumnState(colId).pinned = 'right';
            });
            defaultState.pinned = null;
        }
        if (columnVisibilityState) {
            columnVisibilityState.hiddenColumns.forEach(colId => {
                getColumnState(colId).hide = true;
            });
            defaultState.hide = null;
        }
        if (columnSizingState) {
            columnSizingState.columnSizes.forEach(({ colId, flex, width }) => {
                const columnState = getColumnState(colId);
                columnState.flex = flex ?? null;
                columnState.width = width;
            });
            defaultState.flex = null;
        }
        const columns = columnOrderState?.columns;
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
        return openColumnGroups.length ? { openColumnGroups } : undefined;
    }

    private getFilterState(): FilterState | undefined {
        let filterModel: FilterModel | undefined = this.filterManager.getFilterModel();
        if (filterModel && Object.keys(filterModel).length === 0) {
            filterModel = undefined;
        }
        const advancedFilterModel = this.filterManager.getAdvancedFilterModel() ?? undefined;
        return filterModel || advancedFilterModel ? { filterModel, advancedFilterModel } : undefined;
    }

    private setFilterState(filterState: FilterState): void {
        const { filterModel, advancedFilterModel } = filterState;
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
        if (!this.gridOptionsService.is('enableRangeSelection')) { return; }
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
        const sideBarComp = this.sideBarService?.getSideBarComp();
        if (sideBarComp) {
            return {
                visible: sideBarComp.isDisplayed(),
                position: sideBarComp.getSideBarPosition(),
                openToolPanel: sideBarComp.openedItem()
            };
        }
        return undefined;
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
        return page ? { page } : undefined;
    }

    private setPaginationState(paginationState: PaginationState): void {
        this.paginationProxy.setPage(paginationState.page);
    }

    private getRowSelectionState(): RowSelectionState | ServerSideRowGroupSelectionState | undefined {
        const selectionState = this.selectionService.getSelectionState();
        const noSelections = !selectionState || (
            (
                (selectionState as RowSelectionState).selectAll === false ||
                    (selectionState as ServerSideRowGroupSelectionState).selectAllChildren === false
            ) && !selectionState?.toggledNodes?.length
        );
        return noSelections ? undefined : selectionState;
    }

    private setRowSelectionState(rowSelectionState: RowSelectionState | ServerSideRowGroupSelectionState): void {
        this.selectionService.setSelectionState(rowSelectionState, 'gridInitializing');
    }

    private getRowGroupExpansionState(): RowGroupExpansionState | undefined {
        const expandedRowGroups = this.expansionService.getExpandedRows();
        return expandedRowGroups.length ? {
            expandedRowGroups
        } : undefined;
    }

    private setRowGroupExpansionState(rowGroupExpansionState: RowGroupExpansionState): void {
        this.expansionService.expandRows(rowGroupExpansionState.expandedRowGroups);
    }
}
