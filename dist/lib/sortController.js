/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var column_1 = require("./entities/column");
var context_1 = require("./context/context");
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var columnController_1 = require("./columnController/columnController");
var eventService_1 = require("./eventService");
var events_1 = require("./events");
var context_2 = require("./context/context");
var utils_1 = require("./utils");
var SortController = SortController_1 = (function () {
    function SortController() {
    }
    SortController.prototype.progressSort = function (column, multiSort) {
        var nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort);
    };
    SortController.prototype.setSortForColumn = function (column, sort, multiSort) {
        // auto correct - if sort not legal value, then set it to 'no sort' (which is null)
        if (sort !== column_1.Column.SORT_ASC && sort !== column_1.Column.SORT_DESC) {
            sort = null;
        }
        // update sort on current col
        column.setSort(sort);
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
            this.clearSortBarThisColumn(column);
        }
        this.dispatchSortChangedEvents();
    };
    // gets called by API, so if data changes, use can call this, which will end up
    // working out the sort order again of the rows.
    SortController.prototype.onSortChanged = function () {
        this.dispatchSortChangedEvents();
    };
    SortController.prototype.dispatchSortChangedEvents = function () {
        this.eventService.dispatchEvent(events_1.Events.EVENT_BEFORE_SORT_CHANGED);
        this.eventService.dispatchEvent(events_1.Events.EVENT_SORT_CHANGED);
        this.eventService.dispatchEvent(events_1.Events.EVENT_AFTER_SORT_CHANGED);
    };
    SortController.prototype.clearSortBarThisColumn = function (columnToSkip) {
        this.columnController.getPrimaryAndSecondaryAndAutoColumns().forEach(function (columnToClear) {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!(columnToClear === columnToSkip)) {
                columnToClear.setSort(null);
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
            console.warn('ag-grid: sortingOrder must be an array with at least one element, currently it\'s ' + sortingOrder);
            return;
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
        // verify the sort type exists, as the user could provide the sortOrder, need to make sure it's valid
        if (SortController_1.DEFAULT_SORTING_ORDER.indexOf(result) < 0) {
            console.warn('ag-grid: invalid sort type ' + result);
            return null;
        }
        return result;
    };
    // used by the public api, for saving the sort model
    SortController.prototype.getSortModel = function () {
        var columnsWithSorting = this.getColumnsWithSortingOrdered();
        return utils_1.Utils.map(columnsWithSorting, function (column) {
            return {
                colId: column.getColId(),
                sort: column.getSort()
            };
        });
    };
    SortController.prototype.setSortModel = function (sortModel) {
        if (!this.gridOptionsWrapper.isEnableSorting()) {
            console.warn('ag-grid: You are setting the sort model on a grid that does not have sorting enabled');
            return;
        }
        // first up, clear any previous sort
        var sortModelProvided = sortModel && sortModel.length > 0;
        var allColumnsIncludingAuto = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        allColumnsIncludingAuto.forEach(function (column) {
            var sortForCol = null;
            var sortedAt = -1;
            if (sortModelProvided && !column.getColDef().suppressSorting) {
                for (var j = 0; j < sortModel.length; j++) {
                    var sortModelEntry = sortModel[j];
                    if (typeof sortModelEntry.colId === 'string'
                        && typeof column.getColId() === 'string'
                        && sortModelEntry.colId === column.getColId()) {
                        sortForCol = sortModelEntry.sort;
                        sortedAt = j;
                    }
                }
            }
            if (sortForCol) {
                column.setSort(sortForCol);
                column.setSortedAt(sortedAt);
            }
            else {
                column.setSort(null);
                column.setSortedAt(null);
            }
        });
        this.dispatchSortChangedEvents();
    };
    SortController.prototype.getColumnsWithSortingOrdered = function () {
        // pull out all the columns that have sorting set
        var allColumnsIncludingAuto = this.columnController.getPrimaryAndSecondaryAndAutoColumns();
        var columnsWithSorting = utils_1.Utils.filter(allColumnsIncludingAuto, function (column) { return !!column.getSort(); });
        // put the columns in order of which one got sorted first
        columnsWithSorting.sort(function (a, b) { return a.sortedAt - b.sortedAt; });
        return columnsWithSorting;
    };
    // used by row controller, when doing the sorting
    SortController.prototype.getSortForRowController = function () {
        var columnsWithSorting = this.getColumnsWithSortingOrdered();
        return utils_1.Utils.map(columnsWithSorting, function (column) {
            var ascending = column.getSort() === column_1.Column.SORT_ASC;
            return {
                inverter: ascending ? 1 : -1,
                column: column
            };
        });
    };
    return SortController;
}());
SortController.DEFAULT_SORTING_ORDER = [column_1.Column.SORT_ASC, column_1.Column.SORT_DESC, null];
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], SortController.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('columnController'),
    __metadata("design:type", columnController_1.ColumnController)
], SortController.prototype, "columnController", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], SortController.prototype, "eventService", void 0);
SortController = SortController_1 = __decorate([
    context_2.Bean('sortController')
], SortController);
exports.SortController = SortController;
var SortController_1;
