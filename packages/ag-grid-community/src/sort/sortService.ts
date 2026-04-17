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

/** Lazily built sort state, invalidated atomically on any sort mutation or column set change.
 *  sortModel and sortOptions are computed on first access from sortedCols. */
interface SortCacheData {
    /** Maps each sorted column to its display sort index. Group-linked columns share an index. */
    indexMap: Map<AgColumn, number>;
    /** All sorted columns in display order. In linked-group mode, row group cols are interleaved after their display col. */
    sortedCols: AgColumn[];
    /** Cached SortModelItem[] for server-side row models. Built lazily from sortedCols. */
    sortModel: SortModelItem[] | null;
    /** Cached SortOption[] for client-side sorting. Built lazily from sortedCols. */
    sortOptions: SortOption[] | null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class SortService extends BeanStub implements NamedBean {
    beanName = 'sortSvc' as const;

    /** Lazily computed sort state — nulled on any sort mutation or column set change. */
    private sortCache: SortCacheData | null = null;
    /** Whether any column has a sort definition. Separate from sortCache — remains valid across sort index changes. */
    private cachedSortActive: boolean | null = null;

    public postConstruct(): void {
        const invalidate = () => this.invalidateSortCache();
        this.addManagedEventListeners({
            gridColumnsChanged: invalidate,
            columnRowGroupChanged: invalidate,
            columnPivotModeChanged: invalidate,
            columnValueChanged: () => {
                // In pivot mode, the sort map filters by col.aggFunc — value column changes invalidate that filter.
                if (this.beans.colModel.pivotMode) {
                    invalidate();
                }
            },
        });
    }

    public override destroy(): void {
        this.invalidateSortCache();
        super.destroy();
    }

    /**
     * Clears all sort-related caches. Correctness relies on two invariants:
     *  1. All writes to sort state (col.setSortDef, col.sortIndex) are confined to this service
     *     (setColSort, setColSortIndex, updateSortIndex, initCol) and each mutating path calls
     *     this method before or immediately after the write.
     *  2. External changes that affect the sort map's inputs without touching sort properties are
     *     covered by event listeners in postConstruct: gridColumnsChanged (column set), columnRowGroupChanged
     *     (coupled sorting inputs), columnPivotModeChanged (pivot filter toggle), and columnValueChanged
     *     (agg func changes that affect the pivot-mode sort filter, guarded by isPivotMode).
     */
    private invalidateSortCache(): void {
        this.sortCache = null;
        this.cachedSortActive = null;
    }

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
        const columnsToUpdate: AgColumn[] = [column];
        if (isColumnsSortingCoupledToGroup && column.colDef.showRowGroup) {
            const rowGroupColumns = showRowGroupCols?.getSourceColumnsForGroupColumn?.(column);
            if (rowGroupColumns) {
                for (let i = 0, len = rowGroupColumns.length; i < len; ++i) {
                    const rgCol = rowGroupColumns[i];
                    if (rgCol.isSortable()) {
                        columnsToUpdate.push(rgCol);
                    }
                }
            }
        }

        for (let i = 0, len = columnsToUpdate.length; i < len; ++i) {
            this.setColSort(columnsToUpdate[i], sortDef, source);
        }

        const doingMultiSort = (multiSort || gos.get('alwaysMultiSort')) && !gos.get('suppressMultiSort');

        const updatedColumns = doingMultiSort ? [] : this.clearSortBarTheseColumns(columnsToUpdate, source);

        // sortIndex used for knowing order of cols when multi-col sort
        this.updateSortIndex(column);

        for (let i = 0, len = columnsToUpdate.length; i < len; ++i) {
            updatedColumns.push(columnsToUpdate[i]);
        }
        this.dispatchSortChangedEvents(source, updatedColumns);
    }

