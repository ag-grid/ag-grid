import { _debounce, _jsonEquals } from 'ag-stack';

import { _getColGroupState, _setColGroupState } from '../../columns/columnGroups/columnGroupState';
import type { ColumnState, ColumnStateParams } from '../../columns/columnStateUtils';
import { _applyColumnState, _getColumnState } from '../../columns/columnStateUtils';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { FilterChangedEventSourceType } from '../../events';
import { _isCellSelectionEnabled, _isClientSideRowModel } from '../../gridOptionsUtils';
import type { CellRange } from '../../interfaces/IRangeService';
import type {
    AggregationState,
    CellSelectionState,
    ColumnGroupState,
    ColumnOrderState,
    ColumnPinningState,
    ColumnSizingState,
    ColumnVisibilityState,
    FilterState,
    FocusedCellState,
    GridState,
    GridStateKey,
    PaginationState,
    PivotState,
    RowGroupState,
    RowPinningState,
    ScrollState,
    SideBarState,
    SortState,
} from '../../interfaces/gridState';
import type { RowGroupBulkExpansionState, RowGroupExpansionState } from '../../interfaces/iExpansionService';
import type { FilterModel } from '../../interfaces/iFilter';
import type { ServerSideRowGroupSelectionState, ServerSideRowSelectionState } from '../../interfaces/selectionState';
import { migrateGridStateModel } from './stateModelMigration';
import { _convertColumnGroupState, convertColumnState } from './stateUtils';

export class StateService extends BeanStub implements NamedBean {
    beanName = 'stateSvc' as const;

    private updateRowGroupExpansionStateTimer: ReturnType<typeof setTimeout> | number = 0;

    private isClientSideRowModel: boolean;
    private cachedState: GridState;
    private suppressEvents = true;
    private readonly queuedUpdateSources: Set<keyof GridState | 'gridInitializing' | 'api'> = new Set();
    private readonly dispatchStateUpdateEventDebounced = _debounce(
        this,
        () => this.dispatchQueuedStateUpdateEvents(),
        0
    );
    // If user is doing a manual expand all node by node, we don't want to process one at a time.
    // EVENT_ROW_GROUP_OPENED is already async, so no impact of making the state async here.
    private readonly onRowGroupOpenedDebounced = _debounce(this, () => this.updateGroupExpansionState(), 0);
    // similar to row expansion, want to debounce. However, selection is synchronous, so need to mark as stale in case `getState` is called.
    private readonly onRowSelectedDebounced = _debounce(
        this,
        () => {
            this.staleStateKeys.delete('rowSelection');
            this.updateCachedState('rowSelection', this.getRowSelectionState());
        },
        0
    );
    private columnStates?: ColumnState[];
    private columnGroupStates?: { groupId: string; open: boolean | undefined }[];
    /** Filter state held back until firstDataRendered, when pivot result columns exist. */
    private deferredFilterState?: FilterState;
    private readonly staleStateKeys: Set<keyof GridState> = new Set();

    public postConstruct(): void {
        const { gos, ctrlsSvc, colDelayRenderSvc } = this.beans;
        this.isClientSideRowModel = _isClientSideRowModel(gos);

        const initialState = migrateGridStateModel(gos.get('initialState') ?? {});
        const partialColumnState = initialState.partialColumnState;
        delete initialState.partialColumnState;
        this.cachedState = initialState;

        const suppressEventsAndDispatchInitEvent = this.suppressEventsAndDispatchInitEvent.bind(this);

        ctrlsSvc.whenReady(this, () =>
            suppressEventsAndDispatchInitEvent(() => this.setupStateOnGridReady(initialState))
        );

        // if there is column state then we hide the columns until the state is applied
        if (
            initialState.columnOrder ||
            initialState.columnVisibility ||
            initialState.columnSizing ||
            initialState.columnPinning ||
            initialState.columnGroup
        ) {
            colDelayRenderSvc?.hideColumns('columnState');
        }

        const [newColumnsLoadedDestroyFunc, rowCountReadyDestroyFunc, firstDataRenderedDestroyFunc] =
            this.addManagedEventListeners({
                newColumnsLoaded: ({ source }) => {
                    if (source === 'gridInitializing') {
                        newColumnsLoadedDestroyFunc();
                        suppressEventsAndDispatchInitEvent(() => {
                            this.setupStateOnColumnsInitialised(initialState, !!partialColumnState);
                            colDelayRenderSvc?.revealColumns('columnState');
                        });
                    }
                },
                rowCountReady: () => {
                    rowCountReadyDestroyFunc?.();
                    suppressEventsAndDispatchInitEvent(() => this.setupStateOnRowCountReady(initialState));
                },
                firstDataRendered: () => {
                    firstDataRenderedDestroyFunc?.();
                    suppressEventsAndDispatchInitEvent(() => this.setupStateOnFirstDataRendered(initialState));
                },
            });
    }

