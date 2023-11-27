var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
import { jsonEquals } from "../utils/generic";
import { debounce } from "../utils/function";
var StateService = /** @class */ (function (_super) {
    __extends(StateService, _super);
    function StateService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.suppressEvents = true;
        _this.queuedUpdateSources = new Set();
        _this.dispatchStateUpdateEventDebounced = debounce(function () { return _this.dispatchQueuedStateUpdateEvents(); }, 0);
        return _this;
    }
    StateService.prototype.postConstruct = function () {
        var _this = this;
        var _a;
        this.isClientSideRowModel = this.rowModel.getType() === 'clientSide';
        this.cachedState = (_a = this.gridOptionsService.get('initialState')) !== null && _a !== void 0 ? _a : {};
        this.ctrlsService.whenReady(function () { return _this.setupStateOnGridReady(); });
        var newColumnsLoadedDestroyFunc = this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, function (_a) {
            var source = _a.source;
            if (source === 'gridInitializing') {
                newColumnsLoadedDestroyFunc === null || newColumnsLoadedDestroyFunc === void 0 ? void 0 : newColumnsLoadedDestroyFunc();
                _this.setupStateOnColumnsInitialised();
            }
        });
        var rowCountReadyDestroyFunc = this.addManagedListener(this.eventService, Events.EVENT_ROW_COUNT_READY, function () {
            rowCountReadyDestroyFunc === null || rowCountReadyDestroyFunc === void 0 ? void 0 : rowCountReadyDestroyFunc();
            _this.setupStateOnRowCountReady();
        });
        var firstDataRenderedDestroyFunc = this.addManagedListener(this.eventService, Events.EVENT_FIRST_DATA_RENDERED, function () {
            firstDataRenderedDestroyFunc === null || firstDataRenderedDestroyFunc === void 0 ? void 0 : firstDataRenderedDestroyFunc();
            _this.setupStateOnFirstDataRendered();
            _this.suppressEvents = false;
            _this.dispatchStateUpdateEvent(['gridInitializing']);
        });
    };
    StateService.prototype.getState = function () {
        return this.cachedState;
    };
    StateService.prototype.setupStateOnGridReady = function () {
        // sidebar reads the initial state itself, so don't need to set
        var _this = this;
        this.updateCachedState('sideBar', this.getSideBarState());
        this.addManagedListener(this.eventService, Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED, function () { return _this.updateCachedState('sideBar', _this.getSideBarState()); });
        this.addManagedListener(this.eventService, Events.EVENT_SIDE_BAR_UPDATED, function () { return _this.updateCachedState('sideBar', _this.getSideBarState()); });
    };
    StateService.prototype.setupStateOnColumnsInitialised = function () {
        var _this = this;
        var _a;
        var initialState = (_a = this.gridOptionsService.get('initialState')) !== null && _a !== void 0 ? _a : {};
        var filterState = initialState.filter, columnGroupState = initialState.columnGroup;
        this.setColumnState(initialState);
        if (columnGroupState) {
            this.setColumnGroupState(columnGroupState);
        }
        var advancedFilterModel = this.gridOptionsService.get('advancedFilterModel');
        if (filterState || advancedFilterModel) {
            this.setFilterState(filterState, advancedFilterModel);
        }
        this.updateColumnState([
            'aggregation', 'columnOrder', 'columnPinning', 'columnSizing', 'columnVisibility', 'pivot', 'pivot', 'rowGroup', 'sort'
        ]);
        this.updateCachedState('columnGroup', this.getColumnGroupState());
        this.updateCachedState('filter', this.getFilterState());
        // aggregation
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, function () { return _this.updateColumnState(['aggregation']); });
        // columnOrder
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, function () { return _this.updateColumnState(['columnOrder']); });
        // columnPinning
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, function () { return _this.updateColumnState(['columnPinning']); });
        // columnSizing
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_RESIZED, function () { return _this.updateColumnState(['columnSizing']); });
        // columnVisibility
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, function () { return _this.updateColumnState(['columnVisibility']); });
        // pivot
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, function () { return _this.updateColumnState(['pivot']); });
        // pivot
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, function () { return _this.updateColumnState(['pivot']); });
        // rowGroup
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, function () { return _this.updateColumnState(['rowGroup']); });
        // sort
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, function () { return _this.updateColumnState(['sort']); });
        // any column
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, function () { return _this.updateColumnState([
            'aggregation', 'columnOrder', 'columnPinning', 'columnSizing', 'columnVisibility', 'pivot', 'pivot', 'rowGroup', 'sort'
        ]); });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_GROUP_OPENED, function () { return _this.updateCachedState('columnGroup', _this.getColumnGroupState()); });
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, function () { return _this.updateCachedState('filter', _this.getFilterState()); });
    };
    StateService.prototype.setupStateOnRowCountReady = function () {
        var _this = this;
        var _a;
        var _b = (_a = this.gridOptionsService.get('initialState')) !== null && _a !== void 0 ? _a : {}, rowGroupExpansionState = _b.rowGroupExpansion, rowSelectionState = _b.rowSelection, paginationState = _b.pagination;
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
        this.addManagedListener(this.eventService, Events.EVENT_ROW_GROUP_OPENED, function () { return _this.updateCachedState('rowGroupExpansion', _this.getRowGroupExpansionState()); });
        this.addManagedListener(this.eventService, Events.EVENT_SELECTION_CHANGED, function () { return _this.updateCachedState('rowSelection', _this.getRowSelectionState()); });
        this.addManagedListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, function (event) {
            if (event.newPage || event.newPageSize) {
                _this.updateCachedState('pagination', _this.getPaginationState());
            }
        });
    };
    StateService.prototype.setupStateOnFirstDataRendered = function () {
        var _this = this;
        var _a;
        var _b = (_a = this.gridOptionsService.get('initialState')) !== null && _a !== void 0 ? _a : {}, scrollState = _b.scroll, rangeSelectionState = _b.rangeSelection, focusedCellState = _b.focusedCell;
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
        this.addManagedListener(this.eventService, Events.EVENT_CELL_FOCUSED, function () { return _this.updateCachedState('focusedCell', _this.getFocusedCellState()); });
        this.addManagedListener(this.eventService, Events.EVENT_RANGE_SELECTION_CHANGED, function (event) {
            if (event.finished) {
                _this.updateCachedState('rangeSelection', _this.getRangeSelectionState());
            }
        });
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL_END, function () { return _this.updateCachedState('scroll', _this.getScrollState()); });
    };
    StateService.prototype.getColumnState = function () {
        var pivotMode = this.columnModel.isPivotMode();
        var sortColumns = [];
        var groupColumns = [];
        var aggregationColumns = [];
        var pivotColumns = [];
        var leftColumns = [];
        var rightColumns = [];
        var hiddenColumns = [];
        var columnSizes = [];
        var columns = [];
        var columnState = this.columnModel.getColumnState();
        for (var i = 0; i < columnState.length; i++) {
            var _a = columnState[i], colId = _a.colId, sort = _a.sort, sortIndex = _a.sortIndex, rowGroup = _a.rowGroup, rowGroupIndex = _a.rowGroupIndex, aggFunc = _a.aggFunc, pivot = _a.pivot, pivotIndex = _a.pivotIndex, pinned = _a.pinned, hide = _a.hide, width = _a.width, flex = _a.flex;
            columns.push(colId);
            if (sort) {
                sortColumns[sortIndex !== null && sortIndex !== void 0 ? sortIndex : 0] = { colId: colId, sort: sort };
            }
            if (rowGroup) {
                groupColumns[rowGroupIndex !== null && rowGroupIndex !== void 0 ? rowGroupIndex : 0] = colId;
            }
            if (typeof aggFunc === 'string') {
                aggregationColumns.push({ colId: colId, aggFunc: aggFunc });
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
                columnSizes.push({ colId: colId, flex: flex !== null && flex !== void 0 ? flex : undefined, width: width });
            }
        }
        return {
            sort: sortColumns.length ? { sortModel: sortColumns } : undefined,
            rowGroup: groupColumns.length ? { groupColIds: groupColumns } : undefined,
            aggregation: aggregationColumns.length ? { aggregationModel: aggregationColumns } : undefined,
            pivot: pivotColumns.length || pivotMode ? { pivotMode: pivotMode, pivotColIds: pivotColumns } : undefined,
            columnPinning: leftColumns.length || rightColumns.length ? { leftColIds: leftColumns, rightColIds: rightColumns } : undefined,
            columnVisibility: hiddenColumns.length ? { hiddenColIds: hiddenColumns } : undefined,
            columnSizing: columnSizes.length ? { columnSizingModel: columnSizes } : undefined,
            columnOrder: columns.length ? { orderedColIds: columns } : undefined
        };
    };
    StateService.prototype.setColumnState = function (initialState) {
        var sortState = initialState.sort, groupState = initialState.rowGroup, aggregationState = initialState.aggregation, pivotState = initialState.pivot, columnPinningState = initialState.columnPinning, columnVisibilityState = initialState.columnVisibility, columnSizingState = initialState.columnSizing, columnOrderState = initialState.columnOrder;
        var columnStateMap = {};
        var defaultState = {};
        var getColumnState = function (colId) {
            var columnState = columnStateMap[colId];
            if (columnState) {
                return columnState;
            }
            columnState = { colId: colId };
            columnStateMap[colId] = columnState;
            return columnState;
        };
        if (sortState) {
            sortState.sortModel.forEach(function (_a, sortIndex) {
                var colId = _a.colId, sort = _a.sort;
                var columnState = getColumnState(colId);
                columnState.sort = sort;
                columnState.sortIndex = sortIndex;
            });
            defaultState.sort = null;
            defaultState.sortIndex = null;
        }
        if (groupState) {
            groupState.groupColIds.forEach(function (colId, rowGroupIndex) {
                var columnState = getColumnState(colId);
                columnState.rowGroup = true;
                columnState.rowGroupIndex = rowGroupIndex;
            });
            defaultState.rowGroup = null;
            defaultState.rowGroupIndex = null;
        }
        if (aggregationState) {
            aggregationState.aggregationModel.forEach(function (_a) {
                var colId = _a.colId, aggFunc = _a.aggFunc;
                getColumnState(colId).aggFunc = aggFunc;
            });
            defaultState.aggFunc = null;
        }
        if (pivotState) {
            pivotState.pivotColIds.forEach(function (colId, pivotIndex) {
                var columnState = getColumnState(colId);
                columnState.pivot = true;
                columnState.pivotIndex = pivotIndex;
            });
            defaultState.pivot = null;
            defaultState.pivotIndex = null;
            this.columnModel.setPivotMode(pivotState.pivotMode);
        }
        if (columnPinningState) {
            columnPinningState.leftColIds.forEach(function (colId) {
                getColumnState(colId).pinned = 'left';
            });
            columnPinningState.rightColIds.forEach(function (colId) {
                getColumnState(colId).pinned = 'right';
            });
            defaultState.pinned = null;
        }
        if (columnVisibilityState) {
            columnVisibilityState.hiddenColIds.forEach(function (colId) {
                getColumnState(colId).hide = true;
            });
            defaultState.hide = null;
        }
        if (columnSizingState) {
            columnSizingState.columnSizingModel.forEach(function (_a) {
                var colId = _a.colId, flex = _a.flex, width = _a.width;
                var columnState = getColumnState(colId);
                columnState.flex = flex !== null && flex !== void 0 ? flex : null;
                columnState.width = width;
            });
            defaultState.flex = null;
        }
        var columns = columnOrderState === null || columnOrderState === void 0 ? void 0 : columnOrderState.orderedColIds;
        var applyOrder = !!(columns === null || columns === void 0 ? void 0 : columns.length);
        var columnStates = applyOrder ? columns.map(function (colId) { return getColumnState(colId); }) : Object.values(columnStateMap);
        if (columnStates.length) {
            this.columnModel.applyColumnState({
                state: columnStates,
                applyOrder: applyOrder,
                defaultState: defaultState
            }, 'gridInitializing');
        }
    };
    StateService.prototype.getColumnGroupState = function () {
        var columnGroupState = this.columnModel.getColumnGroupState();
        var openColumnGroups = [];
        columnGroupState.forEach(function (_a) {
            var groupId = _a.groupId, open = _a.open;
            if (open) {
                openColumnGroups.push(groupId);
            }
        });
        return openColumnGroups.length ? { openColumnGroupIds: openColumnGroups } : undefined;
    };
    StateService.prototype.setColumnGroupState = function (columnGroupState) {
        var openColumnGroups = columnGroupState.openColumnGroupIds;
        var openColumnGroupSet = new Set(openColumnGroups);
        var existingColumnGroupState = this.columnModel.getColumnGroupState();
        var stateItems = existingColumnGroupState.map(function (_a) {
            var groupId = _a.groupId;
            return ({
                groupId: groupId,
                open: openColumnGroupSet.has(groupId)
            });
        });
        this.columnModel.setColumnGroupState(stateItems, 'gridInitializing');
    };
    StateService.prototype.getFilterState = function () {
        var _a;
        var filterModel = this.filterManager.getFilterModel();
        if (filterModel && Object.keys(filterModel).length === 0) {
            filterModel = undefined;
        }
        var advancedFilterModel = (_a = this.filterManager.getAdvancedFilterModel()) !== null && _a !== void 0 ? _a : undefined;
        return filterModel || advancedFilterModel ? { filterModel: filterModel, advancedFilterModel: advancedFilterModel } : undefined;
    };
    StateService.prototype.setFilterState = function (filterState, gridOptionAdvancedFilterModel) {
        var _a = filterState !== null && filterState !== void 0 ? filterState : { advancedFilterModel: gridOptionAdvancedFilterModel }, filterModel = _a.filterModel, advancedFilterModel = _a.advancedFilterModel;
        if (filterModel) {
            this.filterManager.setFilterModel(filterModel, 'columnFilter');
        }
        if (advancedFilterModel) {
            this.filterManager.setAdvancedFilterModel(advancedFilterModel);
        }
    };
    StateService.prototype.getRangeSelectionState = function () {
        var _a;
        var cellRanges = (_a = this.rangeService) === null || _a === void 0 ? void 0 : _a.getCellRanges().map(function (cellRange) {
            var id = cellRange.id, type = cellRange.type, startRow = cellRange.startRow, endRow = cellRange.endRow, columns = cellRange.columns, startColumn = cellRange.startColumn;
            return {
                id: id,
                type: type,
                startRow: startRow,
                endRow: endRow,
                colIds: columns.map(function (column) { return column.getColId(); }),
                startColId: startColumn.getColId()
            };
        });
        return (cellRanges === null || cellRanges === void 0 ? void 0 : cellRanges.length) ? { cellRanges: cellRanges } : undefined;
    };
    StateService.prototype.setRangeSelectionState = function (rangeSelectionState) {
        var _this = this;
        var _a;
        if (!this.gridOptionsService.get('enableRangeSelection')) {
            return;
        }
        var cellRanges = rangeSelectionState.cellRanges.map(function (cellRange) { return (__assign(__assign({}, cellRange), { columns: cellRange.colIds.map(function (colId) { return _this.columnModel.getGridColumn(colId); }), startColumn: _this.columnModel.getGridColumn(cellRange.startColId) })); });
        (_a = this.rangeService) === null || _a === void 0 ? void 0 : _a.setCellRanges(cellRanges);
    };
    StateService.prototype.getScrollState = function () {
        var _a, _b, _c;
        if (!this.isClientSideRowModel) {
            // can't restore, so don't provide
            return undefined;
        }
        var scrollFeature = (_a = this.ctrlsService.getGridBodyCtrl()) === null || _a === void 0 ? void 0 : _a.getScrollFeature();
        var left = ((_b = scrollFeature === null || scrollFeature === void 0 ? void 0 : scrollFeature.getHScrollPosition()) !== null && _b !== void 0 ? _b : { left: 0 }).left;
        var top = ((_c = scrollFeature === null || scrollFeature === void 0 ? void 0 : scrollFeature.getVScrollPosition()) !== null && _c !== void 0 ? _c : { top: 0 }).top;
        return top || left ? {
            top: top,
            left: left
        } : undefined;
    };
    StateService.prototype.setScrollState = function (scrollState) {
        var _a;
        if (!this.isClientSideRowModel) {
            return;
        }
        var top = scrollState.top, left = scrollState.left;
        (_a = this.ctrlsService.getGridBodyCtrl()) === null || _a === void 0 ? void 0 : _a.getScrollFeature().setScrollPosition(top, left);
    };
    StateService.prototype.getSideBarState = function () {
        var _a, _b;
        return (_b = (_a = this.sideBarService) === null || _a === void 0 ? void 0 : _a.getSideBarComp()) === null || _b === void 0 ? void 0 : _b.getState();
    };
    StateService.prototype.getFocusedCellState = function () {
        if (!this.isClientSideRowModel) {
            // can't restore, so don't provide
            return undefined;
        }
        var focusedCell = this.focusService.getFocusedCell();
        if (focusedCell) {
            var column = focusedCell.column, rowIndex = focusedCell.rowIndex, rowPinned = focusedCell.rowPinned;
            return {
                colId: column.getColId(),
                rowIndex: rowIndex,
                rowPinned: rowPinned
            };
        }
        return undefined;
    };
    StateService.prototype.setFocusedCellState = function (focusedCellState) {
        if (!this.isClientSideRowModel) {
            return;
        }
        var colId = focusedCellState.colId, rowIndex = focusedCellState.rowIndex, rowPinned = focusedCellState.rowPinned;
        this.focusService.setFocusedCell({
            column: this.columnModel.getGridColumn(colId),
            rowIndex: rowIndex,
            rowPinned: rowPinned,
            forceBrowserFocus: true,
            preventScrollOnBrowserFocus: true
        });
    };
    StateService.prototype.getPaginationState = function () {
        var page = this.paginationProxy.getCurrentPage();
        var pageSize = !this.gridOptionsService.get('paginationAutoPageSize')
            ? this.paginationProxy.getPageSize() : undefined;
        if (!page && !pageSize) {
            return;
        }
        return { page: page, pageSize: pageSize };
    };
    StateService.prototype.setPaginationState = function (paginationState) {
        if (paginationState.pageSize && !this.gridOptionsService.get('paginationAutoPageSize')) {
            this.paginationProxy.setPageSize(paginationState.pageSize, 'initialState');
        }
        if (typeof paginationState.page === 'number') {
            this.paginationProxy.setPage(paginationState.page);
        }
    };
    StateService.prototype.getRowSelectionState = function () {
        var _a;
        var selectionState = this.selectionService.getSelectionState();
        var noSelections = !selectionState || (!Array.isArray(selectionState) &&
            (selectionState.selectAll === false ||
                selectionState.selectAllChildren === false) && !((_a = selectionState === null || selectionState === void 0 ? void 0 : selectionState.toggledNodes) === null || _a === void 0 ? void 0 : _a.length));
        return noSelections ? undefined : selectionState;
    };
    StateService.prototype.setRowSelectionState = function (rowSelectionState) {
        this.selectionService.setSelectionState(rowSelectionState, 'gridInitializing');
    };
    StateService.prototype.getRowGroupExpansionState = function () {
        var expandedRowGroups = this.expansionService.getExpandedRows();
        return expandedRowGroups.length ? {
            expandedRowGroupIds: expandedRowGroups
        } : undefined;
    };
    StateService.prototype.setRowGroupExpansionState = function (rowGroupExpansionState) {
        this.expansionService.expandRows(rowGroupExpansionState.expandedRowGroupIds);
    };
    StateService.prototype.updateColumnState = function (features) {
        var _this = this;
        var newColumnState = this.getColumnState();
        var hasChanged = false;
        Object.entries(newColumnState).forEach(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            if (!jsonEquals(value, _this.cachedState[key])) {
                hasChanged = true;
            }
        });
        this.cachedState = __assign(__assign({}, this.cachedState), newColumnState);
        if (hasChanged) {
            this.dispatchStateUpdateEvent(features);
        }
    };
    StateService.prototype.updateCachedState = function (key, value) {
        var _a;
        var existingValue = this.cachedState[key];
        this.cachedState = __assign(__assign({}, this.cachedState), (_a = {}, _a[key] = value, _a));
        if (!jsonEquals(value, existingValue)) {
            this.dispatchStateUpdateEvent([key]);
        }
    };
    StateService.prototype.dispatchStateUpdateEvent = function (sources) {
        var _this = this;
        if (this.suppressEvents) {
            return;
        }
        sources.forEach(function (source) { return _this.queuedUpdateSources.add(source); });
        this.dispatchStateUpdateEventDebounced();
    };
    StateService.prototype.dispatchQueuedStateUpdateEvents = function () {
        var sources = Array.from(this.queuedUpdateSources);
        this.queuedUpdateSources.clear();
        var event = {
            type: Events.EVENT_STATE_UPDATED,
            sources: sources,
            state: this.cachedState
        };
        this.eventService.dispatchEvent(event);
    };
    __decorate([
        Autowired('filterManager')
    ], StateService.prototype, "filterManager", void 0);
    __decorate([
        Optional('rangeService')
    ], StateService.prototype, "rangeService", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], StateService.prototype, "ctrlsService", void 0);
    __decorate([
        Optional('sideBarService')
    ], StateService.prototype, "sideBarService", void 0);
    __decorate([
        Autowired('focusService')
    ], StateService.prototype, "focusService", void 0);
    __decorate([
        Autowired('columnModel')
    ], StateService.prototype, "columnModel", void 0);
    __decorate([
        Autowired('paginationProxy')
    ], StateService.prototype, "paginationProxy", void 0);
    __decorate([
        Autowired('rowModel')
    ], StateService.prototype, "rowModel", void 0);
    __decorate([
        Autowired('selectionService')
    ], StateService.prototype, "selectionService", void 0);
    __decorate([
        Autowired('expansionService')
    ], StateService.prototype, "expansionService", void 0);
    __decorate([
        PostConstruct
    ], StateService.prototype, "postConstruct", null);
    StateService = __decorate([
        Bean('stateService')
    ], StateService);
    return StateService;
}(BeanStub));
export { StateService };