    private updateSortIndex(lastColToChange: AgColumn) {
        const { gos, colModel, showRowGroupCols } = this.beans;
        const isCoupled = _isColumnsSortingCoupledToGroup(gos);
        const groupParent = showRowGroupCols?.getShowRowGroupCol(lastColToChange.colId);
        const lastSortIndexCol = isCoupled ? groupParent || lastColToChange : lastColToChange;

        const allSortedCols = this.getColumnsWithSortingOrdered();

        this.invalidateSortCache();

        const allCols = colModel.getAllCols();
        for (let i = 0, len = allCols.length; i < len; ++i) {
            const col = allCols[i];
            col.sortIndex = null;
            col.dispatchStateUpdatedEvent('sortIndex');
        }

        // Assign new indices in one pass — skip group display cols and lastSortIndexCol, then append lastSortIndexCol
        const lastHasSort = lastSortIndexCol.getSortDef();
        let idx = 0;
        for (let i = 0, len = allSortedCols.length; i < len; ++i) {
            const col = allSortedCols[i];
            if (col === lastSortIndexCol || (isCoupled && col.colDef.showRowGroup)) {
                continue;
            }
            col.sortIndex = idx++;
            col.dispatchStateUpdatedEvent('sortIndex');
        }
        if (lastHasSort) {
            lastSortIndexCol.sortIndex = idx;
            lastSortIndexCol.dispatchStateUpdatedEvent('sortIndex');
        }
    }

    // gets called by API, so if data changes, use can call this, which will end up
    // working out the sort order again of the rows.
    public onSortChanged(source: string, columns?: AgColumn[]): void {
        this.dispatchSortChangedEvents(source, columns);
    }

    public isSortActive(): boolean {
        return this.cachedSortActive ?? this.loadSortActive();
    }

    private loadSortActive(): boolean {
        const allCols = this.beans.colModel.getAllCols();
        for (let i = 0, len = allCols.length; i < len; ++i) {
            if (allCols[i].getSortDef()) {
                this.cachedSortActive = true;
                return true;
            }
        }
        this.cachedSortActive = false;
        return false;
    }

    public dispatchSortChangedEvents(source: string, columns?: AgColumn[]): void {
        const event: WithoutGridCommon<SortChangedEvent> = { type: 'sortChanged', source };
        if (columns) {
            event.columns = columns;
        }
        this.eventSvc.dispatchEvent(event);
    }

    private clearSortBarTheseColumns(columnsToSkip: AgColumn[], source: ColumnEventType): AgColumn[] {
        const clearedColumns: AgColumn[] = [];
        const allCols = this.beans.colModel.getAllCols();

        // Batch: inline setColSort logic to avoid per-column invalidateSortCache calls
        let needsInvalidate = false;
        for (let i = 0, len = allCols.length; i < len; ++i) {
            const col = allCols[i];
            if (!columnsToSkip.includes(col)) {
                if (col.getSortDef()) {
                    clearedColumns.push(col);
                    needsInvalidate = true;
                    // 'undefined' marks the sortDef as implicitly modified (initial),
                    // enabling the groupMaintainOrder feature.
                    // Fresh object per column — setSortDef stores by reference.
                    col.setSortDef(_getSortDefFromInput(), true);
                    col.dispatchColEvent('sortChanged', source);
                }
                col.dispatchStateUpdatedEvent('sort');
            }
        }
        if (needsInvalidate) {
            this.invalidateSortCache();
        }

        return clearedColumns;
    }

    public getNextSortDirection(column: AgColumn, currentSort?: SortDef | SortDirection | null): SortDef {
        const sortingOrder = column.getSortingOrder();
        const currentSortDef = currentSort === undefined ? column.getSortDef() : _getSortDefFromInput(currentSort);
        const currentIndex = sortingOrder.findIndex((e) => _areSortDefsEqual(e, currentSortDef));
        return _getSortDefFromInput(sortingOrder[(currentIndex + 1) % sortingOrder.length]);
    }

    private ensureSortCache(): SortCacheData {
        return this.sortCache ?? this.loadSortCache();
    }