    public override destroy(): void {
        super.destroy();

        // Release memory
        clearTimeout(this.updateRowGroupExpansionStateTimer);
        this.queuedUpdateSources.clear();
    }

    public getState(): GridState {
        if (this.staleStateKeys.size) {
            this.refreshStaleState();
        }
        return this.cachedState;
    }

    public setState(providedState: GridState, propertiesToIgnore?: GridStateKey[]): void {
        const state = migrateGridStateModel(providedState);
        delete state.partialColumnState;
        this.cachedState = state;

        this.startSuppressEvents();

        const source = 'api';

        const ignoreSet = propertiesToIgnore ? new Set(propertiesToIgnore) : undefined;

        this.setGridReadyState(state, source, ignoreSet);

        this.setColumnsInitialisedState(state, source, !!ignoreSet, ignoreSet);

        this.setRowCountState(state, source, ignoreSet);

        setTimeout(() => {
            if (this.isAlive()) {
                this.setFirstDataRenderedState(state, source, ignoreSet);
            }
            this.stopSuppressEvents(source);
        });
    }

    private setGridReadyState(
        state: GridState,
        source: 'gridInitializing' | 'api',
        ignoreSet?: Set<GridStateKey>
    ): void {
        // sidebar reads the initial state itself, so don't need to set on init
        if (source === 'api' && !ignoreSet?.has('sideBar')) {
            this.beans.sideBar?.comp?.setState(state.sideBar);
        }
        this.updateCachedState('sideBar', this.getSideBarState());
    }

    private setupStateOnGridReady(initialState: GridState): void {
        this.setGridReadyState(initialState, 'gridInitializing');

        const stateUpdater = () => this.updateCachedState('sideBar', this.getSideBarState());
        this.addManagedEventListeners({
            toolPanelVisibleChanged: stateUpdater,
            sideBarUpdated: stateUpdater,
        });
    }

    private updateColumnAndGroupState(): void {
        this.updateColumnState([
            'aggregation',
            'columnOrder',
            'columnPinning',
            'columnSizing',
            'columnVisibility',
            'pivot',
            'rowGroup',
            'sort',
        ]);
        this.updateCachedState('columnGroup', this.getColumnGroupState());
    }

    private setColumnsInitialisedState(
        state: GridState,
        source: 'gridInitializing' | 'api',
        partialColumnState: boolean,
        ignoreSet?: Set<GridStateKey>
    ): void {
        this.applyColumnGridState(state, source, partialColumnState, ignoreSet);
        this.setColumnGroupState(state, source, ignoreSet);

        this.updateColumnAndGroupState();
    }

    private setupStateOnColumnsInitialised(initialState: GridState, partialColumnState: boolean): void {
        this.setColumnsInitialisedState(initialState, 'gridInitializing', partialColumnState);

        const onUpdate = (state: keyof GridState) => () => this.updateColumnState([state]);
        this.addManagedEventListeners({
            columnValueChanged: onUpdate('aggregation'),
            columnMoved: onUpdate('columnOrder'),
            columnPinned: onUpdate('columnPinning'),
            columnResized: onUpdate('columnSizing'),
            columnVisible: onUpdate('columnVisibility'),
            columnPivotChanged: onUpdate('pivot'),
            columnPivotModeChanged: onUpdate('pivot'),
            columnRowGroupChanged: onUpdate('rowGroup'),
            sortChanged: onUpdate('sort'),
            newColumnsLoaded: ({ source }) => {
                this.updateColumnAndGroupState();
                // When setGridOption('columnDefs') changes row groups, columnRowGroupChanged fires
                // while changeEventsDispatching=true, so CSRM defers its re-group to newColumnsLoaded.
                // Re-read expansion state here so the cache reflects the post-re-group node IDs.
                if (source !== 'gridInitializing' && this.isClientSideRowModel) {
                    this.onRowGroupOpenedDebounced();
                }
            },
            columnGroupOpened: () => this.updateCachedState('columnGroup', this.getColumnGroupState()),
        });
    }

