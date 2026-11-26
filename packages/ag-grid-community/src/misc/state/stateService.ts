import { _debounce, _hasOwn, _jsonEquals } from 'ag-stack';

import { _getColGroupState, _setColGroupState } from '../../columns/columnGroups/columnGroupState';
import type { ColumnState, ColumnStateParams } from '../../columns/columnStateUtils';
import { _applyColumnState, _getColumnState } from '../../columns/columnStateUtils';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import type { GridChanges } from '../../gridChanges';
import { _isCellSelectionEnabled, _isClientSideRowModel } from '../../gridOptionsUtils';
import type { CellRange } from '../../interfaces/IRangeService';
import type {
    AggregationState,
    CellSelectionState,
    ColumnGroupState,
    ColumnHeaderNameState,
    ColumnOrderState,
    ColumnPinningState,
    ColumnSizeState,
    ColumnSizingState,
    ColumnVisibilityState,
    FilterState,
    FindState,
    FocusedCellState,
    GridState,
    GridStateKey,
    PaginationState,
    PivotState,
    QuickFilterState,
    RowGroupState,
    RowPinningState,
    ScrollState,
    ShowValuesAsState,
    SideBarState,
    SortState,
} from '../../interfaces/gridState';
import type { RowGroupBulkExpansionState, RowGroupExpansionState } from '../../interfaces/iExpansionService';
import type { FilterModel } from '../../interfaces/iFilter';
import type { ServerSideRowGroupSelectionState, ServerSideRowSelectionState } from '../../interfaces/selectionState';
import { _cloneDeep } from '../../utils/mergeDeep';
import { migrateGridStateModel } from './stateModelMigration';
import { _convertColumnGroupState, convertColumnState } from './stateUtils';

export class StateService extends BeanStub implements NamedBean {
    beanName = 'stateSvc' as const;

    private updateRowGroupExpansionStateTimer: ReturnType<typeof setTimeout> | number = 0;
    /** Set once the initial state is applied: from then the row group expansion state follows the rows. */
    private rowGroupExpansionTracked = false;

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
    private columnGroupStates?: { groupId: string; open: boolean; headerName?: string | null }[];
    /** Filter state held back until firstDataRendered, when pivot result columns exist. */
    private deferredFilterState?: FilterState;
    /** The initial filter state until applied, when the row count is ready or before a filter set through the API. */
    private initialFilterState?: FilterState;
    private readonly staleStateKeys: Set<keyof GridState> = new Set();

