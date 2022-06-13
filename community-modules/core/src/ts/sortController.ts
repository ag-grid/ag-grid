import { Autowired, Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
import { Column } from "./entities/column";
import { Constants } from "./constants/constants";
import { ColumnApi } from "./columns/columnApi";
import { ColumnModel } from "./columns/columnModel";
import { ColumnEventType, Events, SortChangedEvent } from "./events";
import { GridApi } from "./gridApi";
import { SortOption } from "./rowNodes/rowNodeSorter";

export interface SortModelItem {
    /** Column Id to apply the sort to. */
    colId: string;
    /** Sort direction */
    sort: 'asc' | 'desc';
}

@Bean('sortController')
export class SortController extends BeanStub {

    private static DEFAULT_SORTING_ORDER = [Constants.SORT_ASC, Constants.SORT_DESC, null];

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    public progressSort(column: Column, multiSort: boolean, source: ColumnEventType): void {
        const nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort, source);
    }

    public setSortForColumn(column: Column, sort: 'asc' | 'desc' | null, multiSort: boolean, source: ColumnEventType): void {
        // auto correct - if sort not legal value, then set it to 'no sort' (which is null)
        if (sort !== Constants.SORT_ASC && sort !== Constants.SORT_DESC) {
            sort = null;
        }

        const isColumnsSortingCoupledToGroup = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        let columnsToUpdate = [column];
        if (isColumnsSortingCoupledToGroup) {
            if (column.getColDef().showRowGroup) {
                const rowGroupColumns = this.columnModel.getSourceColumnsForGroupColumn(column);
                const sortableRowGroupColumns = rowGroupColumns?.filter(col => col.getColDef().sortable);
                
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

    private updateSortIndex(lastColToChange: Column) {
        // update sortIndex on all sorting cols
        const allSortedCols = this.getColumnsWithSortingOrdered();
        let sortIndex = 0;
        const sortedRowGroupColumns: Column[] = [];
        const doesGroupDisplaySortGroup = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        allSortedCols.forEach(col => {
            const groupColumn = this.columnModel.getGroupDisplayColumnForGroup(col.getId());
            if (groupColumn && doesGroupDisplaySortGroup) {
                // Update row group columns last as they replicate their group columns sort index
                sortedRowGroupColumns.push(col);
                return;
            }
            if (col !== lastColToChange) {
                col.setSortIndex(sortIndex);
                sortIndex++;
            }
        });
        // last col to change always gets the last sort index, it's added to the end
        if (lastColToChange.getSort()) {
            lastColToChange.setSortIndex(sortIndex);
        }

        // set row grouped columns sort index to match the row group display column
        sortedRowGroupColumns.forEach(col => {
            const groupColumn = this.columnModel.getGroupDisplayColumnForGroup(col.getId());
            col.setSortIndex(groupColumn!.getSortIndex());
        });

        // clear sort index on all cols not sorting
        const allCols = this.columnModel.getPrimaryAndSecondaryAndAutoColumns();
        allCols.filter(col => col.getSort() == null).forEach(col => col.setSortIndex());
    }

    // gets called by API, so if data changes, use can call this, which will end up
    // working out the sort order again of the rows.
    public onSortChanged(source: string): void {
        this.dispatchSortChangedEvents(source);
    }

    public isSortActive(): boolean {
        // pull out all the columns that have sorting set
        const allCols = this.columnModel.getPrimaryAndSecondaryAndAutoColumns();
        const sortedCols = allCols.filter(column => !!column.getSort());
        return sortedCols && sortedCols.length > 0;
    }

    public dispatchSortChangedEvents(source: string): void {
        const event: SortChangedEvent = {
            type: Events.EVENT_SORT_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            source
        };
        this.eventService.dispatchEvent(event);
    }

    private clearSortBarTheseColumns(columnsToSkip: Column[], source: ColumnEventType): void {
        this.columnModel.getPrimaryAndSecondaryAndAutoColumns().forEach((columnToClear: Column) => {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!columnsToSkip.includes(columnToClear)) {
                // setting to 'undefined' as null means 'none' rather than cleared, otherwise issue will arise
                // if sort order is: ['desc', null , 'asc'], as it will start at null rather than 'desc'.
                columnToClear.setSort(undefined, source);
            }
        });
    }

    private getNextSortDirection(column: Column): 'asc' | 'desc' | null {
        let sortingOrder: ('asc' | 'desc' | null)[] | null | undefined;

        if (column.getColDef().sortingOrder) {
            sortingOrder = column.getColDef().sortingOrder;
        } else if (this.gridOptionsWrapper.getSortingOrder()) {
            sortingOrder = this.gridOptionsWrapper.getSortingOrder();
        } else {
            sortingOrder = SortController.DEFAULT_SORTING_ORDER;
        }

        if (!Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
            console.warn(`AG Grid: sortingOrder must be an array with at least one element, currently it\'s ${sortingOrder}`);
            return null;
        }

        const currentIndex = sortingOrder.indexOf(column.getSort()!);
        const notInArray = currentIndex < 0;
        const lastItemInArray = currentIndex == sortingOrder.length - 1;
        let result: 'asc' | 'desc' | null;

        if (notInArray || lastItemInArray) {
            result = sortingOrder[0];
        } else {
            result = sortingOrder[currentIndex + 1];
        }

        // verify the sort type exists, as the user could provide the sortingOrder, need to make sure it's valid
        if (SortController.DEFAULT_SORTING_ORDER.indexOf(result) < 0) {
            console.warn('AG Grid: invalid sort type ' + result);
            return null;
        }

        return result;
    }

    public getColumnsWithSortingOrdered(): Column[] {
        // pull out all the columns that have sorting set
        const allColumnsIncludingAuto = this.columnModel.getPrimaryAndSecondaryAndAutoColumns();
        const columnsWithSorting = allColumnsIncludingAuto.filter(column => !!column.getSort());

        // when both cols are missing sortIndex, we use the position of the col in all cols list.
        // this means if colDefs only have sort, but no sortIndex, we deterministically pick which
        // cols is sorted by first.
        const allColsIndexes: { [id: string]: number } = {};
        allColumnsIncludingAuto.forEach((col: Column, index: number) => allColsIndexes[col.getId()] = index);

        // put the columns in order of which one got sorted first
        columnsWithSorting.sort((a: Column, b: Column) => {
            const iA = a.getSortIndex();
            const iB = b.getSortIndex();
            if (iA != null && iB != null) {
                return iA - iB; // both present, normal comparison
            } else if (iA == null && iB == null) {
                // both missing, compare using column positions
                const posA = allColsIndexes[a.getId()];
                const posB = allColsIndexes[b.getId()];
                return posA > posB ? 1 : -1;
            } else if (iB == null) {
                return -1; // iB missing
            } else {
                return 1; // iA missing
            }
        });

        return columnsWithSorting;
    }

    // used by server side row models, to sent sort to server
    public getSortModel(): SortModelItem[] {
        return this.getColumnsWithSortingOrdered().map(column => ({
            sort: column.getSort()!,
            colId: column.getId()
        }));
    }

    public getSortOptions(): SortOption[] {
        return this.getColumnsWithSortingOrdered().map(column => ({
            sort: column.getSort()!,
            column
        }));
    }
}