    private setRowCountState(
        state: GridState,
        source: 'gridInitializing' | 'api',
        ignoreSet?: Set<GridStateKey>
    ): void {
        const {
            filter: filterState,
            rowGroupExpansion: rowGroupExpansionState,
            ssrmRowGroupExpansion,
            rowSelection: rowSelectionState,
            pagination: paginationState,
            rowPinning,
        } = state;
        const shouldSetState = <TKey extends GridStateKey>(prop: TKey, propState: GridState[TKey]) =>
            !ignoreSet?.has(prop) && (propState || source === 'api');

        if (shouldSetState('filter', filterState)) {
            this.setFilterStateDeferringPivot(filterState, source);
        }
        if (
            shouldSetState('rowGroupExpansion', rowGroupExpansionState) ||
            shouldSetState('ssrmRowGroupExpansion', ssrmRowGroupExpansion)
        ) {
            this.setRowGroupExpansionState(ssrmRowGroupExpansion, rowGroupExpansionState, source);
        }
        if (shouldSetState('rowSelection', rowSelectionState)) {
            this.setRowSelectionState(rowSelectionState, source);
        }
        if (shouldSetState('pagination', paginationState)) {
            this.setPaginationState(paginationState, source);
        }
        if (shouldSetState('rowPinning', rowPinning)) {
            this.setRowPinningState(rowPinning);
        }

        const updateCachedState = this.updateCachedState.bind(this);
        updateCachedState('filter', this.getFilterState());
        this.updateGroupExpansionState();

        updateCachedState('rowSelection', this.getRowSelectionState());
        updateCachedState('pagination', this.getPaginationState());
    }

    private setupStateOnRowCountReady(initialState: GridState): void {
        this.setRowCountState(initialState, 'gridInitializing');

        const updateCachedState = this.updateCachedState.bind(this);
        const updateRowGroupExpansionState = () => {
            this.updateRowGroupExpansionStateTimer = 0;
            this.updateGroupExpansionState();
        };
        const updateFilterState = () => updateCachedState('filter', this.getFilterState());

        const { gos, colFilter, selectableFilter } = this.beans;
        this.addManagedEventListeners({
            filterChanged: updateFilterState,
            rowExpansionStateChanged: this.onRowGroupOpenedDebounced,
            expandOrCollapseAll: updateRowGroupExpansionState,
            // `groupDefaultExpanded`/`isGroupOpenByDefault` updates expansion state without an expansion event
            columnRowGroupChanged: updateRowGroupExpansionState,
            rowDataUpdated: () => {
                if (gos.get('groupDefaultExpanded') !== 0 || gos.get('isGroupOpenByDefault')) {
                    // once rows are loaded, they may be expanded, start the timer only once
                    this.updateRowGroupExpansionStateTimer ||= setTimeout(updateRowGroupExpansionState);
                }
            },
            selectionChanged: () => {
                this.staleStateKeys.add('rowSelection');
                this.onRowSelectedDebounced();
            },
            paginationChanged: (event) => {
                if (event.newPage || event.newPageSize) {
                    updateCachedState('pagination', this.getPaginationState());
                }
            },
            pinnedRowsChanged: () => updateCachedState('rowPinning', this.getRowPinningState()),
        });
        if (colFilter) {
            this.addManagedListeners(colFilter, {
                filterStateChanged: updateFilterState,
            });
        }
        if (selectableFilter) {
            this.addManagedListeners(selectableFilter, {
                selectedFilterChanged: updateFilterState,
            });
        }
    }

    private setFirstDataRenderedState(
        state: GridState,
        source: 'gridInitializing' | 'api',
        ignoreSet?: Set<GridStateKey>
    ): void {
        const {
            scroll: scrollState,
            cellSelection: cellSelectionState,
            focusedCell: focusedCellState,
            columnOrder: columnOrderState,
        } = state;
        const shouldSetState = <TKey extends GridStateKey>(prop: TKey, propState: GridState[TKey]) =>
            !ignoreSet?.has(prop) && (propState || source === 'api');

        if (shouldSetState('focusedCell', focusedCellState)) {
            this.setFocusedCellState(focusedCellState);
        }
        if (shouldSetState('cellSelection', cellSelectionState)) {
            this.setCellSelectionState(cellSelectionState);
        }
        if (shouldSetState('scroll', scrollState)) {
            this.setScrollState(scrollState);
        }
        this.setColumnPivotState(!!columnOrderState?.orderedColIds, source);

        const deferredFilterState = this.deferredFilterState;
        if (deferredFilterState) {
            this.deferredFilterState = undefined;
            this.setFilterState(deferredFilterState, source);
        }

        const updateCachedState = this.updateCachedState.bind(this);
        // reset sidebar as it could have updated when columns changed
        updateCachedState('sideBar', this.getSideBarState());
        updateCachedState('focusedCell', this.getFocusedCellState());
        const cellSelection = this.getRangeSelectionState();
        updateCachedState('rangeSelection', cellSelection);
        updateCachedState('cellSelection', cellSelection);
        updateCachedState('scroll', this.getScrollState());
    }

