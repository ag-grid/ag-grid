/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("./context/context");
var beanStub_1 = require("./context/beanStub");
var constants_1 = require("./constants/constants");
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
        var _a;
        // auto correct - if sort not legal value, then set it to 'no sort' (which is null)
        if (sort !== constants_1.Constants.SORT_ASC && sort !== constants_1.Constants.SORT_DESC) {
            sort = null;
        }
        var isColumnsSortingCoupledToGroup = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        var columnsToUpdate = [column];
        if (isColumnsSortingCoupledToGroup) {
            if (column.getColDef().showRowGroup) {
                var rowGroupColumns = this.columnModel.getSourceColumnsForGroupColumn(column);
                var sortableRowGroupColumns = (_a = rowGroupColumns) === null || _a === void 0 ? void 0 : _a.filter(function (col) { return col.getColDef().sortable; });
                if (sortableRowGroupColumns) {
                    columnsToUpdate = __spread([column], sortableRowGroupColumns);
                }
            }
        }
        columnsToUpdate.forEach(function (col) { return col.setSort(sort, source); });
        var doingMultiSort = (multiSort || this.gridOptionsWrapper.isAlwaysMultiSort()) && !this.gridOptionsWrapper.isSuppressMultiSort();
        // clear sort on all columns except those changed, and update the icons
        if (!doingMultiSort) {
            this.clearSortBarTheseColumns(columnsToUpdate, source);
        }
        // sortIndex used for knowing order of cols when multi-col sort
        this.updateSortIndex(column);
        this.dispatchSortChangedEvents(source);
    };
    SortController.prototype.updateSortIndex = function (lastColToChange) {
        var isCoupled = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        var groupParent = this.columnModel.getGroupDisplayColumnForGroup(lastColToChange.getId());
        var lastSortIndexCol = isCoupled ? groupParent || lastColToChange : lastColToChange;
        var allSortedCols = this.getIndexableColumnsOrdered();
        // reset sort index on everything
        this.columnModel.getPrimaryAndSecondaryAndAutoColumns().forEach(function (col) { return col.setSortIndex(null); });
        var allSortedColsWithoutChanges = allSortedCols.filter(function (col) { return col !== lastSortIndexCol; });
        var sortedColsWithIndices = !!lastSortIndexCol.getSort() ? __spread(allSortedColsWithoutChanges, [lastSortIndexCol]) : allSortedColsWithoutChanges;
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
        else if (this.gridOptionsWrapper.getSortingOrder()) {
            sortingOrder = this.gridOptionsWrapper.getSortingOrder();
        }
        else {
            sortingOrder = SortController_1.DEFAULT_SORTING_ORDER;
        }
        if (!Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
            console.warn("AG Grid: sortingOrder must be an array with at least one element, currently it's " + sortingOrder);
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
    SortController.prototype.getColumnsOrderedForSort = function () {
        // pull out all the columns that have sorting set
        var allColumnsIncludingAuto = this.columnModel.getPrimaryAndSecondaryAndAutoColumns();
        // when both cols are missing sortIndex, we use the position of the col in all cols list.
        // this means if colDefs only have sort, but no sortIndex, we deterministically pick which
        // cols is sorted by first.
        var allColsIndexes = {};
        allColumnsIncludingAuto.forEach(function (col, index) { return allColsIndexes[col.getId()] = index; });
        // put the columns in order of which one got sorted first
        allColumnsIncludingAuto.sort(function (a, b) {
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
        return allColumnsIncludingAuto;
    };
    SortController.prototype.getIndexableColumnsOrdered = function () {
        var _this = this;
        { }
        if (!this.gridOptionsWrapper.isColumnsSortingCoupledToGroup()) {
            return this.getColumnsWithSortingOrdered();
        }
        return this.getColumnsOrderedForSort()
            .filter(function (col) {
            var _a;
            if (!!col.getColDef().showRowGroup) {
                if (col.getColDef().field && col.getSort()) {
                    return true;
                }
                var sourceCols = _this.columnModel.getSourceColumnsForGroupColumn(col);
                return (_a = sourceCols) === null || _a === void 0 ? void 0 : _a.some(function (col) { return !!col.getSort(); });
            }
            return !!col.getSort();
        });
    };
    SortController.prototype.getColumnsWithSortingOrdered = function () {
        // pull out all the columns that have sorting set
        var orderedColumns = this.getColumnsOrderedForSort();
        return orderedColumns.filter(function (column) { return !!column.getSort(); });
    };
    // used by server side row models, to sent sort to server
    SortController.prototype.getSortModel = function () {
        return this.getColumnsWithSortingOrdered().map(function (column) { return ({
            sort: column.getSort(),
            colId: column.getId()
        }); });
    };
    SortController.prototype.getSortOptions = function () {
        return this.getColumnsWithSortingOrdered().map(function (column) { return ({
            sort: column.getSort(),
            column: column
        }); });
    };
    SortController.prototype.canColumnDisplayMixedSort = function (column) {
        var isColumnSortCouplingActive = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        var isGroupDisplayColumn = !!column.getColDef().showRowGroup;
        return isColumnSortCouplingActive && isGroupDisplayColumn;
    };
    SortController.prototype.getDisplaySortForColumn = function (column) {
        var _a;
        var linkedColumns = this.columnModel.getSourceColumnsForGroupColumn(column);
        if (!this.canColumnDisplayMixedSort(column) || !((_a = linkedColumns) === null || _a === void 0 ? void 0 : _a.length)) {
            return column.getSort();
        }
        // if column has unique data, its sorting is independent - but can still be mixed
        var columnHasUniqueData = !!column.getColDef().field;
        var sortableColumns = columnHasUniqueData ? __spread([column], linkedColumns) : linkedColumns;
        var firstSort = sortableColumns[0].getSort();
        // the == is intentional, as null and undefined both represent no sort, which means they are equivalent
        var allMatch = sortableColumns.every(function (col) { return col.getSort() == firstSort; });
        if (!allMatch) {
            return 'mixed';
        }
        return firstSort;
    };
    SortController.prototype.getDisplaySortIndexForColumn = function (column) {
        var _this = this;
        var isColumnSortCouplingActive = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        if (!isColumnSortCouplingActive) {
            return this.getColumnsWithSortingOrdered().indexOf(column);
        }
        var displayColumn = this.columnModel.getGroupDisplayColumnForGroup(column.getId());
        if (displayColumn) {
            if (!!column.getSort()) {
                return this.getDisplaySortIndexForColumn(displayColumn);
            }
            return null;
        }
        var allSortedCols = this.getIndexableColumnsOrdered()
            .filter(function (col) { return !_this.columnModel.getGroupDisplayColumnForGroup(col.getId()); });
        return allSortedCols.indexOf(column);
    };
    var SortController_1;
    SortController.DEFAULT_SORTING_ORDER = [constants_1.Constants.SORT_ASC, constants_1.Constants.SORT_DESC, null];
    __decorate([
        context_1.Autowired('columnModel')
    ], SortController.prototype, "columnModel", void 0);
    SortController = SortController_1 = __decorate([
        context_1.Bean('sortController')
    ], SortController);
    return SortController;
}(beanStub_1.BeanStub));
exports.SortController = SortController;