    private loadSortCache(): SortCacheData {
        const { gos, colModel, showRowGroupCols, rowGroupColsSvc } = this.beans;
        const isCoupled = _isColumnsSortingCoupledToGroup(gos);

        let allSortedCols: AgColumn[] = [];
        const allCols = colModel.getAllCols();
        if (colModel.pivotMode) {
            for (let i = 0, len = allCols.length; i < len; ++i) {
                const col = allCols[i];
                if (
                    col.getSortDef() &&
                    (!!col.aggFunc ||
                        !col.isPrimary() ||
                        (isCoupled ? showRowGroupCols?.getShowRowGroupCol(col.colId) : col.colDef.showRowGroup))
                ) {
                    allSortedCols.push(col);
                }
            }
        } else {
            for (let i = 0, len = allCols.length; i < len; ++i) {
                const col = allCols[i];
                if (col.getSortDef()) {
                    allSortedCols.push(col);
                }
            }
        }

        allSortedCols.sort(compareBySortIndex);

        const sortedRowGroupCols =
            isCoupled && rowGroupColsSvc ? rowGroupColsSvc.columns.filter((col) => !!col.getSortDef()) : undefined;
        const isSortLinked = !!sortedRowGroupCols?.length;

        if (isSortLinked) {
            // Replace each col with its display group column, deduplicating in one pass
            const seen = new Set<AgColumn>();
            const deduped: AgColumn[] = [];
            for (let i = 0, len = allSortedCols.length; i < len; ++i) {
                const col = allSortedCols[i];
                const mapped = showRowGroupCols!.getShowRowGroupCol(col.colId) ?? col;
                if (!seen.has(mapped)) {
                    seen.add(mapped);
                    deduped.push(mapped);
                }
            }
            allSortedCols = deduped;
        }

        const indexMap: Map<AgColumn, number> = new Map();
        let sortedCols: AgColumn[];
        if (isSortLinked) {
            // Build ordered list with row group cols interleaved after their display group col
            const ordered: AgColumn[] = [];
            const rgCols = sortedRowGroupCols;
            const rgLen = rgCols.length;
            for (let i = 0, len = allSortedCols.length; i < len; ++i) {
                const col = allSortedCols[i];
                indexMap.set(col, i);
                ordered.push(col);
                for (let j = 0; j < rgLen; ++j) {
                    const rgCol = rgCols[j];
                    if (showRowGroupCols!.getShowRowGroupCol(rgCol.colId) === col) {
                        indexMap.set(rgCol, i);
                        ordered.push(rgCol);
                    }
                }
            }
            sortedCols = ordered;
        } else {
            for (let i = 0, len = allSortedCols.length; i < len; ++i) {
                indexMap.set(allSortedCols[i], i);
            }
            sortedCols = allSortedCols;
        }

        const cache: SortCacheData = { indexMap, sortedCols, sortModel: null, sortOptions: null };
        this.sortCache = cache;
        return cache;
    }

    public getColumnsWithSortingOrdered(): AgColumn[] {
        return this.ensureSortCache().sortedCols;
    }

    // used by server side row models, to send sort to server
    public getSortModel(): SortModelItem[] {
        const cache = this.ensureSortCache();
        return cache.sortModel ?? loadSortModel(cache);
    }

    public getSortOptions(): SortOption[] {
        const cache = this.ensureSortCache();
        return cache.sortOptions ?? loadSortOptions(cache);
    }

    public canColumnDisplayMixedSort(column: AgColumn): boolean {
        return !!column.colDef.showRowGroup && _isColumnsSortingCoupledToGroup(this.gos);
    }

    public getDisplaySortForColumn(column: AgColumn): DisplaySortDef | null {
        const linkedColumns = this.beans.showRowGroupCols?.getSourceColumnsForGroupColumn(column);
        if (!this.canColumnDisplayMixedSort(column) || !linkedColumns?.length) {
            return column.getSortDef();
        }

        // if column has unique data, its sorting is independent - but can still be mixed
        const colDef = column.colDef;
        const columnHasUniqueData = colDef.field != null || !!colDef.valueGetter;
        const sortableColumns = columnHasUniqueData ? [column, ...linkedColumns] : linkedColumns;

        const firstSort = sortableColumns[0].getSortDef();
        // the == is intentional, as null and undefined both represent no sort, which means they are equivalent
        const allMatch = sortableColumns.every((col) => _areSortDefsEqual(col.getSortDef(), firstSort));
        if (!allMatch) {
            return { type: _normalizeSortType(column.getSortDef()?.type), direction: 'mixed' };
        }
        return firstSort;
    }