    private setupStateOnFirstDataRendered(initialState: GridState): void {
        this.setFirstDataRenderedState(initialState, 'gridInitializing');

        const updateCachedState = this.updateCachedState.bind(this);
        const updateFocusState = () => updateCachedState('focusedCell', this.getFocusedCellState());
        this.addManagedEventListeners({
            cellFocused: updateFocusState,
            cellFocusCleared: updateFocusState,
            cellSelectionChanged: (event) => {
                if (event.finished) {
                    const cellSelection = this.getRangeSelectionState();
                    updateCachedState('rangeSelection', cellSelection);
                    updateCachedState('cellSelection', cellSelection);
                }
            },
            bodyScrollEnd: () => updateCachedState('scroll', this.getScrollState()),
        });
    }

    private getColumnGridState(): {
        sort?: SortState;
        rowGroup?: RowGroupState;
        aggregation?: AggregationState;
        pivot?: PivotState;
        columnPinning?: ColumnPinningState;
        columnVisibility?: ColumnVisibilityState;
        columnSizing?: ColumnSizingState;
        columnOrder?: ColumnOrderState;
    } {
        const beans = this.beans;
        return convertColumnState(_getColumnState(beans), beans.colModel.pivotMode);
    }

    private applyColumnGridState(
        state: GridState,
        source: 'gridInitializing' | 'api',
        partialColumnState: boolean,
        ignoreSet?: Set<GridStateKey>
    ): void {
        const {
            sort: sortState,
            rowGroup: groupState,
            aggregation: aggregationState,
            pivot: pivotState,
            columnPinning: columnPinningState,
            columnVisibility: columnVisibilityState,
            columnSizing: columnSizingState,
            columnOrder: columnOrderState,
        } = state;
        // if any column state property is provided, or from `setState`, should always apply state even if empty
        let forceSetState = false;
        const shouldSetState = <TKey extends GridStateKey>(prop: TKey, propState: GridState[TKey]) => {
            const shouldSet = !ignoreSet?.has(prop) && !!(propState || source === 'api');
            forceSetState ||= shouldSet;
            return shouldSet;
        };
        const columnStateMap: { [colId: string]: ColumnState } = Object.create(null);
        const getColumnState = (colId: string) => {
            let columnState = columnStateMap[colId];
            if (columnState) {
                return columnState;
            }
            columnState = { colId };
            columnStateMap[colId] = columnState;
            return columnState;
        };
        const defaultState: ColumnStateParams = {};

        const shouldSetSortState = shouldSetState('sort', sortState);
        if (shouldSetSortState && sortState) {
            const sortModel = sortState.sortModel;
            for (let sortIndex = 0, len = sortModel.length; sortIndex < len; ++sortIndex) {
                const { colId, sort, type } = sortModel[sortIndex];
                const columnState = getColumnState(colId);
                columnState.sort = sort;
                columnState.sortIndex = sortIndex;
                columnState.sortType = type;
            }
        }
        if (shouldSetSortState || !partialColumnState) {
            defaultState.sort = null;
            defaultState.sortIndex = null;
        }

        const shouldSetGroupState = shouldSetState('rowGroup', groupState);
        if (shouldSetGroupState && groupState) {
            const groupColIds = groupState.groupColIds;
            for (let rowGroupIndex = 0, len = groupColIds.length; rowGroupIndex < len; ++rowGroupIndex) {
                const columnState = getColumnState(groupColIds[rowGroupIndex]);
                columnState.rowGroup = true;
                columnState.rowGroupIndex = rowGroupIndex;
            }
        }
        if (shouldSetGroupState || !partialColumnState) {
            defaultState.rowGroup = null;
            defaultState.rowGroupIndex = null;
        }

        const shouldSetAggregationState = shouldSetState('aggregation', aggregationState);
        if (shouldSetAggregationState && aggregationState) {
            const aggregationModel = aggregationState.aggregationModel;
            for (let i = 0, len = aggregationModel.length; i < len; ++i) {
                const { colId, aggFunc } = aggregationModel[i];
                const columnState = getColumnState(colId);
                columnState.aggFunc = aggFunc;
                columnState.valueIndex = i;
            }
        }
        if (shouldSetAggregationState || !partialColumnState) {
            defaultState.aggFunc = null;
            defaultState.valueIndex = null;
        }

        const shouldSetPivotState = shouldSetState('pivot', pivotState);
        if (shouldSetPivotState && pivotState) {
            const pivotColIds = pivotState.pivotColIds;
            for (let pivotIndex = 0, len = pivotColIds.length; pivotIndex < len; ++pivotIndex) {
                const columnState = getColumnState(pivotColIds[pivotIndex]);
                columnState.pivot = true;
                columnState.pivotIndex = pivotIndex;
            }
            this.gos.updateGridOptions({
                options: { pivotMode: !!pivotState.pivotMode },
                source: source as any,
            });
        }
        if (shouldSetPivotState || !partialColumnState) {
            defaultState.pivot = null;
            defaultState.pivotIndex = null;
        }

        const shouldSetColumnPinningState = shouldSetState('columnPinning', columnPinningState);
        if (shouldSetColumnPinningState) {
            for (const colId of columnPinningState?.leftColIds ?? []) {
                getColumnState(colId).pinned = 'left';
            }
            for (const colId of columnPinningState?.rightColIds ?? []) {
                getColumnState(colId).pinned = 'right';
            }
        }
        if (shouldSetColumnPinningState || !partialColumnState) {
            defaultState.pinned = null;
        }

        const shouldSetColumnVisibilityState = shouldSetState('columnVisibility', columnVisibilityState);
        if (shouldSetColumnVisibilityState) {
            for (const colId of columnVisibilityState?.hiddenColIds ?? []) {
                getColumnState(colId).hide = true;
            }
        }
        if (shouldSetColumnVisibilityState || !partialColumnState) {
            defaultState.hide = null;
        }

        const shouldSetColumnSizingState = shouldSetState('columnSizing', columnSizingState);
        if (shouldSetColumnSizingState) {
            for (const { colId, flex, width } of columnSizingState?.columnSizingModel ?? []) {
                const columnState = getColumnState(colId);
                columnState.flex = flex ?? null;
                columnState.width = width;
            }
        }
        if (shouldSetColumnSizingState || !partialColumnState) {
            defaultState.flex = null;
        }

        const columns = columnOrderState?.orderedColIds;
        const applyOrder = !!columns?.length && !ignoreSet?.has('columnOrder');
        const columnStates = applyOrder ? columns.map((colId) => getColumnState(colId)) : Object.values(columnStateMap);

        if (columnStates.length || forceSetState) {
            this.columnStates = columnStates;
            _applyColumnState(
                this.beans,
                {
                    state: columnStates,
                    applyOrder,
                    defaultState,
                },
                source
            );
        }
    }

