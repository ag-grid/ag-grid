import { Autowired, Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
import { Column } from "./entities/column";
import { Constants } from "./constants/constants";
import { ColumnModel } from "./columns/columnModel";
import { ColumnEventType, Events, SortChangedEvent } from "./events";
import { SortOption } from "./rowNodes/rowNodeSorter";
import { WithoutGridCommon } from "./interfaces/iCommon";

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

        const doingMultiSort = (multiSort || this.gridOptionsService.is('alwaysMultiSort')) && !this.gridOptionsService.is('suppressMultiSort');

        // clear sort on all columns except those changed, and update the icons
        if (!doingMultiSort) {
            this.clearSortBarTheseColumns(columnsToUpdate, source);
        } 

        // sortIndex used for knowing order of cols when multi-col sort
        this.updateSortIndex(column);

        this.dispatchSortChangedEvents(source);
    }

    private updateSortIndex(lastColToChange: Column) {
        const isCoupled = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        const groupParent = this.columnModel.getGroupDisplayColumnForGroup(lastColToChange.getId());
        const lastSortIndexCol = isCoupled ? groupParent || lastColToChange : lastColToChange;

        const allSortedCols = this.getIndexableColumnsOrdered();

        // reset sort index on everything
        this.columnModel.getPrimaryAndSecondaryAndAutoColumns().forEach(col => col.setSortIndex(null));
        const allSortedColsWithoutChanges = allSortedCols.filter(col => col !== lastSortIndexCol);
        const sortedColsWithIndices = !!lastSortIndexCol.getSort() ? [...allSortedColsWithoutChanges, lastSortIndexCol] : allSortedColsWithoutChanges;
        sortedColsWithIndices.forEach((col, idx) => (
            col.setSortIndex(idx)
        ));
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
        const event: WithoutGridCommon<SortChangedEvent> = {
            type: Events.EVENT_SORT_CHANGED,
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
        } else if (this.gridOptionsService.get('sortingOrder')) {
            sortingOrder = this.gridOptionsService.get('sortingOrder');
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

    private getColumnsOrderedForSort(): Column[] {
        // pull out all the columns that have sorting set
        const allColumnsIncludingAuto = this.columnModel.getPrimaryAndSecondaryAndAutoColumns();

        // when both cols are missing sortIndex, we use the position of the col in all cols list.
        // this means if colDefs only have sort, but no sortIndex, we deterministically pick which
        // cols is sorted by first.
        const allColsIndexes: { [id: string]: number } = {};
        allColumnsIncludingAuto.forEach((col: Column, index: number) => allColsIndexes[col.getId()] = index);

        // put the columns in order of which one got sorted first
        allColumnsIncludingAuto.sort((a: Column, b: Column) => {
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

        return allColumnsIncludingAuto;
    }

    private getIndexableColumnsOrdered(): Column[] {{}
        if (!this.gridOptionsWrapper.isColumnsSortingCoupledToGroup()) {
            return this.getColumnsWithSortingOrdered();
        }

        return this.getColumnsOrderedForSort()
            .filter(col => {
                if (!!col.getColDef().showRowGroup) {
                    if (col.getColDef().field && col.getSort()) {
                        return true;
                    }
    
                    const sourceCols = this.columnModel.getSourceColumnsForGroupColumn(col);
                    return sourceCols?.some(col => !!col.getSort());
                }

                return !!col.getSort();
            });
    }

    public getColumnsWithSortingOrdered(): Column[] {
        // pull out all the columns that have sorting set
        const orderedColumns = this.getColumnsOrderedForSort();
        return orderedColumns.filter(column => !!column.getSort());
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

    public canColumnDisplayMixedSort(column: Column): boolean {
        const isColumnSortCouplingActive = this.gridOptionsWrapper.isColumnsSortingCoupledToGroup();
        const isGroupDisplayColumn = !!column.getColDef().showRowGroup;
        return isColumnSortCouplingActive && isGroupDisplayColumn;
    }

    public getDisplaySortForColumn(column: Column): 'asc' | 'desc' | 'mixed' | null | undefined {
        const linkedColumns = this.columnModel.getSourceColumnsForGroupColumn(column);
        if (!this.canColumnDisplayMixedSort(column) || !linkedColumns?.length) {
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

    public getDisplaySortIndexForColumn(column: Column): number | null | undefined {
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
}
