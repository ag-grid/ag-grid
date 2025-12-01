import { _getSortDefFromColDef } from '../columns/columnUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { _areSortDefsEqual, _getSortDefFromInput, _normalizeSortType } from '../entities/agColumn';
import type { DisplaySortDef, SortDef, SortDirection } from '../entities/colDef';
import type { ColumnEventType, SortChangedEvent } from '../events';
import { _isColumnsSortingCoupledToGroup } from '../gridOptionsUtils';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { SortModelItem } from '../interfaces/iSortModelItem';
import type { SortOption } from '../interfaces/iSortOption';
import type { Component, ComponentSelector } from '../widgets/component';
import { SortIndicatorComp, SortIndicatorSelector } from './sortIndicatorComp';

export class SortService extends BeanStub implements NamedBean {
    beanName = 'sortSvc' as const;

    public progressSort(column: AgColumn, multiSort: boolean, source: ColumnEventType): void {
        const nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort, source);
    }

    public progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        const sortUsingCtrl = this.gos.get('multiSortKey') === 'ctrl';
        const multiSort = sortUsingCtrl ? event.ctrlKey || event.metaKey : event.shiftKey;
        this.progressSort(column, multiSort, 'uiColumnSorted');
    }

    public setSortForColumn(column: AgColumn, sortDef: SortDef, multiSort: boolean, source: ColumnEventType): void {
        const { gos, showRowGroupCols } = this.beans;

        const isColumnsSortingCoupledToGroup = _isColumnsSortingCoupledToGroup(gos);
        let columnsToUpdate = [column];
        if (isColumnsSortingCoupledToGroup) {
            if (column.getColDef().showRowGroup) {
                const rowGroupColumns = showRowGroupCols?.getSourceColumnsForGroupColumn?.(column);
                const sortableRowGroupColumns = rowGroupColumns?.filter((col) => col.isSortable());

                if (sortableRowGroupColumns) {
                    columnsToUpdate = [column, ...sortableRowGroupColumns];
                }
            }
        }

        for (const col of columnsToUpdate) {
            this.setColSort(col, sortDef, source);
        }
        const doingMultiSort = (multiSort || gos.get('alwaysMultiSort')) && !gos.get('suppressMultiSort');

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
        const { gos, colModel, showRowGroupCols } = this.beans;
        const isCoupled = _isColumnsSortingCoupledToGroup(gos);
        const groupParent = showRowGroupCols?.getShowRowGroupCol(lastColToChange.getId());
        const lastSortIndexCol = isCoupled ? groupParent || lastColToChange : lastColToChange;

        const allSortedCols = this.getColumnsWithSortingOrdered();

        // reset sort index on everything
        colModel.forAllCols((col) => this.setColSortIndex(col, null));

        const allSortedColsWithoutChangesOrGroups = allSortedCols.filter((col) => {
            if (isCoupled && col.getColDef().showRowGroup) {
                return false;
            }
            return col !== lastSortIndexCol;
        });
        const sortedColsWithIndices = lastSortIndexCol.getSortDef()
            ? [...allSortedColsWithoutChangesOrGroups, lastSortIndexCol]
            : allSortedColsWithoutChangesOrGroups;
        sortedColsWithIndices.forEach((col, idx) => this.setColSortIndex(col, idx));
    }

    // gets called by API, so if data changes, use can call this, which will end up
    // working out the sort order again of the rows.
    public onSortChanged(source: string, columns?: AgColumn[]): void {
        this.dispatchSortChangedEvents(source, columns);
    }

    public isSortActive(): boolean {
        // pull out all the columns that have sorting set
        let isSorting = false;
        this.beans.colModel.forAllCols((col) => {
            if (col.getSortDef()) {
                isSorting = true;
                return true; // exit loop early
            }
        });
        return isSorting;
    }

    public dispatchSortChangedEvents(source: string, columns?: AgColumn[]): void {
        const event: WithoutGridCommon<SortChangedEvent> = {
            type: 'sortChanged',
            source,
        };

        if (columns) {
            event.columns = columns;
        }
        this.eventSvc.dispatchEvent(event);
    }

    private clearSortBarTheseColumns(columnsToSkip: AgColumn[], source: ColumnEventType): AgColumn[] {
        const clearedColumns: AgColumn[] = [];
        this.beans.colModel.forAllCols((columnToClear) => {
            // Do not clear if either holding shift, or if column in question was clicked
            if (!columnsToSkip.includes(columnToClear)) {
                // add to list of cleared cols when sort direction is set
                if (columnToClear.getSortDef()) {
                    clearedColumns.push(columnToClear);
                }

                // setting to 'undefined' hits a special condition, which marks
                // a column's sortDef as implicitly modified (initial), this allows
                // groupMaintainOrder gridOption feature to work
                this.setColSort(columnToClear, undefined, source);
            }
        });

        return clearedColumns;
    }

    private getNextSortDirection(column: AgColumn): SortDef {
        const sortingOrder = column.getSortingOrder();

        const currentSortDef = column.getSortDef();
        const currentIndex = sortingOrder.findIndex((e) => _areSortDefsEqual(e, currentSortDef));

        let nextIndex = Math.max(0, currentIndex) + 1;
        if (nextIndex >= sortingOrder.length) {
            nextIndex = 0;
        }
        return _getSortDefFromInput(sortingOrder[nextIndex]);
    }

    /**
     * @returns a map of sort indexes for every sorted column, if groups sort primaries then they will have equivalent indices
     */
    private getIndexedSortMap(): Map<AgColumn, number> {
        const { gos, colModel, showRowGroupCols, rowGroupColsSvc } = this.beans;
        // pull out all the columns that have sorting set
        let allSortedCols: AgColumn[] = [];
        colModel.forAllCols((col) => {
            if (col.getSortDef()) {
                allSortedCols.push(col);
            }
        });

        if (colModel.isPivotMode()) {
            const isSortingLinked = _isColumnsSortingCoupledToGroup(gos);
            allSortedCols = allSortedCols.filter((col) => {
                const isAggregated = !!col.getAggFunc();
                const isSecondary = !col.isPrimary();
                const isGroup = isSortingLinked
                    ? showRowGroupCols?.getShowRowGroupCol(col.getId())
                    : col.getColDef().showRowGroup;
                return isAggregated || isSecondary || isGroup;
            });
        }

        const sortedRowGroupCols = rowGroupColsSvc?.columns.filter((col) => !!col.getSortDef()) ?? [];

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

        const isSortLinked = _isColumnsSortingCoupledToGroup(gos) && !!sortedRowGroupCols.length;
        if (isSortLinked) {
            allSortedCols = [
                ...new Set(
                    // if linked sorting, replace all columns with the display group column for index purposes, and ensure uniqueness
                    allSortedCols.map((col) => showRowGroupCols?.getShowRowGroupCol(col.getId()) ?? col)
                ),
            ];
        }

        const indexMap: Map<AgColumn, number> = new Map();

        allSortedCols.forEach((col, idx) => indexMap.set(col, idx));

        // add the row group cols back
        if (isSortLinked) {
            for (const col of sortedRowGroupCols) {
                const groupDisplayCol = showRowGroupCols!.getShowRowGroupCol(col.getId())!;
                indexMap.set(col, indexMap.get(groupDisplayCol)!);
            }
        }

        return indexMap;
    }

    public getColumnsWithSortingOrdered(): AgColumn[] {
        // pull out all the columns that have sorting set
        return [...this.getIndexedSortMap().entries()].sort(([, idx1], [, idx2]) => idx1 - idx2).map(([col]) => col);
    }

    /**
     * Util method to collect sort items by going through sorted columns once.
     */
    private collectSortItems<T extends SortOption | SortModelItem>(asSortModel: boolean = false): T[] {
        const sortItems: T[] = [];
        const columnsWithSortingOrdered = this.getColumnsWithSortingOrdered();
        for (const column of columnsWithSortingOrdered) {
            const sort = column.getSortDef()?.direction;
            if (!sort) {
                continue;
            }
            const type = _normalizeSortType(column.getSortDef()?.type);
            const sortItem = { sort, type } as T;
            if (asSortModel) {
                (sortItem as SortModelItem).colId = column.getId();
            } else {
                (sortItem as SortOption).column = column;
            }
            sortItems.push(sortItem);
        }
        return sortItems;
    }

    // used by server side row models, to send sort to server
    public getSortModel(): SortModelItem[] {
        return this.collectSortItems(true);
    }

    public getSortOptions(): SortOption[] {
        return this.collectSortItems();
    }

    public canColumnDisplayMixedSort(column: AgColumn): boolean {
        const isColumnSortCouplingActive = _isColumnsSortingCoupledToGroup(this.gos);
        const isGroupDisplayColumn = !!column.getColDef().showRowGroup;
        return isColumnSortCouplingActive && isGroupDisplayColumn;
    }

    public getDisplaySortForColumn(column: AgColumn): DisplaySortDef | null {
        const linkedColumns = this.beans.showRowGroupCols?.getSourceColumnsForGroupColumn(column);
        if (!this.canColumnDisplayMixedSort(column) || !linkedColumns?.length) {
            return column.getSortDef();
        }

        // if column has unique data, its sorting is independent - but can still be mixed
        const columnHasUniqueData = column.getColDef().field != null || !!column.getColDef().valueGetter;
        const sortableColumns = columnHasUniqueData ? [column, ...linkedColumns] : linkedColumns;

        const firstSort = sortableColumns[0].getSortDef();
        // the == is intentional, as null and undefined both represent no sort, which means they are equivalent
        const allMatch = sortableColumns.every((col) => _areSortDefsEqual(col.getSortDef(), firstSort));
        if (!allMatch) {
            return { type: _normalizeSortType(column.getSortDef()?.type), direction: 'mixed' };
        }
        return firstSort;
    }

    public getDisplaySortIndexForColumn(column: AgColumn): number | null | undefined {
        return this.getIndexedSortMap().get(column);
    }

    public setupHeader(comp: Component, column: AgColumn): void {
        const onSortingChanged = () => {
            const { type, direction } = _getSortDefFromInput(column.getSortDef());
            comp.toggleCss('ag-header-cell-sorted-asc', direction === 'asc');
            comp.toggleCss('ag-header-cell-sorted-desc', direction === 'desc');
            comp.toggleCss('ag-header-cell-sorted-abs-asc', type === 'absolute' && direction === 'asc');
            comp.toggleCss('ag-header-cell-sorted-abs-desc', type === 'absolute' && direction === 'desc');
            comp.toggleCss('ag-header-cell-sorted-none', !direction);

            if (column.getColDef().showRowGroup) {
                const sourceColumns = this.beans.showRowGroupCols?.getSourceColumnsForGroupColumn(column);
                // this == is intentional, as it allows null and undefined to match, which are both unsorted states
                const sortDirectionsMatch = sourceColumns?.every(
                    (sourceCol) => direction == sourceCol.getSortDef()?.direction
                );
                const isMultiSorting = !sortDirectionsMatch;

                comp.toggleCss('ag-header-cell-sorted-mixed', isMultiSorting);
            }
        };
        comp.addManagedEventListeners({
            sortChanged: onSortingChanged,
            columnRowGroupChanged: onSortingChanged,
        });
    }

    public initCol(column: AgColumn): void {
        const { sortIndex, initialSortIndex } = column.colDef;

        const sortDef = _getSortDefFromColDef(column.colDef);
        if (sortDef) {
            column.setSortDef(sortDef, true);
        }

        if (sortIndex !== undefined) {
            if (sortIndex !== null) {
                column.sortIndex = sortIndex;
            }
        } else if (initialSortIndex !== null) {
            column.sortIndex = initialSortIndex;
        }
    }

    /**
     * Update a column's sort state from a sort definition.
     * If `sortDefOrDirection` is `undefined`, the call is a no-op (no change).
     */
    public updateColSort(
        column: AgColumn,
        sortDefOrDirection: SortDirection | SortDef | undefined,
        source: ColumnEventType
    ): void {
        if (sortDefOrDirection === undefined) {
            return;
        }

        this.setColSort(column, _getSortDefFromInput(sortDefOrDirection), source);
    }

    private setColSort(column: AgColumn, sort: SortDef | undefined, source: ColumnEventType): void {
        if (!_areSortDefsEqual(column.getSortDef(), sort)) {
            column.setSortDef(_getSortDefFromInput(sort), sort === undefined);
            column.dispatchColEvent('sortChanged', source);
        }
        column.dispatchStateUpdatedEvent('sort');
    }

    public setColSortIndex(column: AgColumn, sortOrder?: number | null): void {
        column.sortIndex = sortOrder;
        column.dispatchStateUpdatedEvent('sortIndex');
    }

    public createSortIndicator(skipTemplate?: boolean): SortIndicatorComp {
        return new SortIndicatorComp(skipTemplate);
    }

    public getSortIndicatorSelector(): ComponentSelector {
        return SortIndicatorSelector;
    }
}
