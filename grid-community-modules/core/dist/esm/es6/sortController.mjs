var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SortController_1;
import { Autowired, Bean } from "./context/context.mjs";
import { BeanStub } from "./context/beanStub.mjs";
import { Events } from "./events.mjs";
let SortController = SortController_1 = class SortController extends BeanStub {
    progressSort(column, multiSort, source) {
        const nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort, source);
    }
    setSortForColumn(column, sort, multiSort, source) {
        // auto correct - if sort not legal value, then set it to 'no sort' (which is null)
        if (sort !== 'asc' && sort !== 'desc') {
            sort = null;
        }
        const isColumnsSortingCoupledToGroup = this.gridOptionsService.isColumnsSortingCoupledToGroup();
        let columnsToUpdate = [column];
        if (isColumnsSortingCoupledToGroup) {
            if (column.getColDef().showRowGroup) {
                const rowGroupColumns = this.columnModel.getSourceColumnsForGroupColumn(column);
                const sortableRowGroupColumns = rowGroupColumns === null || rowGroupColumns === void 0 ? void 0 : rowGroupColumns.filter(col => col.isSortable());
                if (sortableRowGroupColumns) {
                    columnsToUpdate = [column, ...sortableRowGroupColumns];
                }
            }
        }
        columnsToUpdate.forEach(col => col.setSort(sort, source));
        const doingMultiSort = (multiSort || this.gridOptionsService.get('alwaysMultiSort')) && !this.gridOptionsService.get('suppressMultiSort');
        // clear sort on all columns except those changed, and update the icons
        if (!doingMultiSort) {
            this.clearSortBarTheseColumns(columnsToUpdate, source);
        }
        // sortIndex used for knowing order of cols when multi-col sort
        this.updateSortIndex(column);
        this.dispatchSortChangedEvents(source);
    }
    updateSortIndex(lastColToChange) {
        const isCoupled = this.gridOptionsService.isColumnsSortingCoupledToGroup();
        const groupParent = this.columnModel.getGroupDisplayColumnForGroup(lastColToChange.getId());
        const lastSortIndexCol = isCoupled ? groupParent || lastColToChange : lastColToChange;
        const allSortedCols = this.getColumnsWithSortingOrdered();
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
            type: Events.EVENT_SORT_CHANGED,
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
        else if (this.gridOptionsService.get('sortingOrder')) {
            sortingOrder = this.gridOptionsService.get('sortingOrder');
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
    /**
     * @returns a map of sort indexes for every sorted column, if groups sort primaries then they will have equivalent indices
     */
    getIndexedSortMap() {
        // pull out all the columns that have sorting set
        let allSortedCols = this.columnModel.getPrimaryAndSecondaryAndAutoColumns()
            .filter(col => !!col.getSort());
        if (this.columnModel.isPivotMode()) {
            const isSortingLinked = this.gridOptionsService.isColumnsSortingCoupledToGroup();
            allSortedCols = allSortedCols.filter(col => {
                const isAggregated = !!col.getAggFunc();
                const isSecondary = !col.isPrimary();
                const isGroup = isSortingLinked ? this.columnModel.getGroupDisplayColumnForGroup(col.getId()) : col.getColDef().showRowGroup;
                return isAggregated || isSecondary || isGroup;
            });
        }
        const sortedRowGroupCols = this.columnModel.getRowGroupColumns()
            .filter(col => !!col.getSort());
        const isSortLinked = this.gridOptionsService.isColumnsSortingCoupledToGroup() && !!sortedRowGroupCols.length;
        if (isSortLinked) {
            allSortedCols = [
                ...new Set(
                // if linked sorting, replace all columns with the display group column for index purposes, and ensure uniqueness
                allSortedCols.map(col => { var _a; return (_a = this.columnModel.getGroupDisplayColumnForGroup(col.getId())) !== null && _a !== void 0 ? _a : col; }))
            ];
        }
        // when both cols are missing sortIndex, we use the position of the col in all cols list.
        // this means if colDefs only have sort, but no sortIndex, we deterministically pick which
        // cols is sorted by first.
        const allColsIndexes = {};
        allSortedCols.forEach((col, index) => allColsIndexes[col.getId()] = index);
        // put the columns in order of which one got sorted first
        allSortedCols.sort((a, b) => {
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
        const indexMap = new Map();
        allSortedCols.forEach((col, idx) => indexMap.set(col, idx));
        // add the row group cols back
        if (isSortLinked) {
            sortedRowGroupCols.forEach(col => {
                const groupDisplayCol = this.columnModel.getGroupDisplayColumnForGroup(col.getId());
                indexMap.set(col, indexMap.get(groupDisplayCol));
            });
        }
        return indexMap;
    }
    getColumnsWithSortingOrdered() {
        // pull out all the columns that have sorting set
        return [...this.getIndexedSortMap().entries()]
            .sort(([col1, idx1], [col2, idx2]) => idx1 - idx2)
            .map(([col]) => col);
    }
    // used by server side row models, to sent sort to server
    getSortModel() {
        return this.getColumnsWithSortingOrdered()
            .filter(column => column.getSort())
            .map(column => ({
            sort: column.getSort(),
            colId: column.getId()
        }));
    }
    getSortOptions() {
        return this.getColumnsWithSortingOrdered()
            .filter(column => column.getSort())
            .map(column => ({
            sort: column.getSort(),
            column
        }));
    }
    canColumnDisplayMixedSort(column) {
        const isColumnSortCouplingActive = this.gridOptionsService.isColumnsSortingCoupledToGroup();
        const isGroupDisplayColumn = !!column.getColDef().showRowGroup;
        return isColumnSortCouplingActive && isGroupDisplayColumn;
    }
    getDisplaySortForColumn(column) {
        const linkedColumns = this.columnModel.getSourceColumnsForGroupColumn(column);
        if (!this.canColumnDisplayMixedSort(column) || !(linkedColumns === null || linkedColumns === void 0 ? void 0 : linkedColumns.length)) {
            return column.getSort();
        }
        // if column has unique data, its sorting is independent - but can still be mixed
        const columnHasUniqueData = column.getColDef().field != null || !!column.getColDef().valueGetter;
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
        return this.getIndexedSortMap().get(column);
    }
};
SortController.DEFAULT_SORTING_ORDER = ['asc', 'desc', null];
__decorate([
    Autowired('columnModel')
], SortController.prototype, "columnModel", void 0);
SortController = SortController_1 = __decorate([
    Bean('sortController')
], SortController);
export { SortController };
