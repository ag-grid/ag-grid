/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SortController_1;
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("./context/context");
const beanStub_1 = require("./context/beanStub");
const constants_1 = require("./constants/constants");
const events_1 = require("./events");
let SortController = SortController_1 = class SortController extends beanStub_1.BeanStub {
    progressSort(column, multiSort, source) {
        const nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort, source);
    }
    setSortForColumn(column, sort, multiSort, source) {
        var _a;
        // auto correct - if sort not legal value, then set it to 'no sort' (which is null)
        if (sort !== constants_1.Constants.SORT_ASC && sort !== constants_1.Constants.SORT_DESC) {
            sort = null;
        }
        const isColumnsSortingCoupledToGroup = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        let columnsToUpdate = [column];
        if (isColumnsSortingCoupledToGroup) {
            if (column.getColDef().showRowGroup) {
                const rowGroupColumns = this.columnModel.getSourceColumnsForGroupColumn(column);
                const sortableRowGroupColumns = (_a = rowGroupColumns) === null || _a === void 0 ? void 0 : _a.filter(col => col.getColDef().sortable);
                if (sortableRowGroupColumns) {
                    columnsToUpdate = [column, ...sortableRowGroupColumns];
                }
            }
        }
        columnsToUpdate.forEach(col => col.setSort(sort, source));
        const doingMultiSort = (multiSort || this.gridOptionsWrapper.isAlwaysMultiSort()) && !this.gridOptionsWrapper.isSuppressMultiSort();
        // clear sort on all columns except those changed, and update the icons
        if (!doingMultiSort) {
            this.clearSortBarTheseColumns(columnsToUpdate, source);
        }
        // sortIndex used for knowing order of cols when multi-col sort
        this.updateSortIndex(column);
        this.dispatchSortChangedEvents(source);
    }
    updateSortIndex(lastColToChange) {
        const isCoupled = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        const groupParent = this.columnModel.getGroupDisplayColumnForGroup(lastColToChange.getId());
        const lastSortIndexCol = isCoupled ? groupParent || lastColToChange : lastColToChange;
        const allSortedCols = this.getIndexableColumnsOrdered();
        // reset sort index on everything
        this.columnModel.getPrimaryAndSecondaryAndAutoColumns().forEach(col => col.setSortIndex(null));
        const allSortedColsWithoutChanges = allSortedCols.filter(col => col !== lastSortIndexCol);
        const sortedColsWithIndices = !!lastSortIndexCol.getSort() ? [...allSortedColsWithoutChanges, lastSortIndexCol] : allSortedColsWithoutChanges;
        sortedColsWithIndices.forEach((col, idx) => (col.setSortIndex(idx)));
    }
    // gets called by API, so if data changes, use can call this, which will end up
    // working out the sort order again of the rows.
    onSortChanged(source) {
        this.dispatchSortChangedEvents(source);
    }
    isSortActive() {
        // pull out all the columns that have sorting set
        const allCols = this.columnModel.getPrimaryAndSecondaryAndAutoColumns();
        const sortedCols = allCols.filter(column => !!column.getSort());
        return sortedCols && sortedCols.length > 0;
    }
    dispatchSortChangedEvents(source) {
        const event = {
            type: events_1.Events.EVENT_SORT_CHANGED,
            source
        };
        this.eventService.dispatchEvent(event);
    }
    clearSortBarTheseColumns(columnsToSkip, source) {
        this.columnModel.getPrimaryAndSecondaryAndAutoColumns().forEach((columnToClear) => {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!columnsToSkip.includes(columnToClear)) {
                // setting to 'undefined' as null means 'none' rather than cleared, otherwise issue will arise
                // if sort order is: ['desc', null , 'asc'], as it will start at null rather than 'desc'.
                columnToClear.setSort(undefined, source);
            }
        });
    }
    getNextSortDirection(column) {
        let sortingOrder;
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
            console.warn(`AG Grid: sortingOrder must be an array with at least one element, currently it\'s ${sortingOrder}`);
            return null;
        }
        const currentIndex = sortingOrder.indexOf(column.getSort());
        const notInArray = currentIndex < 0;
        const lastItemInArray = currentIndex == sortingOrder.length - 1;
        let result;
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
    }
    getColumnsOrderedForSort() {
        // pull out all the columns that have sorting set
        const allColumnsIncludingAuto = this.columnModel.getPrimaryAndSecondaryAndAutoColumns();
        // when both cols are missing sortIndex, we use the position of the col in all cols list.
        // this means if colDefs only have sort, but no sortIndex, we deterministically pick which
        // cols is sorted by first.
        const allColsIndexes = {};
        allColumnsIncludingAuto.forEach((col, index) => allColsIndexes[col.getId()] = index);
        // put the columns in order of which one got sorted first
        allColumnsIncludingAuto.sort((a, b) => {
            const iA = a.getSortIndex();
            const iB = b.getSortIndex();
            if (iA != null && iB != null) {
                return iA - iB; // both present, normal comparison
            }
            else if (iA == null && iB == null) {
                // both missing, compare using column positions
                const posA = allColsIndexes[a.getId()];
                const posB = allColsIndexes[b.getId()];
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
    }
    getIndexableColumnsOrdered() {
        { }
        if (!this.gridOptionsWrapper.isColumnsSortingCoupledToGroup()) {
            return this.getColumnsWithSortingOrdered();
        }
        return this.getColumnsOrderedForSort()
            .filter(col => {
            var _a;
            if (!!col.getColDef().showRowGroup) {
                if (col.getColDef().field && col.getSort()) {
                    return true;
                }
                const sourceCols = this.columnModel.getSourceColumnsForGroupColumn(col);
                return (_a = sourceCols) === null || _a === void 0 ? void 0 : _a.some(col => !!col.getSort());
            }
            return !!col.getSort();
        });
    }
    getColumnsWithSortingOrdered() {
        // pull out all the columns that have sorting set
        const orderedColumns = this.getColumnsOrderedForSort();
        return orderedColumns.filter(column => !!column.getSort());
    }
    // used by server side row models, to sent sort to server
    getSortModel() {
        return this.getColumnsWithSortingOrdered().map(column => ({
            sort: column.getSort(),
            colId: column.getId()
        }));
    }
    getSortOptions() {
        return this.getColumnsWithSortingOrdered().map(column => ({
            sort: column.getSort(),
            column
        }));
    }
    canColumnDisplayMixedSort(column) {
        const isColumnSortCouplingActive = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        const isGroupDisplayColumn = !!column.getColDef().showRowGroup;
        return isColumnSortCouplingActive && isGroupDisplayColumn;
    }
    getDisplaySortForColumn(column) {
        var _a;
        const linkedColumns = this.columnModel.getSourceColumnsForGroupColumn(column);
        if (!this.canColumnDisplayMixedSort(column) || !((_a = linkedColumns) === null || _a === void 0 ? void 0 : _a.length)) {
            return column.getSort();
        }
        // if column has unique data, its sorting is independent - but can still be mixed
        const columnHasUniqueData = !!column.getColDef().field;
        const sortableColumns = columnHasUniqueData ? [column, ...linkedColumns] : linkedColumns;
        const firstSort = sortableColumns[0].getSort();
        // the == is intentional, as null and undefined both represent no sort, which means they are equivalent
        const allMatch = sortableColumns.every(col => col.getSort() == firstSort);
        if (!allMatch) {
            return 'mixed';
        }
        return firstSort;
    }
    getDisplaySortIndexForColumn(column) {
        const isColumnSortCouplingActive = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        if (!isColumnSortCouplingActive) {
            return this.getColumnsWithSortingOrdered().indexOf(column);
        }
        const displayColumn = this.columnModel.getGroupDisplayColumnForGroup(column.getId());
        if (displayColumn) {
            if (!!column.getSort()) {
                return this.getDisplaySortIndexForColumn(displayColumn);
            }
            return null;
        }
        const allSortedCols = this.getIndexableColumnsOrdered()
            .filter(col => !this.columnModel.getGroupDisplayColumnForGroup(col.getId()));
        return allSortedCols.indexOf(column);
    }
};
SortController.DEFAULT_SORTING_ORDER = [constants_1.Constants.SORT_ASC, constants_1.Constants.SORT_DESC, null];
__decorate([
    context_1.Autowired('columnModel')
], SortController.prototype, "columnModel", void 0);
SortController = SortController_1 = __decorate([
    context_1.Bean('sortController')
], SortController);
exports.SortController = SortController;
