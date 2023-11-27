"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortController = void 0;
var context_1 = require("./context/context");
var beanStub_1 = require("./context/beanStub");
var events_1 = require("./events");
var SortController = /** @class */ (function (_super) {
    __extends(SortController, _super);
    function SortController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortController_1 = SortController;
    SortController.prototype.progressSort = function (column, multiSort, source) {
        var nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort, source);
    };
    SortController.prototype.setSortForColumn = function (column, sort, multiSort, source) {
        // auto correct - if sort not legal value, then set it to 'no sort' (which is null)
        if (sort !== 'asc' && sort !== 'desc') {
            sort = null;
        }
        var isColumnsSortingCoupledToGroup = this.gridOptionsService.isColumnsSortingCoupledToGroup();
        var columnsToUpdate = [column];
        if (isColumnsSortingCoupledToGroup) {
            if (column.getColDef().showRowGroup) {
                var rowGroupColumns = this.columnModel.getSourceColumnsForGroupColumn(column);
                var sortableRowGroupColumns = rowGroupColumns === null || rowGroupColumns === void 0 ? void 0 : rowGroupColumns.filter(function (col) { return col.isSortable(); });
                if (sortableRowGroupColumns) {
                    columnsToUpdate = __spreadArray([column], __read(sortableRowGroupColumns), false);
                }
            }
        }
        columnsToUpdate.forEach(function (col) { return col.setSort(sort, source); });
        var doingMultiSort = (multiSort || this.gridOptionsService.get('alwaysMultiSort')) && !this.gridOptionsService.get('suppressMultiSort');
        // clear sort on all columns except those changed, and update the icons
        if (!doingMultiSort) {
            this.clearSortBarTheseColumns(columnsToUpdate, source);
        }
        // sortIndex used for knowing order of cols when multi-col sort
        this.updateSortIndex(column);
        this.dispatchSortChangedEvents(source);
    };
    SortController.prototype.updateSortIndex = function (lastColToChange) {
        var isCoupled = this.gridOptionsService.isColumnsSortingCoupledToGroup();
        var groupParent = this.columnModel.getGroupDisplayColumnForGroup(lastColToChange.getId());
        var lastSortIndexCol = isCoupled ? groupParent || lastColToChange : lastColToChange;
        var allSortedCols = this.getColumnsWithSortingOrdered();
        // reset sort index on everything
        this.columnModel.getPrimaryAndSecondaryAndAutoColumns().forEach(function (col) { return col.setSortIndex(null); });
        var allSortedColsWithoutChanges = allSortedCols.filter(function (col) { return col !== lastSortIndexCol; });
        var sortedColsWithIndices = !!lastSortIndexCol.getSort() ? __spreadArray(__spreadArray([], __read(allSortedColsWithoutChanges), false), [lastSortIndexCol], false) : allSortedColsWithoutChanges;
        sortedColsWithIndices.forEach(function (col, idx) { return (col.setSortIndex(idx)); });
    };
    // gets called by API, so if data changes, use can call this, which will end up
    // working out the sort order again of the rows.
    SortController.prototype.onSortChanged = function (source) {
        this.dispatchSortChangedEvents(source);
    };
    SortController.prototype.isSortActive = function () {
        // pull out all the columns that have sorting set
        var allCols = this.columnModel.getPrimaryAndSecondaryAndAutoColumns();
        var sortedCols = allCols.filter(function (column) { return !!column.getSort(); });
        return sortedCols && sortedCols.length > 0;
    };
    SortController.prototype.dispatchSortChangedEvents = function (source) {
        var event = {
            type: events_1.Events.EVENT_SORT_CHANGED,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    SortController.prototype.clearSortBarTheseColumns = function (columnsToSkip, source) {
        this.columnModel.getPrimaryAndSecondaryAndAutoColumns().forEach(function (columnToClear) {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!columnsToSkip.includes(columnToClear)) {
                // setting to 'undefined' as null means 'none' rather than cleared, otherwise issue will arise
                // if sort order is: ['desc', null , 'asc'], as it will start at null rather than 'desc'.
                columnToClear.setSort(undefined, source);
            }
        });
    };
    SortController.prototype.getNextSortDirection = function (column) {
        var sortingOrder;
        if (column.getColDef().sortingOrder) {
            sortingOrder = column.getColDef().sortingOrder;
        }
        else if (this.gridOptionsService.get('sortingOrder')) {
            sortingOrder = this.gridOptionsService.get('sortingOrder');
        }
        else {
            sortingOrder = SortController_1.DEFAULT_SORTING_ORDER;
        }
        if (!Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
            console.warn("AG Grid: sortingOrder must be an array with at least one element, currently it's ".concat(sortingOrder));
            return null;
        }
        var currentIndex = sortingOrder.indexOf(column.getSort());
        var notInArray = currentIndex < 0;
        var lastItemInArray = currentIndex == sortingOrder.length - 1;
        var result;
        if (notInArray || lastItemInArray) {
            result = sortingOrder[0];
        }
        else {
            result = sortingOrder[currentIndex + 1];
        }
        // verify the sort type exists, as the user could provide the sortingOrder, need to make sure it's valid
        if (SortController_1.DEFAULT_SORTING_ORDER.indexOf(result) < 0) {
            console.warn('AG Grid: invalid sort type ' + result);
            return null;
        }
        return result;
    };
    /**
     * @returns a map of sort indexes for every sorted column, if groups sort primaries then they will have equivalent indices
     */
    SortController.prototype.getIndexedSortMap = function () {
        var _this = this;
        // pull out all the columns that have sorting set
        var allSortedCols = this.columnModel.getPrimaryAndSecondaryAndAutoColumns()
            .filter(function (col) { return !!col.getSort(); });
        if (this.columnModel.isPivotMode()) {
            var isSortingLinked_1 = this.gridOptionsService.isColumnsSortingCoupledToGroup();
            allSortedCols = allSortedCols.filter(function (col) {
                var isAggregated = !!col.getAggFunc();
                var isSecondary = !col.isPrimary();
                var isGroup = isSortingLinked_1 ? _this.columnModel.getGroupDisplayColumnForGroup(col.getId()) : col.getColDef().showRowGroup;
                return isAggregated || isSecondary || isGroup;
            });
        }
        var sortedRowGroupCols = this.columnModel.getRowGroupColumns()
            .filter(function (col) { return !!col.getSort(); });
        var isSortLinked = this.gridOptionsService.isColumnsSortingCoupledToGroup() && !!sortedRowGroupCols.length;
        if (isSortLinked) {
            allSortedCols = __spreadArray([], __read(new Set(
            // if linked sorting, replace all columns with the display group column for index purposes, and ensure uniqueness
            allSortedCols.map(function (col) { var _a; return (_a = _this.columnModel.getGroupDisplayColumnForGroup(col.getId())) !== null && _a !== void 0 ? _a : col; }))), false);
        }
        // when both cols are missing sortIndex, we use the position of the col in all cols list.
        // this means if colDefs only have sort, but no sortIndex, we deterministically pick which
        // cols is sorted by first.
        var allColsIndexes = {};
        allSortedCols.forEach(function (col, index) { return allColsIndexes[col.getId()] = index; });
        // put the columns in order of which one got sorted first
        allSortedCols.sort(function (a, b) {
            var iA = a.getSortIndex();
            var iB = b.getSortIndex();
            if (iA != null && iB != null) {
                return iA - iB; // both present, normal comparison
            }
            else if (iA == null && iB == null) {
                // both missing, compare using column positions
                var posA = allColsIndexes[a.getId()];
                var posB = allColsIndexes[b.getId()];
                return posA > posB ? 1 : -1;
            }
            else if (iB == null) {
                return -1; // iB missing
            }
            else {
                return 1; // iA missing
            }
        });
        var indexMap = new Map();
        allSortedCols.forEach(function (col, idx) { return indexMap.set(col, idx); });
        // add the row group cols back
        if (isSortLinked) {
            sortedRowGroupCols.forEach(function (col) {
                var groupDisplayCol = _this.columnModel.getGroupDisplayColumnForGroup(col.getId());
                indexMap.set(col, indexMap.get(groupDisplayCol));
            });
        }
        return indexMap;
    };
    SortController.prototype.getColumnsWithSortingOrdered = function () {
        // pull out all the columns that have sorting set
        return __spreadArray([], __read(this.getIndexedSortMap().entries()), false).sort(function (_a, _b) {
            var _c = __read(_a, 2), col1 = _c[0], idx1 = _c[1];
            var _d = __read(_b, 2), col2 = _d[0], idx2 = _d[1];
            return idx1 - idx2;
        })
            .map(function (_a) {
            var _b = __read(_a, 1), col = _b[0];
            return col;
        });
    };
    // used by server side row models, to sent sort to server
    SortController.prototype.getSortModel = function () {
        return this.getColumnsWithSortingOrdered()
            .filter(function (column) { return column.getSort(); })
            .map(function (column) { return ({
            sort: column.getSort(),
            colId: column.getId()
        }); });
    };
    SortController.prototype.getSortOptions = function () {
        return this.getColumnsWithSortingOrdered()
            .filter(function (column) { return column.getSort(); })
            .map(function (column) { return ({
            sort: column.getSort(),
            column: column
        }); });
    };
    SortController.prototype.canColumnDisplayMixedSort = function (column) {
        var isColumnSortCouplingActive = this.gridOptionsService.isColumnsSortingCoupledToGroup();
        var isGroupDisplayColumn = !!column.getColDef().showRowGroup;
        return isColumnSortCouplingActive && isGroupDisplayColumn;
    };
    SortController.prototype.getDisplaySortForColumn = function (column) {
        var linkedColumns = this.columnModel.getSourceColumnsForGroupColumn(column);
        if (!this.canColumnDisplayMixedSort(column) || !(linkedColumns === null || linkedColumns === void 0 ? void 0 : linkedColumns.length)) {
            return column.getSort();
        }
        // if column has unique data, its sorting is independent - but can still be mixed
        var columnHasUniqueData = column.getColDef().field != null || !!column.getColDef().valueGetter;
        var sortableColumns = columnHasUniqueData ? __spreadArray([column], __read(linkedColumns), false) : linkedColumns;
        var firstSort = sortableColumns[0].getSort();
        // the == is intentional, as null and undefined both represent no sort, which means they are equivalent
        var allMatch = sortableColumns.every(function (col) { return col.getSort() == firstSort; });
        if (!allMatch) {
            return 'mixed';
        }
        return firstSort;
    };
    SortController.prototype.getDisplaySortIndexForColumn = function (column) {
        return this.getIndexedSortMap().get(column);
    };
    var SortController_1;
    SortController.DEFAULT_SORTING_ORDER = ['asc', 'desc', null];
    __decorate([
        (0, context_1.Autowired)('columnModel')
    ], SortController.prototype, "columnModel", void 0);
    SortController = SortController_1 = __decorate([
        (0, context_1.Bean)('sortController')
    ], SortController);
    return SortController;
}(beanStub_1.BeanStub));
exports.SortController = SortController;
