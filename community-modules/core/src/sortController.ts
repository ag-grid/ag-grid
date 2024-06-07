import type { ColumnModel } from './columns/columnModel';
import type { FuncColsService } from './columns/funcColsService';
import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { AgColumn } from './entities/agColumn';
import type { SortDirection } from './entities/colDef';
import type { ColumnEventType, SortChangedEvent } from './events';
import type { WithoutGridCommon } from './interfaces/iCommon';
import type { IShowRowGroupColsService } from './interfaces/iShowRowGroupColsService';
import type { SortOption } from './rowNodes/rowNodeSorter';

export interface SortModelItem {
    /** Column Id to apply the sort to. */
    colId: string;
    /** Sort direction */
    sort: 'asc' | 'desc';
}

export class SortController extends BeanStub implements NamedBean {
    beanName = 'sortController' as const;

    private static DEFAULT_SORTING_ORDER: SortDirection[] = ['asc', 'desc', null];

    private columnModel: ColumnModel;
    private funcColsService: FuncColsService;
    private showRowGroupColsService?: IShowRowGroupColsService;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.funcColsService = beans.funcColsService;
        this.showRowGroupColsService = beans.showRowGroupColsService;
    }

    public progressSort(column: AgColumn, multiSort: boolean, source: ColumnEventType): void {
        const nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort, source);
    }

    public setSortForColumn(column: AgColumn, sort: SortDirection, multiSort: boolean, source: ColumnEventType): void {
        // auto correct - if sort not legal value, then set it to 'no sort' (which is null)
        if (sort !== 'asc' && sort !== 'desc') {
            sort = null;
        }

        const isColumnsSortingCoupledToGroup = this.gos.isColumnsSortingCoupledToGroup();
        let columnsToUpdate = [column];
        if (isColumnsSortingCoupledToGroup) {
            if (column.getColDef().showRowGroup) {
                const rowGroupColumns = this.funcColsService.getSourceColumnsForGroupColumn(column);
                const sortableRowGroupColumns = rowGroupColumns?.filter((col) => col.isSortable());

                if (sortableRowGroupColumns) {
                    columnsToUpdate = [column, ...sortableRowGroupColumns];
                }
            }
        }

        columnsToUpdate.forEach((col) => col.setSort(sort, source));

        const doingMultiSort = (multiSort || this.gos.get('alwaysMultiSort')) && !this.gos.get('suppressMultiSort');

        // clear sort on all columns except those changed, and update the icons
        const updatedColumns: AgColumn[] = [];
        if (!doingMultiSort) {
            const clearedColumns = this.clearSortBarTheseColumns(columnsToUpdate, source);
            updatedColumns.push(...clearedColumns);
        }

        // sortIndex used for knowing order of cols when multi-col sort
        this.updateSortIndex(column);

        updatedColumns.push(...columnsToUpdate);
        this.dispatchSortChangedEvents(source, updatedColumns);
    }

    private updateSortIndex(lastColToChange: AgColumn) {
        const isCoupled = this.gos.isColumnsSortingCoupledToGroup();
        const groupParent = this.showRowGroupColsService?.getShowRowGroupCol(lastColToChange.getId());
        const lastSortIndexCol = isCoupled ? groupParent || lastColToChange : lastColToChange;

        const allSortedCols = this.getColumnsWithSortingOrdered();

        // reset sort index on everything
        this.columnModel.getAllCols().forEach((col) => col.setSortIndex(null));
        const allSortedColsWithoutChangesOrGroups = allSortedCols.filter((col) => {
            if (isCoupled && col.getColDef().showRowGroup) {
                return false;
            }
            return col !== lastSortIndexCol;
        });
        const sortedColsWithIndices = lastSortIndexCol.getSort()
            ? [...allSortedColsWithoutChangesOrGroups, lastSortIndexCol]
            : allSortedColsWithoutChangesOrGroups;
        sortedColsWithIndices.forEach((col, idx) => {
            col.setSortIndex(idx);
        });
    }

    // gets called by API, so if data changes, use can call this, which will end up
    // working out the sort order again of the rows.
    public onSortChanged(source: string, columns?: AgColumn[]): void {
        this.dispatchSortChangedEvents(source, columns);
    }

    public isSortActive(): boolean {
        // pull out all the columns that have sorting set
        const allCols = this.columnModel.getAllCols();
        const sortedCols = allCols.filter((column) => !!column.getSort());
        return sortedCols && sortedCols.length > 0;
    }

    public dispatchSortChangedEvents(source: string, columns?: AgColumn[]): void {
        const event: WithoutGridCommon<SortChangedEvent> = {
            type: 'sortChanged',
            source,
        };

        if (columns) {
            event.columns = columns;
        }
        this.eventService.dispatchEvent(event);
    }

    private clearSortBarTheseColumns(columnsToSkip: AgColumn[], source: ColumnEventType): AgColumn[] {
        const clearedColumns: AgColumn[] = [];
        this.columnModel.getAllCols().forEach((columnToClear) => {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!columnsToSkip.includes(columnToClear)) {
                // add to list of cleared cols when sort direction is set
                if (columnToClear.getSort()) {
                    clearedColumns.push(columnToClear);
                }

                // setting to 'undefined' as null means 'none' rather than cleared, otherwise issue will arise
                // if sort order is: ['desc', null , 'asc'], as it will start at null rather than 'desc'.
                columnToClear.setSort(undefined, source);
            }
        });

        return clearedColumns;
    }

    private getNextSortDirection(column: AgColumn): SortDirection {
        let sortingOrder: SortDirection[] | null | undefined;

        if (column.getColDef().sortingOrder) {
            sortingOrder = column.getColDef().sortingOrder;
        } else if (this.gos.get('sortingOrder')) {
            sortingOrder = this.gos.get('sortingOrder');
        } else {
            sortingOrder = SortController.DEFAULT_SORTING_ORDER;
        }

        if (!Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
            console.warn(
                `AG Grid: sortingOrder must be an array with at least one element, currently it's ${sortingOrder}`
            );
            return null;
        }

        const currentIndex = sortingOrder.indexOf(column.getSort()!);
        const notInArray = currentIndex < 0;
        const lastItemInArray = currentIndex == sortingOrder.length - 1;
        let result: SortDirection;

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

    /**
     * @returns a map of sort indexes for every sorted column, if groups sort primaries then they will have equivalent indices
     */
    private getIndexedSortMap(): Map<AgColumn, number> {
        // pull out all the columns that have sorting set
        let allSortedCols = this.columnModel.getAllCols().filter((col) => !!col.getSort());

        if (this.columnModel.isPivotMode()) {
            const isSortingLinked = this.gos.isColumnsSortingCoupledToGroup();
            allSortedCols = allSortedCols.filter((col) => {
                const isAggregated = !!col.getAggFunc();
                const isSecondary = !col.isPrimary();
                const isGroup = isSortingLinked
                    ? this.showRowGroupColsService?.getShowRowGroupCol(col.getId())
                    : col.getColDef().showRowGroup;
                return isAggregated || isSecondary || isGroup;
            });
        }

        const sortedRowGroupCols = this.funcColsService.getRowGroupColumns().filter((col) => !!col.getSort());

        // when both cols are missing sortIndex, we use the position of the col in all cols list.
        // this means if colDefs only have sort, but no sortIndex, we deterministically pick which
        // cols is sorted by first.
        const allColsIndexes: { [id: string]: number } = {};
        allSortedCols.forEach((col, index) => (allColsIndexes[col.getId()] = index));

        // put the columns in order of which one got sorted first
        allSortedCols.sort((a, b) => {
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

        const isSortLinked = this.gos.isColumnsSortingCoupledToGroup() && !!sortedRowGroupCols.length;
        if (isSortLinked) {
            allSortedCols = [
                ...new Set(
                    // if linked sorting, replace all columns with the display group column for index purposes, and ensure uniqueness
                    allSortedCols.map((col) => this.showRowGroupColsService?.getShowRowGroupCol(col.getId()) ?? col)
                ),
            ];
        }

        const indexMap: Map<AgColumn, number> = new Map();

        allSortedCols.forEach((col, idx) => indexMap.set(col, idx));

        // add the row group cols back
        if (isSortLinked) {
            sortedRowGroupCols.forEach((col) => {
                const groupDisplayCol = this.showRowGroupColsService!.getShowRowGroupCol(col.getId())!;
                indexMap.set(col, indexMap.get(groupDisplayCol)!);
            });
        }

        return indexMap;
    }

    public getColumnsWithSortingOrdered(): AgColumn[] {
        // pull out all the columns that have sorting set
        return (
            [...this.getIndexedSortMap().entries()]
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .sort(([col1, idx1], [col2, idx2]) => idx1 - idx2)
                .map(([col]) => col)
        );
    }

    // used by server side row models, to sent sort to server
    public getSortModel(): SortModelItem[] {
        return this.getColumnsWithSortingOrdered()
            .filter((column) => column.getSort())
            .map((column) => ({
                sort: column.getSort()!,
                colId: column.getId(),
            }));
    }

    public getSortOptions(): SortOption[] {
        return this.getColumnsWithSortingOrdered()
            .filter((column) => column.getSort())
            .map((column) => ({
                sort: column.getSort()!,
                column,
            }));
    }

    public canColumnDisplayMixedSort(column: AgColumn): boolean {
        const isColumnSortCouplingActive = this.gos.isColumnsSortingCoupledToGroup();
        const isGroupDisplayColumn = !!column.getColDef().showRowGroup;
        return isColumnSortCouplingActive && isGroupDisplayColumn;
    }

    public getDisplaySortForColumn(column: AgColumn): SortDirection | 'mixed' | undefined {
        const linkedColumns = this.funcColsService.getSourceColumnsForGroupColumn(column);
        if (!this.canColumnDisplayMixedSort(column) || !linkedColumns?.length) {
            return column.getSort();
        }

        // if column has unique data, its sorting is independent - but can still be mixed
        const columnHasUniqueData = column.getColDef().field != null || !!column.getColDef().valueGetter;
        const sortableColumns = columnHasUniqueData ? [column, ...linkedColumns] : linkedColumns;

        const firstSort = sortableColumns[0].getSort();
        // the == is intentional, as null and undefined both represent no sort, which means they are equivalent
        const allMatch = sortableColumns.every((col) => col.getSort() == firstSort);
        if (!allMatch) {
            return 'mixed';
        }
        return firstSort;
    }

    public getDisplaySortIndexForColumn(column: AgColumn): number | null | undefined {
        return this.getIndexedSortMap().get(column);
    }
}