    public postConstruct(): void {
        const { gos, ctrlsSvc, colDelayRenderSvc } = this.beans;
        this.isClientSideRowModel = _isClientSideRowModel(gos);

        const initialState = migrateGridStateModel(gos.get('initialState') ?? {});
        const partialColumnState = initialState.partialColumnState;
        delete initialState.partialColumnState;
        this.cachedState = initialState;
        this.initialFilterState = initialState.filter;

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
        const syncSvc = this.beans.syncSvc;
        // the cache holds the state given until the columns are read back
        const changes = syncSvc.changes;
        changes.columnState = true;
        changes.columnGroupState = true;

        this.startSuppressEvents();
        this.applyInitialFilterState();

        const source = 'api';

        const ignoreSet = propertiesToIgnore ? new Set(propertiesToIgnore) : undefined;

        this.setGridReadyState(state, source, ignoreSet);

        // one update, so the columns and the filters it restores refresh the rows together
        syncSvc.beginUpdate();
        try {
            this.setColumnsInitialisedState(state, source, !!ignoreSet, ignoreSet);
            this.setRowCountState(state, source, ignoreSet);
        } finally {
            syncSvc.endUpdate();
        }

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

    private setColumnsInitialisedState(
        state: GridState,
        source: 'gridInitializing' | 'api',
        partialColumnState: boolean,
        ignoreSet?: Set<GridStateKey>
    ): void {
        // Runs first: the other sections configure columns, so the ones this creates must already exist.
        this.setUserColumnsState(state, source, ignoreSet);
        this.applyColumnGridState(state, source, partialColumnState, ignoreSet);
        this.setColumnGroupState(state, source, ignoreSet);
    }

    /** Recreates the user-column layer (columns the user created at runtime, plus their overrides and
     *  removals of declared columns) and rebuilds the column tree when it changed. */
    private setUserColumnsState(
        state: GridState,
        source: 'gridInitializing' | 'api',
        ignoreSet?: Set<GridStateKey>
    ): void {
        if (ignoreSet?.has('userColumns') || (!state.userColumns && source !== 'api')) {
            return;
        }
        const { userColumnSvc, calculatedColsSvc, colModel } = this.beans;
        const changed = userColumnSvc!.setState(state.userColumns);
        // Owning services adopt the restored entries so their existing edit/remove paths keep working, and
        // discard columns they were holding that the state does not list.
        const adopted = calculatedColsSvc?.adoptUserColumns() ?? false;
        if (!changed && !adopted) {
            return;
        }
        colModel.rebuildCols(source);
    }

    private setupStateOnColumnsInitialised(initialState: GridState, partialColumnState: boolean): void {
        this.setColumnsInitialisedState(initialState, 'gridInitializing', partialColumnState);
    }

    private setRowCountState(
        state: GridState,
        source: 'gridInitializing' | 'api',
        ignoreSet?: Set<GridStateKey>
    ): void {
        const {
            filter: filterState,
            quickFilter: quickFilterState,
            rowGroupExpansion: rowGroupExpansionState,
            ssrmRowGroupExpansion,
            rowSelection: rowSelectionState,
            pagination: paginationState,
            rowPinning,
        } = state;
        const shouldSetState = <TKey extends GridStateKey>(prop: TKey, propState: GridState[TKey]) =>
            !ignoreSet?.has(prop) && (propState || source === 'api');

        const expansionKey = this.gos.get('ssrmExpandAllAffectsAllRows')
            ? 'ssrmRowGroupExpansion'
            : 'rowGroupExpansion';
        const setExpansion =
            !ignoreSet?.has(expansionKey) &&
            (shouldSetState('rowGroupExpansion', rowGroupExpansionState) ||
                shouldSetState('ssrmRowGroupExpansion', ssrmRowGroupExpansion));
        const { colModel, syncSvc } = this.beans;
        // one update, so the filters and the expansion it restores refresh the rows together
        syncSvc.beginUpdate();
        try {
            if (colModel.isPivotActive()) {
                syncSvc.flushChanges(); // a filter may name the pivot result columns this builds
            }
            if (shouldSetState('filter', filterState)) {
                this.setFilterStateDeferringPivot(filterState, source);
            }
            if (shouldSetState('quickFilter', quickFilterState)) {
                this.setQuickFilterState(quickFilterState, source);
            }
            if (setExpansion) {
                this.setRowGroupExpansionState(
                    ignoreSet?.has('ssrmRowGroupExpansion') ? undefined : ssrmRowGroupExpansion,
                    ignoreSet?.has('rowGroupExpansion') ? undefined : rowGroupExpansionState,
                    source
                );
            }
            syncSvc.flushChanges(); // the selection and the page read the rows the changes so far leave
            if (shouldSetState('rowSelection', rowSelectionState)) {
                this.setRowSelectionState(rowSelectionState, source);
            }
            if (shouldSetState('pagination', paginationState)) {
                this.setPaginationState(paginationState, source);
            }
            if (shouldSetState('rowPinning', rowPinning)) {
                this.setRowPinningState(rowPinning);
            }
        } finally {
            syncSvc.endUpdate();
        }

        const updateCachedState = this.updateCachedState.bind(this);
        updateCachedState('filter', this.getFilterState());
        updateCachedState('quickFilter', this.getQuickFilterState());
        this.updateGroupExpansionState();

        updateCachedState('rowSelection', this.getRowSelectionState());
        updateCachedState('pagination', this.getPaginationState());
    }

    /** Re-reads the row group expansion state after a change that opens or closes groups without an expansion event. */
    public onRowGroupsChanged(): void {
        if (!this.rowGroupExpansionTracked) {
            return;
        }
        clearTimeout(this.updateRowGroupExpansionStateTimer); // read now: the queued read would repeat it
        this.updateRowGroupExpansionStateTimer = 0;
        this.updateGroupExpansionState();
    }

    private setupStateOnRowCountReady(initialState: GridState): void {
        this.rowGroupExpansionTracked = true;
        this.applyInitialFilterState();
        this.setRowCountState({ ...initialState, filter: undefined }, 'gridInitializing');

        const updateCachedState = this.updateCachedState.bind(this);
        const updateRowGroupExpansionState = () => this.onRowGroupsChanged();
        const updateFilterState = () => updateCachedState('filter', this.getFilterState());
        // A case-only edit (`abc` -> `ABC`) parses to the same filter, so it dispatches no `filterChanged`.
        this.addManagedPropertyListener('quickFilterText', () =>
            updateCachedState('quickFilter', this.getQuickFilterState())
        );

        const { gos, colFilter, selectableFilter } = this.beans;
        this.addManagedEventListeners({
            filterChanged: updateFilterState,
            rowExpansionStateChanged: this.onRowGroupOpenedDebounced,
            expandOrCollapseAll: updateRowGroupExpansionState,
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
            find: findState,
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
        this.setColumnPivotState(!!columnOrderState?.orderedColIds, source);

        const deferredFilterState = this.deferredFilterState;
        if (deferredFilterState) {
            this.deferredFilterState = undefined;
            this.setFilterState(deferredFilterState, source);
        }

        if (shouldSetState('find', findState)) {
            this.setFindState(findState, source);
        }
        if (shouldSetState('scroll', scrollState)) {
            this.setScrollState(scrollState);
        }

        const updateCachedState = this.updateCachedState.bind(this);
        // reset sidebar as it could have updated when columns changed
        updateCachedState('sideBar', this.getSideBarState());
        updateCachedState('focusedCell', this.getFocusedCellState());
        const cellSelection = this.getRangeSelectionState();
        updateCachedState('rangeSelection', cellSelection);
        updateCachedState('cellSelection', cellSelection);
        updateCachedState('scroll', this.getScrollState());
        updateCachedState('find', this.getFindState());
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
            findChanged: () => updateCachedState('find', this.getFindState()),
        });
    }

    private getColumnGridState(): {
        sort?: SortState;
        rowGroup?: RowGroupState;
        aggregation?: AggregationState;
        showValuesAs?: ShowValuesAsState;
        pivot?: PivotState;
        columnPinning?: ColumnPinningState;
        columnVisibility?: ColumnVisibilityState;
        columnSizing?: ColumnSizingState;
        columnOrder?: ColumnOrderState;
        columnHeaderName?: ColumnHeaderNameState;
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
            showValuesAs: showValuesAsState,
            pivot: pivotState,
            columnPinning: columnPinningState,
            columnVisibility: columnVisibilityState,
            columnSizing: columnSizingState,
            columnOrder: columnOrderState,
            columnHeaderName: columnHeaderNameState,
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
        const shouldSetSortState = shouldSetState('sort', sortState);
        const shouldSetGroupState = shouldSetState('rowGroup', groupState);
        const shouldSetAggregationState = shouldSetState('aggregation', aggregationState);
        const shouldSetShowValuesAsState = shouldSetState('showValuesAs', showValuesAsState);
        const shouldSetPivotState = shouldSetState('pivot', pivotState);
        const shouldSetColumnPinningState = shouldSetState('columnPinning', columnPinningState);
        const shouldSetColumnVisibilityState = shouldSetState('columnVisibility', columnVisibilityState);
        const shouldSetColumnSizingState = shouldSetState('columnSizing', columnSizingState);
        const shouldSetHeaderNameState = shouldSetState('columnHeaderName', columnHeaderNameState);

        // `null` resets a field on columns the state omits; `undefined` leaves it untouched.
        const reset = (shouldSet: boolean) => (shouldSet || !partialColumnState ? null : undefined);
        const defaultState: ColumnStateParams = {
            sort: reset(shouldSetSortState),
            sortIndex: reset(shouldSetSortState),
            rowGroup: reset(shouldSetGroupState),
            rowGroupIndex: reset(shouldSetGroupState),
            aggFunc: reset(shouldSetAggregationState),
            valueIndex: reset(shouldSetAggregationState),
            showValuesAs: reset(shouldSetShowValuesAsState),
            pivot: reset(shouldSetPivotState),
            pivotIndex: reset(shouldSetPivotState),
            pinned: reset(shouldSetColumnPinningState),
            hide: reset(shouldSetColumnVisibilityState),
            // an omitted columnSizing keeps the layout, colDef flex included
            flex: columnSizingState ? reset(shouldSetColumnSizingState) : undefined,
            headerName: reset(shouldSetHeaderNameState),
            // `null` pivotSort would clear the colDef default ('asc') on every pivoted column; width/sortType are no-ops.
            // Including to enable type checking to guard against missing properties in the future
            sortType: undefined,
            width: undefined,
            pivotSort: undefined,
        } satisfies Record<keyof ColumnStateParams, unknown>;

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

        if (shouldSetGroupState && groupState) {
            const groupColIds = groupState.groupColIds;
            for (let rowGroupIndex = 0, len = groupColIds.length; rowGroupIndex < len; ++rowGroupIndex) {
                const columnState = getColumnState(groupColIds[rowGroupIndex]);
                columnState.rowGroup = true;
                columnState.rowGroupIndex = rowGroupIndex;
            }
        }

        if (shouldSetAggregationState && aggregationState) {
            const aggregationModel = aggregationState.aggregationModel;
            for (let i = 0, len = aggregationModel.length; i < len; ++i) {
                const { colId, aggFunc } = aggregationModel[i];
                const columnState = getColumnState(colId);
                columnState.aggFunc = aggFunc;
                columnState.valueIndex = i;
            }
        }

        if (shouldSetShowValuesAsState && showValuesAsState) {
            const showValuesAsModel = showValuesAsState.showValuesAsModel;
            for (let i = 0, len = showValuesAsModel.length; i < len; ++i) {
                const { colId, showValuesAs } = showValuesAsModel[i];
                // Clone so later mutation of the caller's state can't reach live column config.
                getColumnState(colId).showValuesAs = _cloneDeep(showValuesAs);
            }
        }

        if (shouldSetPivotState && pivotState) {
            const pivotColIds = pivotState.pivotColIds;
            for (let pivotIndex = 0, len = pivotColIds.length; pivotIndex < len; ++pivotIndex) {
                const columnState = getColumnState(pivotColIds[pivotIndex]);
                columnState.pivot = true;
                columnState.pivotIndex = pivotIndex;
            }
            for (const { colId, sort } of pivotState.pivotSortModel ?? []) {
                getColumnState(colId).pivotSort = sort;
            }
        }
        if (shouldSetPivotState && (pivotState || this.gos.get('pivotMode'))) {
            this.gos.updateGridOptions({
                options: { pivotMode: !!pivotState?.pivotMode },
                source: source as any,
            });
        }

        if (shouldSetColumnPinningState) {
            for (const colId of columnPinningState?.leftColIds ?? []) {
                getColumnState(colId).pinned = 'left';
            }
            for (const colId of columnPinningState?.rightColIds ?? []) {
                getColumnState(colId).pinned = 'right';
            }
        }

        if (shouldSetColumnVisibilityState) {
            for (const colId of columnVisibilityState?.hiddenColIds ?? []) {
                getColumnState(colId).hide = true;
            }
        }

        if (shouldSetColumnSizingState) {
            for (const { colId, flex, width } of columnSizingState?.columnSizingModel ?? []) {
                const columnState = getColumnState(colId);
                columnState.flex = flex ?? null;
                columnState.width = width;
            }
        }

        if (shouldSetHeaderNameState) {
            for (const { colId, headerName } of columnHeaderNameState?.columnHeaderNames ?? []) {
                getColumnState(colId).headerName = headerName;
            }
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
                source,
                false,
                shouldSetPivotState
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

        // one column update: the result columns' state and their groups' are laid out and told once
        const syncSvc = beans.syncSvc;
        syncSvc.beginUpdate();
        try {
            if (columnStates) {
                const secondaryColumnStates = columnStates.filter(
                    (columnState) => colModel.colsById[columnState.colId]?.colDef.pivotKeys != null
                );

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
        } finally {
            syncSvc.endUpdate();
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
        if (ignoreSet?.has('columnGroup') || (source !== 'api' && !_hasOwn(state, 'columnGroup'))) {
            return;
        }

        const openColumnGroups = new Set(state.columnGroup?.openColumnGroupIds);
        const headerNamesById = new Map(
            (state.columnGroup?.headerNames ?? []).map(({ groupId, headerName }) => [groupId, headerName])
        );
        const existingColumnGroupState = _getColGroupState(this.beans);
        const stateItems = existingColumnGroupState.map(({ groupId }) => {
            const open = openColumnGroups.has(groupId);
            if (open) {
                openColumnGroups.delete(groupId);
            }
            return {
                groupId,
                open,
                headerName: headerNamesById.get(groupId) ?? null,
            };
        });
        // probably pivot cols
        for (const groupId of openColumnGroups) {
            stateItems.push({
                groupId,
                open: true,
                headerName: headerNamesById.get(groupId) ?? null,
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
        if (filterModel !== undefined || columnFilterState !== undefined) {
            filterManager?.setFilterState(filterModel ?? null, columnFilterState ?? null, source);
        }
        if (advancedFilterModel !== undefined) {
            filterManager?.setAdvFilterModel(advancedFilterModel ?? null, source);
        }
    }

    /**
     * Find and the Quick Filter are only state-managed when the Quick Access Toolbar owns an input
     * for them; otherwise their grid option is the only source and state leaves it alone.
     */
    private isToolbarStateManaged(item: 'agFindToolbarItem' | 'agQuickFilterToolbarItem'): boolean {
        return !!this.beans.toolbar?.hasItem(item);
    }

    private getQuickFilterState(): QuickFilterState | undefined {
        // Without the module the option is inert, and writing it on restore reports a missing-module error.
        return this.isToolbarStateManaged('agQuickFilterToolbarItem') ? this.beans.quickFilter?.getState() : undefined;
    }

    private setQuickFilterState(quickFilterState?: QuickFilterState, source: 'gridInitializing' | 'api' = 'api'): void {
        if (!this.isToolbarStateManaged('agQuickFilterToolbarItem')) {
            return;
        }
        const { text } = quickFilterState ?? {};
        // An `api` restore resets what it omits, so a state without the text clears the Quick Filter. At
        // initialisation an absent value instead leaves the `quickFilterText` grid option as provided.
        this.beans.quickFilter?.setState({ text: source === 'api' ? (text ?? '') : text }, source);
    }

    /** Applies the initial filter state once, so a filter set through the API before the rows arrive lands after it. */
    public applyInitialFilterState(): void {
        const filterState = this.initialFilterState;
        if (filterState) {
            this.initialFilterState = undefined;
            this.setFilterStateDeferringPivot(filterState, 'gridInitializing');
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

    private getFindState(): FindState | undefined {
        return this.isToolbarStateManaged('agFindToolbarItem') ? this.beans.findSvc?.getState() : undefined;
    }

    private setFindState(findState?: FindState, source: 'gridInitializing' | 'api' = 'api'): void {
        if (!this.isToolbarStateManaged('agFindToolbarItem')) {
            return;
        }
        const { searchValue, activeMatch } = findState ?? {};
        this.beans.findSvc?.setState({
            searchValue: source === 'api' ? (searchValue ?? '') : searchValue,
            activeMatch,
        });
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
        focusSvc.setFocusedCellOrSpan({
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
        string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState | undefined {
        const selectionSvc = this.beans.selectionSvc;
        if (!selectionSvc) {
            return undefined;
        }
        const selectionState = selectionSvc.getSelectionState();
        const noSelections =
            !selectionState ||
            (!Array.isArray(selectionState) &&
                ('selectAll' in selectionState
                    ? !selectionState.selectAll
                    : selectionState.selectAllChildren === false) &&
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
        this.beans.pinnedRowModel?.setPinnedState(state ?? { top: [], bottom: [] });
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

    /** Called as each column update ends: the column state the update changed is computed once, its changes told. */
    public refreshColumnState(changes: GridChanges): void {
        // a change recorded before the columns are ready waits for the first end after
        if (!this.beans.colModel.ready || !changes.columnState) {
            return;
        }
        changes.columnState = false;
        const cachedState = this.cachedState;
        const next: GridState = { ...cachedState, ...this.getColumnGridState() };
        // read only when recorded: a sort, a resize or a move changes neither the groups nor the user columns
        if (changes.columnGroupState) {
            changes.columnGroupState = false;
            next.columnGroup = this.getColumnGroupState();
            next.userColumns = this.beans.userColumnSvc!.getState();
        }
        const sources: (keyof GridState)[] = [];
        for (let i = 0, len = COLUMN_STATE_KEYS.length; i < len; ++i) {
            const key = COLUMN_STATE_KEYS[i];
            if (!_jsonEquals(next[key], cachedState[key])) {
                sources.push(key);
            }
        }
        // the sizing lists the columns in their order: a move alone resizes nothing
        const sizingAt = sources.includes('columnOrder') ? sources.indexOf('columnSizing') : -1;
        if (sizingAt !== -1 && isSameSizing(cachedState.columnSizing, next.columnSizing)) {
            sources.splice(sizingAt, 1);
        }
        if (sources.length) {
            this.cachedState = next;
            this.dispatchStateUpdateEvent(sources);
        }
    }

    private updateCachedState<K extends keyof GridState>(key: K, value: GridState[K]): void {
        const cachedState = this.cachedState;
        if (!_jsonEquals(value, cachedState[key])) {
            this.cachedState = { ...cachedState, [key]: value };
            this.dispatchStateUpdateEvent([key]);
        }
    }

    private refreshStaleState(): void {
        const staleStateKeys = this.staleStateKeys;
        for (const key of staleStateKeys) {
            // only row selection supported for now
            if (key === 'rowSelection') {
                this.updateCachedState(key, this.getRowSelectionState());
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

/** Whether two sizings hold the same widths and flexes, whatever the order of their columns. */
function isSameSizing(a: ColumnSizingState | undefined, b: ColumnSizingState | undefined): boolean {
    const aModel = a?.columnSizingModel;
    const bModel = b?.columnSizingModel;
    if (!aModel || !bModel) {
        return aModel === bModel;
    }
    if (aModel.length !== bModel.length) {
        return false;
    }
    const byId = new Map<string, ColumnSizeState>();
    for (let i = 0, len = aModel.length; i < len; ++i) {
        byId.set(aModel[i].colId, aModel[i]);
    }
    for (let i = 0, len = bModel.length; i < len; ++i) {
        const entry = bModel[i];
        const prev = byId.get(entry.colId);
        if (prev?.width !== entry.width || prev?.flex !== entry.flex) {
            return false;
        }
    }
    return true;
}
const COLUMN_STATE_KEYS: readonly (keyof GridState)[] = [
    'aggregation',
    'columnOrder',
    'columnPinning',
    'columnSizing',
    'columnVisibility',
    'columnHeaderName',
    'pivot',
    'rowGroup',
    'showValuesAs',
    'sort',
    'columnGroup',
    'userColumns',
];