    private setColumnPivotState(applyOrder: boolean, source: 'gridInitializing' | 'api'): void {
        const columnStates = this.columnStates;
        this.columnStates = undefined;
        const columnGroupStates = this.columnGroupStates;
        this.columnGroupStates = undefined;

        const beans = this.beans;
        const { pivotResultCols, colModel } = beans;
        if (!pivotResultCols?.pivotCols) {
            return;
        }

        if (columnStates) {
            const secondaryColumnStates: ColumnState[] = [];
            for (const columnState of columnStates) {
                if (colModel.colsById[columnState.colId]?.colDef.pivotKeys != null) {
                    secondaryColumnStates.push(columnState);
                }
            }

            _applyColumnState(
                beans,
                {
                    state: secondaryColumnStates,
                    applyOrder,
                },
                source
            );
        }

        if (columnGroupStates) {
            // no easy/performant way of knowing which column groups are pivot column groups
            _setColGroupState(beans, columnGroupStates, source);
        }
    }

    private getColumnGroupState(): ColumnGroupState | undefined {
        const columnGroupState = _getColGroupState(this.beans);
        return _convertColumnGroupState(columnGroupState);
    }

    private setColumnGroupState(
        state: GridState,
        source: 'gridInitializing' | 'api',
        ignoreSet?: Set<GridStateKey>
    ): void {
        if (
            ignoreSet?.has('columnGroup') ||
            (source !== 'api' && !Object.prototype.hasOwnProperty.call(state, 'columnGroup'))
        ) {
            return;
        }

        const openColumnGroups = new Set(state.columnGroup?.openColumnGroupIds);
        const existingColumnGroupState = _getColGroupState(this.beans);
        const stateItems = existingColumnGroupState.map(({ groupId }) => {
            const open = openColumnGroups.has(groupId);
            if (open) {
                openColumnGroups.delete(groupId);
            }
            return {
                groupId,
                open,
            };
        });
        // probably pivot cols
        for (const groupId of openColumnGroups) {
            stateItems.push({
                groupId,
                open: true,
            });
        }
        if (stateItems.length) {
            this.columnGroupStates = stateItems;
        }
        _setColGroupState(this.beans, stateItems, source);
    }

