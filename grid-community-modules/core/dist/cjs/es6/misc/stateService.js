"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateService = void 0;
const beanStub_1 = require("../context/beanStub");
const context_1 = require("../context/context");
const eventKeys_1 = require("../eventKeys");
const generic_1 = require("../utils/generic");
const function_1 = require("../utils/function");
let StateService = class StateService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.suppressEvents = true;
        this.queuedUpdateSources = new Set();
        this.dispatchStateUpdateEventDebounced = (0, function_1.debounce)(() => this.dispatchQueuedStateUpdateEvents(), 0);
    }
    postConstruct() {
        var _a;
        this.isClientSideRowModel = this.rowModel.getType() === 'clientSide';
        this.cachedState = (_a = this.gridOptionsService.get('initialState')) !== null && _a !== void 0 ? _a : {};
        this.ctrlsService.whenReady(() => this.setupStateOnGridReady());
        const newColumnsLoadedDestroyFunc = this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_NEW_COLUMNS_LOADED, ({ source }) => {
            if (source === 'gridInitializing') {
                newColumnsLoadedDestroyFunc === null || newColumnsLoadedDestroyFunc === void 0 ? void 0 : newColumnsLoadedDestroyFunc();
                this.setupStateOnColumnsInitialised();
            }
        });
        const rowCountReadyDestroyFunc = this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_COUNT_READY, () => {
            rowCountReadyDestroyFunc === null || rowCountReadyDestroyFunc === void 0 ? void 0 : rowCountReadyDestroyFunc();
            this.setupStateOnRowCountReady();
        });
        const firstDataRenderedDestroyFunc = this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_FIRST_DATA_RENDERED, () => {
            firstDataRenderedDestroyFunc === null || firstDataRenderedDestroyFunc === void 0 ? void 0 : firstDataRenderedDestroyFunc();
            this.setupStateOnFirstDataRendered();
            this.suppressEvents = false;
            this.dispatchStateUpdateEvent(['gridInitializing']);
        });
    }
    getState() {
        return this.cachedState;
    }
    setupStateOnGridReady() {
        // sidebar reads the initial state itself, so don't need to set
        this.updateCachedState('sideBar', this.getSideBarState());
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED, () => this.updateCachedState('sideBar', this.getSideBarState()));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SIDE_BAR_UPDATED, () => this.updateCachedState('sideBar', this.getSideBarState()));
    }
    setupStateOnColumnsInitialised() {
        var _a;
        const initialState = (_a = this.gridOptionsService.get('initialState')) !== null && _a !== void 0 ? _a : {};
        const { filter: filterState, columnGroup: columnGroupState } = initialState;
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
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_VALUE_CHANGED, () => this.updateColumnState(['aggregation']));
        // columnOrder
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_MOVED, () => this.updateColumnState(['columnOrder']));
        // columnPinning
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_PINNED, () => this.updateColumnState(['columnPinning']));
        // columnSizing
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_RESIZED, () => this.updateColumnState(['columnSizing']));
        // columnVisibility
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_VISIBLE, () => this.updateColumnState(['columnVisibility']));
        // pivot
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_PIVOT_CHANGED, () => this.updateColumnState(['pivot']));
        // pivot
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => this.updateColumnState(['pivot']));
        // rowGroup
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.updateColumnState(['rowGroup']));
        // sort
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SORT_CHANGED, () => this.updateColumnState(['sort']));
        // any column
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_NEW_COLUMNS_LOADED, () => this.updateColumnState([
            'aggregation', 'columnOrder', 'columnPinning', 'columnSizing', 'columnVisibility', 'pivot', 'pivot', 'rowGroup', 'sort'
        ]));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_GROUP_OPENED, () => this.updateCachedState('columnGroup', this.getColumnGroupState()));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_FILTER_CHANGED, () => this.updateCachedState('filter', this.getFilterState()));
    }
    setupStateOnRowCountReady() {
        var _a;
        const { rowGroupExpansion: rowGroupExpansionState, rowSelection: rowSelectionState, pagination: paginationState } = (_a = this.gridOptionsService.get('initialState')) !== null && _a !== void 0 ? _a : {};
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
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_GROUP_OPENED, () => this.updateCachedState('rowGroupExpansion', this.getRowGroupExpansionState()));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SELECTION_CHANGED, () => this.updateCachedState('rowSelection', this.getRowSelectionState()));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_PAGINATION_CHANGED, (event) => {
            if (event.newPage || event.newPageSize) {
                this.updateCachedState('pagination', this.getPaginationState());
            }
        });
    }
    setupStateOnFirstDataRendered() {
        var _a;
        const { scroll: scrollState, rangeSelection: rangeSelectionState, focusedCell: focusedCellState } = (_a = this.gridOptionsService.get('initialState')) !== null && _a !== void 0 ? _a : {};
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
        this.updateCachedState('focusedCell', this.getFocusedCellState());
        this.updateCachedState('rangeSelection', this.getRangeSelectionState());
        this.updateCachedState('scroll', this.getScrollState());
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_CELL_FOCUSED, () => this.updateCachedState('focusedCell', this.getFocusedCellState()));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_RANGE_SELECTION_CHANGED, (event) => {
            if (event.finished) {
                this.updateCachedState('rangeSelection', this.getRangeSelectionState());
            }
        });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_BODY_SCROLL_END, () => this.updateCachedState('scroll', this.getScrollState()));
    }
    getColumnState() {
        const pivotMode = this.columnModel.isPivotMode();
        const sortColumns = [];
        const groupColumns = [];
        const aggregationColumns = [];
        const pivotColumns = [];
        const leftColumns = [];
        const rightColumns = [];
        const hiddenColumns = [];
        const columnSizes = [];
        const columns = [];
        const columnState = this.columnModel.getColumnState();
        for (let i = 0; i < columnState.length; i++) {
            const { colId, sort, sortIndex, rowGroup, rowGroupIndex, aggFunc, pivot, pivotIndex, pinned, hide, width, flex } = columnState[i];
            columns.push(colId);
            if (sort) {
                sortColumns[sortIndex !== null && sortIndex !== void 0 ? sortIndex : 0] = { colId, sort };
            }
            if (rowGroup) {
                groupColumns[rowGroupIndex !== null && rowGroupIndex !== void 0 ? rowGroupIndex : 0] = colId;
            }
            if (typeof aggFunc === 'string') {
                aggregationColumns.push({ colId, aggFunc });
            }
            if (pivot) {
                pivotColumns[pivotIndex !== null && pivotIndex !== void 0 ? pivotIndex : 0] = colId;
            }
            if (pinned) {
                (pinned === 'right' ? rightColumns : leftColumns).push(colId);
            }
            if (hide) {
                hiddenColumns.push(colId);
            }
            if (flex || width) {
                columnSizes.push({ colId, flex: flex !== null && flex !== void 0 ? flex : undefined, width });
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
    setColumnState(initialState) {
        const { sort: sortState, rowGroup: groupState, aggregation: aggregationState, pivot: pivotState, columnPinning: columnPinningState, columnVisibility: columnVisibilityState, columnSizing: columnSizingState, columnOrder: columnOrderState } = initialState;
        const columnStateMap = {};
        const defaultState = {};
        const getColumnState = (colId) => {
            let columnState = columnStateMap[colId];
            if (columnState) {
                return columnState;
            }
            columnState = { colId };
            columnStateMap[colId] = columnState;
            return columnState;
        };
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
                columnState.flex = flex !== null && flex !== void 0 ? flex : null;
                columnState.width = width;
            });
            defaultState.flex = null;
        }
        const columns = columnOrderState === null || columnOrderState === void 0 ? void 0 : columnOrderState.orderedColIds;
        const applyOrder = !!(columns === null || columns === void 0 ? void 0 : columns.length);
        const columnStates = applyOrder ? columns.map(colId => getColumnState(colId)) : Object.values(columnStateMap);
        if (columnStates.length) {
            this.columnModel.applyColumnState({
                state: columnStates,
                applyOrder,
                defaultState
            }, 'gridInitializing');
        }
    }
    getColumnGroupState() {
        const columnGroupState = this.columnModel.getColumnGroupState();
        const openColumnGroups = [];
        columnGroupState.forEach(({ groupId, open }) => {
            if (open) {
                openColumnGroups.push(groupId);
            }
        });
        return openColumnGroups.length ? { openColumnGroupIds: openColumnGroups } : undefined;
    }
    setColumnGroupState(columnGroupState) {
        const { openColumnGroupIds: openColumnGroups } = columnGroupState;
        const openColumnGroupSet = new Set(openColumnGroups);
        const existingColumnGroupState = this.columnModel.getColumnGroupState();
        const stateItems = existingColumnGroupState.map(({ groupId }) => ({
            groupId,
            open: openColumnGroupSet.has(groupId)
        }));
        this.columnModel.setColumnGroupState(stateItems, 'gridInitializing');
    }
    getFilterState() {
        var _a;
        let filterModel = this.filterManager.getFilterModel();
        if (filterModel && Object.keys(filterModel).length === 0) {
            filterModel = undefined;
        }
        const advancedFilterModel = (_a = this.filterManager.getAdvancedFilterModel()) !== null && _a !== void 0 ? _a : undefined;
        return filterModel || advancedFilterModel ? { filterModel, advancedFilterModel } : undefined;
    }
    setFilterState(filterState, gridOptionAdvancedFilterModel) {
        const { filterModel, advancedFilterModel } = filterState !== null && filterState !== void 0 ? filterState : { advancedFilterModel: gridOptionAdvancedFilterModel };
        if (filterModel) {
            this.filterManager.setFilterModel(filterModel, 'columnFilter');
        }
        if (advancedFilterModel) {
            this.filterManager.setAdvancedFilterModel(advancedFilterModel);
        }
    }
    getRangeSelectionState() {
        var _a;
        const cellRanges = (_a = this.rangeService) === null || _a === void 0 ? void 0 : _a.getCellRanges().map(cellRange => {
            const { id, type, startRow, endRow, columns, startColumn } = cellRange;
            return {
                id,
                type,
                startRow,
                endRow,
                colIds: columns.map(column => column.getColId()),
                startColId: startColumn.getColId()
            };
        });
        return (cellRanges === null || cellRanges === void 0 ? void 0 : cellRanges.length) ? { cellRanges } : undefined;
    }
    setRangeSelectionState(rangeSelectionState) {
        var _a;
        if (!this.gridOptionsService.get('enableRangeSelection')) {
            return;
        }
        const cellRanges = rangeSelectionState.cellRanges.map(cellRange => (Object.assign(Object.assign({}, cellRange), { columns: cellRange.colIds.map(colId => this.columnModel.getGridColumn(colId)), startColumn: this.columnModel.getGridColumn(cellRange.startColId) })));
        (_a = this.rangeService) === null || _a === void 0 ? void 0 : _a.setCellRanges(cellRanges);
    }
    getScrollState() {
        var _a, _b, _c;
        if (!this.isClientSideRowModel) {
            // can't restore, so don't provide
            return undefined;
        }
        const scrollFeature = (_a = this.ctrlsService.getGridBodyCtrl()) === null || _a === void 0 ? void 0 : _a.getScrollFeature();
        const { left } = (_b = scrollFeature === null || scrollFeature === void 0 ? void 0 : scrollFeature.getHScrollPosition()) !== null && _b !== void 0 ? _b : { left: 0 };
        const { top } = (_c = scrollFeature === null || scrollFeature === void 0 ? void 0 : scrollFeature.getVScrollPosition()) !== null && _c !== void 0 ? _c : { top: 0 };
        return top || left ? {
            top,
            left
        } : undefined;
    }
    setScrollState(scrollState) {
        var _a;
        if (!this.isClientSideRowModel) {
            return;
        }
        const { top, left } = scrollState;
        (_a = this.ctrlsService.getGridBodyCtrl()) === null || _a === void 0 ? void 0 : _a.getScrollFeature().setScrollPosition(top, left);
    }
    getSideBarState() {
        var _a, _b;
        return (_b = (_a = this.sideBarService) === null || _a === void 0 ? void 0 : _a.getSideBarComp()) === null || _b === void 0 ? void 0 : _b.getState();
    }
    getFocusedCellState() {
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
    setFocusedCellState(focusedCellState) {
        if (!this.isClientSideRowModel) {
            return;
        }
        const { colId, rowIndex, rowPinned } = focusedCellState;
        this.focusService.setFocusedCell({
            column: this.columnModel.getGridColumn(colId),
            rowIndex,
            rowPinned,
            forceBrowserFocus: true,
            preventScrollOnBrowserFocus: true
        });
    }
    getPaginationState() {
        const page = this.paginationProxy.getCurrentPage();
        const pageSize = !this.gridOptionsService.get('paginationAutoPageSize')
            ? this.paginationProxy.getPageSize() : undefined;
        if (!page && !pageSize) {
            return;
        }
        return { page, pageSize };
    }
    setPaginationState(paginationState) {
        if (paginationState.pageSize && !this.gridOptionsService.get('paginationAutoPageSize')) {
            this.paginationProxy.setPageSize(paginationState.pageSize, 'initialState');
        }
        if (typeof paginationState.page === 'number') {
            this.paginationProxy.setPage(paginationState.page);
        }
    }
    getRowSelectionState() {
        var _a;
        const selectionState = this.selectionService.getSelectionState();
        const noSelections = !selectionState || (!Array.isArray(selectionState) &&
            (selectionState.selectAll === false ||
                selectionState.selectAllChildren === false) && !((_a = selectionState === null || selectionState === void 0 ? void 0 : selectionState.toggledNodes) === null || _a === void 0 ? void 0 : _a.length));
        return noSelections ? undefined : selectionState;
    }
    setRowSelectionState(rowSelectionState) {
        this.selectionService.setSelectionState(rowSelectionState, 'gridInitializing');
    }
    getRowGroupExpansionState() {
        const expandedRowGroups = this.expansionService.getExpandedRows();
        return expandedRowGroups.length ? {
            expandedRowGroupIds: expandedRowGroups
        } : undefined;
    }
    setRowGroupExpansionState(rowGroupExpansionState) {
        this.expansionService.expandRows(rowGroupExpansionState.expandedRowGroupIds);
    }
    updateColumnState(features) {
        const newColumnState = this.getColumnState();
        let hasChanged = false;
        Object.entries(newColumnState).forEach(([key, value]) => {
            if (!(0, generic_1.jsonEquals)(value, this.cachedState[key])) {
                hasChanged = true;
            }
        });
        this.cachedState = Object.assign(Object.assign({}, this.cachedState), newColumnState);
        if (hasChanged) {
            this.dispatchStateUpdateEvent(features);
        }
    }
    updateCachedState(key, value) {
        const existingValue = this.cachedState[key];
        this.cachedState = Object.assign(Object.assign({}, this.cachedState), { [key]: value });
        if (!(0, generic_1.jsonEquals)(value, existingValue)) {
            this.dispatchStateUpdateEvent([key]);
        }
    }
    dispatchStateUpdateEvent(sources) {
        if (this.suppressEvents) {
            return;
        }
        sources.forEach(source => this.queuedUpdateSources.add(source));
        this.dispatchStateUpdateEventDebounced();
    }
    dispatchQueuedStateUpdateEvents() {
        const sources = Array.from(this.queuedUpdateSources);
        this.queuedUpdateSources.clear();
        const event = {
            type: eventKeys_1.Events.EVENT_STATE_UPDATED,
            sources,
            state: this.cachedState
        };
        this.eventService.dispatchEvent(event);
    }
};
__decorate([
    (0, context_1.Autowired)('filterManager')
], StateService.prototype, "filterManager", void 0);
__decorate([
    (0, context_1.Optional)('rangeService')
], StateService.prototype, "rangeService", void 0);
__decorate([
    (0, context_1.Autowired)('ctrlsService')
], StateService.prototype, "ctrlsService", void 0);
__decorate([
    (0, context_1.Optional)('sideBarService')
], StateService.prototype, "sideBarService", void 0);
__decorate([
    (0, context_1.Autowired)('focusService')
], StateService.prototype, "focusService", void 0);
__decorate([
    (0, context_1.Autowired)('columnModel')
], StateService.prototype, "columnModel", void 0);
__decorate([
    (0, context_1.Autowired)('paginationProxy')
], StateService.prototype, "paginationProxy", void 0);
__decorate([
    (0, context_1.Autowired)('rowModel')
], StateService.prototype, "rowModel", void 0);
__decorate([
    (0, context_1.Autowired)('selectionService')
], StateService.prototype, "selectionService", void 0);
__decorate([
    (0, context_1.Autowired)('expansionService')
], StateService.prototype, "expansionService", void 0);
__decorate([
    context_1.PostConstruct
], StateService.prototype, "postConstruct", null);
StateService = __decorate([
    (0, context_1.Bean)('stateService')
], StateService);
exports.StateService = StateService;