    public getDisplaySortIndexForColumn(column: AgColumn): number | undefined {
        return this.ensureSortCache().indexMap.get(column);
    }

    public setupHeader(comp: Component, column: AgColumn): void {
        const refreshStyles = () => {
            const { type, direction } = _getSortDefFromInput(column.getSortDef());
            comp.toggleCss('ag-header-cell-sorted-asc', direction === 'asc');
            comp.toggleCss('ag-header-cell-sorted-desc', direction === 'desc');
            comp.toggleCss('ag-header-cell-sorted-abs-asc', type === 'absolute' && direction === 'asc');
            comp.toggleCss('ag-header-cell-sorted-abs-desc', type === 'absolute' && direction === 'desc');
            comp.toggleCss('ag-header-cell-sorted-none', !direction);

            if (column.colDef.showRowGroup) {
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
            sortChanged: refreshStyles,
            columnPinned: refreshStyles,
            columnRowGroupChanged: refreshStyles,
            displayedColumnsChanged: refreshStyles,
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
        if (sortDefOrDirection !== undefined) {
            this.setColSort(column, _getSortDefFromInput(sortDefOrDirection), source);
        }
    }

    private setColSort(column: AgColumn, sort: SortDef | undefined, source: ColumnEventType): void {
        if (!_areSortDefsEqual(column.getSortDef(), sort)) {
            this.invalidateSortCache();
            column.setSortDef(_getSortDefFromInput(sort), sort === undefined);
            column.dispatchColEvent('sortChanged', source);
        }
        column.dispatchStateUpdatedEvent('sort');
    }

    public setColSortIndex(column: AgColumn, sortOrder?: number | null): void {
        if (column.sortIndex !== sortOrder) {
            this.invalidateSortCache();
            column.sortIndex = sortOrder;
        }
        column.dispatchStateUpdatedEvent('sortIndex');
    }

    public createSortIndicator(skipTemplate?: boolean): SortIndicatorComp {
        return new SortIndicatorComp(skipTemplate);
    }

    public getSortIndicatorSelector(): ComponentSelector {
        return SortIndicatorSelector;
    }
}

/** Sorts columns by sortIndex. Columns with sortIndex come first (ascending);
 *  columns without sortIndex preserve their relative (discovery) order via stable sort. */
const compareBySortIndex = (a: AgColumn, b: AgColumn): number =>
    // null/undefined -> 0x7fffffff so missing indices sort last; equal sentinels → 0 (stable)
    (a.sortIndex ?? 0x7fffffff) - (b.sortIndex ?? 0x7fffffff);

const loadSortModel = (cache: SortCacheData): SortModelItem[] => {
    const cols = cache.sortedCols;
    const result: SortModelItem[] = [];
    for (let i = 0, len = cols.length; i < len; ++i) {
        const col = cols[i];
        const def = col.getSortDef();
        const sort = def?.direction;
        if (sort) {
            result.push({ sort, type: _normalizeSortType(def.type), colId: col.colId });
        }
    }
    cache.sortModel = result;
    return result;
};

const loadSortOptions = (cache: SortCacheData): SortOption[] => {
    const cols = cache.sortedCols;
    const result: SortOption[] = [];
    for (let i = 0, len = cols.length; i < len; ++i) {
        const column = cols[i];
        const def = column.getSortDef();
        const sort = def?.direction;
        if (sort) {
            result.push({ sort, type: _normalizeSortType(def.type), column });
        }
    }
    cache.sortOptions = result;
    return result;
};
