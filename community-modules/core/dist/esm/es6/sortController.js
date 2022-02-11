/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SortController_1;
import { Autowired, Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
import { Constants } from "./constants/constants";
import { Events } from "./events";
let SortController = SortController_1 = class SortController extends BeanStub {
    progressSort(column, multiSort, source = "api") {
        const nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort, source);
    }
    setSortForColumn(column, sort, multiSort, source = "api") {
        // auto correct - if sort not legal value, then set it to 'no sort' (which is null)
        if (sort !== Constants.SORT_ASC && sort !== Constants.SORT_DESC) {
            sort = null;
        }
        // update sort on current col
        column.setSort(sort, source);
        const doingMultiSort = multiSort && !this.gridOptionsWrapper.isSuppressMultiSort();
        // clear sort on all columns except this one, and update the icons
        if (!doingMultiSort) {
            this.clearSortBarThisColumn(column, source);
        }
        // sortIndex used for knowing order of cols when multi-col sort
        this.updateSortIndex(column);
        this.dispatchSortChangedEvents();
    }
    updateSortIndex(lastColToChange) {
        // update sortIndex on all sorting cols
        const allSortedCols = this.getColumnsWithSortingOrdered();
        let sortIndex = 0;
        allSortedCols.forEach(col => {
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
        const allCols = this.columnModel.getPrimaryAndSecondaryAndAutoColumns();
        allCols.filter(col => col.getSort() == null).forEach(col => col.setSortIndex());
    }
    // gets called by API, so if data changes, use can call this, which will end up
    // working out the sort order again of the rows.
    onSortChanged() {
        this.dispatchSortChangedEvents();
    }
    isSortActive() {
        // pull out all the columns that have sorting set
        const allCols = this.columnModel.getPrimaryAndSecondaryAndAutoColumns();
        const sortedCols = allCols.filter(column => !!column.getSort());
        return sortedCols && sortedCols.length > 0;
    }
    dispatchSortChangedEvents() {
        const event = {
            type: Events.EVENT_SORT_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }
    clearSortBarThisColumn(columnToSkip, source) {
        this.columnModel.getPrimaryAndSecondaryAndAutoColumns().forEach((columnToClear) => {
            // Do not clear if either holding shift, or if column in question was clicked
            if (columnToClear !== columnToSkip) {
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
    getColumnsWithSortingOrdered() {
        // pull out all the columns that have sorting set
        const allColumnsIncludingAuto = this.columnModel.getPrimaryAndSecondaryAndAutoColumns();
        const columnsWithSorting = allColumnsIncludingAuto.filter(column => !!column.getSort());
        // when both cols are missing sortIndex, we use the position of the col in all cols list.
        // this means if colDefs only have sort, but no sortIndex, we deterministically pick which
        // cols is sorted by first.
        const allColsIndexes = {};
        allColumnsIncludingAuto.forEach((col, index) => allColsIndexes[col.getId()] = index);
        // put the columns in order of which one got sorted first
        columnsWithSorting.sort((a, b) => {
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
        return columnsWithSorting;
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
};
SortController.DEFAULT_SORTING_ORDER = [Constants.SORT_ASC, Constants.SORT_DESC, null];
__decorate([
    Autowired('columnModel')
], SortController.prototype, "columnModel", void 0);
__decorate([
    Autowired('columnApi')
], SortController.prototype, "columnApi", void 0);
__decorate([
    Autowired('gridApi')
], SortController.prototype, "gridApi", void 0);
SortController = SortController_1 = __decorate([
    Bean('sortController')
], SortController);
export { SortController };