    private getFilterState(): FilterState | undefined {
        const { filterManager, selectableFilter } = this.beans;
        let filterModel: FilterModel | undefined = filterManager?.getFilterModel();
        if (filterModel && Object.keys(filterModel).length === 0) {
            filterModel = undefined;
        }
        const columnFilterState = filterManager?.getFilterState();
        const advancedFilterModel = filterManager?.getAdvFilterModel() ?? undefined;
        const selectableFilters = selectableFilter?.getState();
        return filterModel || advancedFilterModel || columnFilterState || selectableFilters
            ? { filterModel, columnFilterState, advancedFilterModel, selectableFilters }
            : undefined;
    }

    private setFilterState(filterState?: FilterState, source: 'gridInitializing' | 'api' = 'api'): void {
        const { filterManager, selectableFilter } = this.beans;
        const { filterModel, columnFilterState, advancedFilterModel, selectableFilters } = filterState ?? {
            filterModel: null,
            columnFilterState: null,
            advancedFilterModel: null,
            selectableFilters: null,
        };
        if (selectableFilters !== undefined) {
            selectableFilter?.setState(selectableFilters ?? undefined);
        }
        // A programmatic `api` restore reports `api`; init-time restore has no public source, so it keeps
        // reporting the filter's own type (`gridInitializing` cannot be added to the public union without a break).
        const isApi = source === 'api';
        if (filterModel !== undefined || columnFilterState !== undefined) {
            const columnFilterSource: FilterChangedEventSourceType = isApi ? 'api' : 'columnFilter';
            filterManager?.setFilterState(filterModel ?? null, columnFilterState ?? null, columnFilterSource);
        }
        if (advancedFilterModel !== undefined) {
            const advancedFilterSource: FilterChangedEventSourceType = isApi ? 'api' : 'advancedFilter';
            filterManager?.setAdvFilterModel(advancedFilterModel ?? null, advancedFilterSource);
        }
    }

    /** Defers to firstDataRendered if any target column is missing (a pivot result column not yet created). */
    private setFilterStateDeferringPivot(state: FilterState | undefined, source: 'gridInitializing' | 'api'): void {
        const { colModel, pivotResultCols } = this.beans;
        const filterModel = state?.filterModel;
        if (filterModel && source === 'gridInitializing' && colModel.pivotMode && !pivotResultCols?.pivotCols) {
            const colsById = colModel.colsById;
            const colIds = Object.keys(filterModel);
            for (let i = 0, len = colIds.length; i < len; ++i) {
                if (colsById[colIds[i]] == null) {
                    this.deferredFilterState = state;
                    return;
                }
            }
        }
        this.setFilterState(state, source);
    }

    private getRangeSelectionState(): CellSelectionState | undefined {
        const cellRanges = this.beans.rangeSvc?.getCellRanges().map((cellRange) => {
            const { id, type, startRow, endRow, columns, startColumn } = cellRange;
            return {
                id,
                type,
                startRow,
                endRow,
                colIds: columns.map((column) => column.getColId()),
                startColId: startColumn.getColId(),
            };
        });
        return cellRanges?.length ? { cellRanges } : undefined;
    }

    private setCellSelectionState(cellSelectionState?: CellSelectionState): void {
        const { gos, rangeSvc, colModel, visibleCols } = this.beans;

        if (!_isCellSelectionEnabled(gos) || !rangeSvc) {
            return;
        }

        const cellRanges: CellRange[] = [];
        for (const cellRange of cellSelectionState?.cellRanges ?? []) {
            const columns: AgColumn[] = [];
            for (const colId of cellRange.colIds) {
                const column = colModel.colsById[colId];
                if (column) {
                    columns.push(column);
                }
            }
            if (!columns.length) {
                continue;
            }
            let startColumn = colModel.colsById[cellRange.startColId];
            if (!startColumn) {
                // find the first remaining column
                const allColumns = visibleCols.allCols;
                const columnSet = new Set(columns);
                startColumn = allColumns.find((column) => columnSet.has(column))!;
            }
            cellRanges.push({
                ...cellRange,
                columns,
                startColumn,
            });
        }

        rangeSvc.setCellRanges(cellRanges);
    }

