/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
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
        if (source === void 0) { source = "api"; }
        var nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort, source);
    };
    SortController.prototype.setSortForColumn = function (column, sort, multiSort, source) {
        if (source === void 0) { source = "api"; }
        // auto correct - if sort not legal value, then set it to 'no sort' (which is null)
        if (sort !== constants_1.Constants.SORT_ASC && sort !== constants_1.Constants.SORT_DESC) {
            sort = null;
        }
        // update sort on current col
        column.setSort(sort, source);
        var doingMultiSort = multiSort && !this.gridOptionsWrapper.isSuppressMultiSort();
        // clear sort on all columns except this one, and update the icons
        if (!doingMultiSort) {
            this.clearSortBarThisColumn(column, source);
        }
        // sortIndex used for knowing order of cols when multi-col sort
        this.updateSortIndex(column);
        this.dispatchSortChangedEvents();
    };
    SortController.prototype.updateSortIndex = function (lastColToChange) {
        // update sortIndex on all sorting cols
        var allSortedCols = this.getColumnsWithSortingOrdered();
        var sortIndex = 0;
        allSortedCols.forEach(function (col) {
            if (col !== lastColToChange) {
                col.setSortIndex(sortIndex);
                sortIndex++;
            }
        });
        // last col to change always gets the last sort index, it's added to the end
        if (lastColToChange.getSort()) {
            lastColToChange.setSortIndex(sortIndex);
        }
        // clear sort index on all cols not sorting
        var allCols = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        allCols.filter(function (col) { return col.getSort() == null; }).forEach(function (col) { return col.setSortIndex(); });
    };
    // gets called by API, so if data changes, use can call this, which will end up
    // working out the sort order again of the rows.
    SortController.prototype.onSortChanged = function () {
        this.dispatchSortChangedEvents();
    };
    SortController.prototype.isSortActive = function () {
        // pull out all the columns that have sorting set
        var allCols = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        var sortedCols = allCols.filter(function (column) { return !!column.getSort(); });
        return sortedCols && sortedCols.length > 0;
    };
    SortController.prototype.dispatchSortChangedEvents = function () {
        var event = {
            type: events_1.Events.EVENT_SORT_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    SortController.prototype.clearSortBarThisColumn = function (columnToSkip, source) {
        this.columnController.getPrimaryAndSecondaryAndAutoColumns().forEach(function (columnToClear) {
            // Do not clear if either holding shift, or if column in question was clicked
            if (columnToClear !== columnToSkip) {
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
            console.warn("ag-grid: sortingOrder must be an array with at least one element, currently it's " + sortingOrder);
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
            console.warn('ag-grid: invalid sort type ' + result);
            return null;
        }
        return result;
    };
    SortController.prototype.getColumnsWithSortingOrdered = function () {
        // pull out all the columns that have sorting set
        var allColumnsIncludingAuto = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        var columnsWithSorting = allColumnsIncludingAuto.filter(function (column) { return !!column.getSort(); });
        // when both cols are missing sortIndex, we use the position of the col in all cols list.
        // this means if colDefs only have sort, but no sortIndex, we deterministically pick which
        // cols is sorted by first.
        var allColsIndexes = {};
        allColumnsIncludingAuto.forEach(function (col, index) { return allColsIndexes[col.getId()] = index; });
        // put the columns in order of which one got sorted first
        columnsWithSorting.sort(function (a, b) {
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
        return columnsWithSorting;
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
    var SortController_1;
    SortController.DEFAULT_SORTING_ORDER = [constants_1.Constants.SORT_ASC, constants_1.Constants.SORT_DESC, null];
    __decorate([
        context_1.Autowired('columnController')
    ], SortController.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], SortController.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], SortController.prototype, "gridApi", void 0);
    SortController = SortController_1 = __decorate([
        context_1.Bean('sortController')
    ], SortController);
    return SortController;
}(beanStub_1.BeanStub));
exports.SortController = SortController;

//# sourceMappingURL=sortController.js.map
