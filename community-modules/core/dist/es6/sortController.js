/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean } from "./context/context";
import { Events } from "./events";
import { Constants } from "./constants";
var SortController = /** @class */ (function () {
    function SortController() {
        var _this = this;
        // used by the public api, for saving the sort model
        this.getSortModel = function () {
            return _this.getColumnsWithSortingOrdered().map(function (column) { return ({
                colId: column.getColId(),
                sort: column.getSort()
            }); });
        };
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
        if (sort !== Constants.SORT_ASC && sort !== Constants.SORT_DESC) {
            sort = null;
        }
        // update sort on current col
        column.setSort(sort, source);
        // sortedAt used for knowing order of cols when multi-col sort
        if (column.getSort()) {
            var sortedAt = Number(new Date().valueOf());
            column.setSortedAt(sortedAt);
        }
        else {
            column.setSortedAt(null);
        }
        var doingMultiSort = multiSort && !this.gridOptionsWrapper.isSuppressMultiSort();
        // clear sort on all columns except this one, and update the icons
        if (!doingMultiSort) {
            this.clearSortBarThisColumn(column, source);
        }
        this.dispatchSortChangedEvents();
    };
    // gets called by API, so if data changes, use can call this, which will end up
    // working out the sort order again of the rows.
    SortController.prototype.onSortChanged = function () {
        this.dispatchSortChangedEvents();
    };
    SortController.prototype.dispatchSortChangedEvents = function () {
        var event = {
            type: Events.EVENT_SORT_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    SortController.prototype.clearSortBarThisColumn = function (columnToSkip, source) {
        this.columnController.getPrimaryAndSecondaryAndAutoColumns().forEach(function (columnToClear) {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!(columnToClear === columnToSkip)) {
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
    SortController.prototype.setSortModel = function (sortModel, source) {
        var _this = this;
        if (source === void 0) { source = "api"; }
        // first up, clear any previous sort
        var sortModelProvided = sortModel && sortModel.length > 0;
        var allColumnsIncludingAuto = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        allColumnsIncludingAuto.forEach(function (column) {
            var sortForCol = null;
            var sortedAt = -1;
            if (sortModelProvided && column.getColDef().sortable) {
                for (var j = 0; j < sortModel.length; j++) {
                    var sortModelEntry = sortModel[j];
                    if (typeof sortModelEntry.colId === 'string'
                        && typeof column.getColId() === 'string'
                        && _this.compareColIds(sortModelEntry, column)) {
                        sortForCol = sortModelEntry.sort;
                        sortedAt = j;
                    }
                }
            }
            if (sortForCol) {
                column.setSort(sortForCol, source);
                column.setSortedAt(sortedAt);
            }
            else {
                column.setSort(null, source);
                column.setSortedAt(null);
            }
        });
        this.dispatchSortChangedEvents();
    };
    SortController.prototype.compareColIds = function (sortModelEntry, column) {
        return sortModelEntry.colId === column.getColId();
    };
    SortController.prototype.getColumnsWithSortingOrdered = function () {
        // pull out all the columns that have sorting set
        var allColumnsIncludingAuto = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        var columnsWithSorting = allColumnsIncludingAuto.filter(function (column) { return !!column.getSort(); });
        // put the columns in order of which one got sorted first
        columnsWithSorting.sort(function (a, b) { return a.sortedAt - b.sortedAt; });
        return columnsWithSorting;
    };
    // used by row controller, when doing the sorting
    SortController.prototype.getSortForRowController = function () {
        return this.getColumnsWithSortingOrdered().map(function (column) {
            var isAscending = column.getSort() === Constants.SORT_ASC;
            return {
                inverter: isAscending ? 1 : -1,
                column: column
            };
        });
    };
    var SortController_1;
    SortController.DEFAULT_SORTING_ORDER = [Constants.SORT_ASC, Constants.SORT_DESC, null];
    __decorate([
        Autowired('gridOptionsWrapper')
    ], SortController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('columnController')
    ], SortController.prototype, "columnController", void 0);
    __decorate([
        Autowired('eventService')
    ], SortController.prototype, "eventService", void 0);
    __decorate([
        Autowired('columnApi')
    ], SortController.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], SortController.prototype, "gridApi", void 0);
    SortController = SortController_1 = __decorate([
        Bean('sortController')
    ], SortController);
    return SortController;
}());
export { SortController };