    private getScrollState(): ScrollState | undefined {
        if (!this.isClientSideRowModel) {
            // can't restore, so don't provide
            return undefined;
        }
        const scrollFeature = this.beans.ctrlsSvc.getScrollFeature();
        const { left } = scrollFeature?.getHScrollPosition() ?? { left: 0 };
        const { top } = scrollFeature?.getVScrollPosition() ?? { top: 0 };
        return top || left
            ? {
                  top,
                  left,
              }
            : undefined;
    }

    private setScrollState(scrollState?: ScrollState): void {
        if (!this.isClientSideRowModel) {
            return;
        }
        const { top, left } = scrollState ?? { top: 0, left: 0 };
        const { frameworkOverrides, rowRenderer, animationFrameSvc, ctrlsSvc } = this.beans;
        frameworkOverrides.wrapIncoming(() => {
            ctrlsSvc.whenReady(this, () => {
                const scrollFeature = ctrlsSvc.getScrollFeature();
                scrollFeature?.setHorizontalScrollPosition(left);
                scrollFeature?.setVerticalScrollPosition(top);
                rowRenderer.redraw({ afterScroll: true });
                animationFrameSvc?.flushAllFrames();
            });
        });
    }

    private getSideBarState(): SideBarState | undefined {
        return this.beans.sideBar?.comp?.getState();
    }

    private getFocusedCellState(): FocusedCellState | undefined {
        if (!this.isClientSideRowModel) {
            // can't restore, so don't provide
            return undefined;
        }
        const focusedCell = this.beans.focusSvc.getFocusedCell();
        if (focusedCell) {
            const { column, rowIndex, rowPinned } = focusedCell;
            return {
                colId: column.getColId(),
                rowIndex,
                rowPinned,
            };
        }
        return undefined;
    }

    private setFocusedCellState(focusedCellState?: FocusedCellState): void {
        if (!this.isClientSideRowModel) {
            return;
        }
        const { focusSvc, colModel } = this.beans;
        if (!focusedCellState) {
            focusSvc.clearFocusedCell();
            return;
        }
        const { colId, rowIndex, rowPinned } = focusedCellState;
        focusSvc.setFocusedCell({
            column: colModel.colsById[colId] ?? null,
            rowIndex,
            rowPinned,
            forceBrowserFocus: true,
            preventScrollOnBrowserFocus: true,
        });
    }

    private getPaginationState(): PaginationState | undefined {
        const { pagination, gos } = this.beans;
        if (!pagination) {
            return undefined;
        }
        const page = pagination.getCurrentPage();
        const pageSize = !gos.get('paginationAutoPageSize') ? pagination.getPageSize() : undefined;

        if (!page && !pageSize) {
            return;
        }
        return { page, pageSize };
    }

    private setPaginationState(paginationState: PaginationState | undefined, source: 'gridInitializing' | 'api'): void {
        const { pagination, gos } = this.beans;
        if (!pagination) {
            return;
        }
        const { pageSize, page } = paginationState ?? { page: 0, pageSize: gos.get('paginationPageSize') };
        const isInit = source === 'gridInitializing';
        if (pageSize && !gos.get('paginationAutoPageSize')) {
            pagination.setPageSize(pageSize, isInit ? 'initialState' : 'pageSizeSelector');
        }

        if (typeof page === 'number') {
            if (isInit) {
                pagination.setPage(page);
            } else {
                pagination.goToPage(page);
            }
        }
    }

    private getRowSelectionState():
        | string[]
        | ServerSideRowSelectionState
        | ServerSideRowGroupSelectionState
        | undefined {
        const selectionSvc = this.beans.selectionSvc;
        if (!selectionSvc) {
            return undefined;
        }
        const selectionState = selectionSvc.getSelectionState();
        const noSelections =
            !selectionState ||
            (!Array.isArray(selectionState) &&
                ((selectionState as ServerSideRowSelectionState).selectAll === false ||
                    (selectionState as ServerSideRowGroupSelectionState).selectAllChildren === false) &&
                !selectionState?.toggledNodes?.length);
        return noSelections ? undefined : selectionState;
    }

    private setRowSelectionState(
        rowSelectionState: string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState | undefined,
        source: 'gridInitializing' | 'api'
    ): void {
        this.beans.selectionSvc?.setSelectionState(rowSelectionState, source, source === 'api');
    }

    private updateGroupExpansionState(): void {
        const { expansionSvc, gos } = this.beans;
        const state = expansionSvc?.getExpansionState();
        const ssrmExpandAllAffectsAllRows = gos.get('ssrmExpandAllAffectsAllRows');

        this.updateCachedState('ssrmRowGroupExpansion', ssrmExpandAllAffectsAllRows ? state : undefined);
        this.updateCachedState(
            'rowGroupExpansion',
            ssrmExpandAllAffectsAllRows ? undefined : (state as RowGroupExpansionState)
        );
    }

    private getRowPinningState(): RowPinningState | undefined {
        return this.beans.pinnedRowModel?.getPinnedState();
    }

    private setRowPinningState(state?: RowPinningState): void {
        const pinnedRowModel = this.beans.pinnedRowModel;
        if (state) {
            pinnedRowModel?.setPinnedState(state);
        } else {
            pinnedRowModel?.reset();
        }
    }

    private setRowGroupExpansionState(
        ssrmRowGroupExpansionState: RowGroupExpansionState | RowGroupBulkExpansionState | undefined,
        rowGroupExpansionState: RowGroupExpansionState | undefined,
        source: 'gridInitializing' | 'api'
    ): void {
        const state = ssrmRowGroupExpansionState ??
            rowGroupExpansionState ?? { expandedRowGroupIds: [], collapsedRowGroupIds: [] };
        this.beans.expansionSvc?.setExpansionState(state, source);
    }

    private updateColumnState(features: (keyof GridState)[]): void {
        const newColumnState = this.getColumnGridState();
        let hasChanged = false;
        const cachedState = this.cachedState;
        for (const key of Object.keys(newColumnState) as (keyof GridState)[]) {
            const value = (newColumnState as any)[key];
            if (!_jsonEquals(value, cachedState[key])) {
                hasChanged = true;
            }
        }

        this.cachedState = {
            ...cachedState,
            ...newColumnState,
        };
        if (hasChanged) {
            this.dispatchStateUpdateEvent(features);
        }
    }

    private updateCachedState<K extends keyof GridState>(key: K, value: GridState[K]): void {
        const existingValue = this.cachedState[key];
        this.setCachedStateValue(key, value);
        if (!_jsonEquals(value, existingValue)) {
            this.dispatchStateUpdateEvent([key]);
        }
    }

    private setCachedStateValue<K extends keyof GridState>(key: K, value: GridState[K]): void {
        this.cachedState = {
            ...this.cachedState,
            [key]: value,
        };
    }

    private refreshStaleState(): void {
        const staleStateKeys = this.staleStateKeys;
        for (const key of staleStateKeys) {
            // only row selection supported for now
            if (key === 'rowSelection') {
                this.setCachedStateValue(key, this.getRowSelectionState());
            }
        }
        staleStateKeys.clear();
    }

    private dispatchStateUpdateEvent(sources: (keyof GridState | 'gridInitializing' | 'api')[]): void {
        if (this.suppressEvents) {
            return;
        }
        for (const source of sources) {
            this.queuedUpdateSources.add(source);
        }
        this.dispatchStateUpdateEventDebounced();
    }

    private dispatchQueuedStateUpdateEvents(): void {
        const queuedUpdateSources = this.queuedUpdateSources;
        const sources = Array.from(queuedUpdateSources);
        queuedUpdateSources.clear();
        this.eventSvc.dispatchEvent({
            type: 'stateUpdated',
            sources,
            state: this.cachedState,
        });
    }

    private startSuppressEvents(): void {
        this.suppressEvents = true;
        this.beans.colAnimation?.setSuppressAnimation(true);
    }

    private stopSuppressEvents(source: 'gridInitializing' | 'api'): void {
        // We want to suppress any grid events, but not user events.
        // Using a timeout here captures things like column resizing and emits a single grid initializing event.
        setTimeout(() => {
            this.suppressEvents = false;
            // We only want the grid initializing source.
            this.queuedUpdateSources.clear();
            if (!this.isAlive()) {
                // Ensure the grid is still alive before dispatching the event.
                return;
            }
            this.beans.colAnimation?.setSuppressAnimation(false);
            this.dispatchStateUpdateEvent([source]);
        });
    }

    private suppressEventsAndDispatchInitEvent(updateFunc: () => void): void {
        this.startSuppressEvents();
        updateFunc();
        this.stopSuppressEvents('gridInitializing');
    }
}
