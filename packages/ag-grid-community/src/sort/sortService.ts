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

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *
 * Sort caches and their invalidation triggers:
 *
 * | Cache                       | Depends on                                      | Invalidated by                                                                                                              |
 * | --------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
 * | cachedSortedCols + indexMap | column-set, sortDef presence, sortIndex         | invalidateAll, invalidateOrder                                                                                              |
 * | cachedSortModel + Options   | cachedSortedCols + each col's direction/type    | invalidateAll, invalidateOrder, invalidateDerived                                                                           |
 * | cachedSortActive            | sortDef presence only                           | invalidateAll                                                                                                               |
 *
 * Trigger sites:
 * - invalidateAll:     gridColumnsChanged, newColumnsLoaded, columnRowGroupChanged, columnPivotModeChanged,
 *                      columnValueChanged (pivot mode), setColSort (presence flip), clearSortBarTheseColumns.
 * - invalidateOrder:   setColSortIndex, updateSortIndex.
 * - invalidateDerived: setColSort (direction/type-only change).
 *
 * Coverage rationale: every code path that mutates a column's sortDef goes through setColSort or
 * clearSortBarTheseColumns. Every path that mutates sortIndex goes through setColSortIndex or
 * updateSortIndex. Column-set and pivot-mode changes are covered by event listeners. Together
 * these cover all inputs the caches read.
 */
export class SortService extends BeanStub implements NamedBean {
    beanName = 'sortSvc' as const;

    private cachedSortedCols: AgColumn[] | null = null;
    private cachedSortedColsIndexMap: Map<AgColumn, number> | null = null;
    private cachedSortModel: SortModelItem[] | null = null;
    private cachedSortOptions: SortOption[] | null = null;
    /** Survives sortIndex and direction changes — only flips when sortDef presence flips. */
    private cachedSortActive: boolean | null = null;

    public postConstruct(): void {
        const invalidate = () => this.invalidateAll();
        this.addManagedEventListeners({
            gridColumnsChanged: invalidate,
            newColumnsLoaded: invalidate,
            columnRowGroupChanged: invalidate,
            columnPivotModeChanged: invalidate,
            columnValueChanged: () => {
                // Pivot-mode sort filters by col.aggFunc; value-column changes can flip that filter.
                if (this.beans.colModel.pivotMode) {
                    invalidate();
                }
            },
        });
    }

    public override destroy(): void {
        this.invalidateAll();
        super.destroy();
    }

    /** Drops every cache. Use when sortDef presence may have changed. */
    private invalidateAll(): void {
        this.invalidateOrder();
        this.cachedSortActive = null;
    }

    /** Drops ordering caches; keeps sort-active. Use for sortIndex-only changes. */
    private invalidateOrder(): void {
        this.cachedSortedCols = null;
        this.cachedSortedColsIndexMap = null;
        this.cachedSortModel = null;
        this.cachedSortOptions = null;
    }

    /** Drops only derived projections. Use for direction-only or type-only changes. */
    private invalidateDerived(): void {
        this.cachedSortModel = null;
        this.cachedSortOptions = null;
    }

    public progressSort(column: AgColumn, multiSort: boolean, source: ColumnEventType): void {
        const nextDirection = this.getNextSortDirection(column);
        this.setSortForColumn(column, nextDirection, multiSort, source);
    }

    public progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        const multiSort = this.gos.get('multiSortKey') === 'ctrl' ? event.ctrlKey || event.metaKey : event.shiftKey;
        this.progressSort(column, multiSort, 'uiColumnSorted');
    }

    public setSortForColumn(column: AgColumn, sortDef: SortDef, multiSort: boolean, source: ColumnEventType): void {
        const { gos, showRowGroupCols } = this.beans;

        // Linked groups: update both the display col and its source row-group cols together.
        const columnsToUpdate: AgColumn[] = [column];
        if (_isColumnsSortingCoupledToGroup(gos) && column.colDef.showRowGroup) {
            const rowGroupColumns = showRowGroupCols?.getSourceColumnsForGroupColumn?.(column);
            if (rowGroupColumns) {
                for (let i = 0, len = rowGroupColumns.length; i < len; ++i) {
                    const rowGroupCol = rowGroupColumns[i];
                    if (rowGroupCol.isSortable()) {
                        columnsToUpdate.push(rowGroupCol);
                    }
                }
            }
        }

        for (let i = 0, len = columnsToUpdate.length; i < len; ++i) {
            this.setColSort(columnsToUpdate[i], sortDef, source);
        }

        const doingMultiSort = (multiSort || gos.get('alwaysMultiSort')) && !gos.get('suppressMultiSort');
        const updatedColumns = doingMultiSort ? [] : this.clearSortBarTheseColumns(columnsToUpdate, source);

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

        // Cached list reflects OLD sortIndex — exactly what we need to drive the reassignment.
        const allSortedCols = this.cachedSortedCols ?? this.computeSortedCols();

        // Match baseline: unconditionally assign null + dispatch for every col.
        const allCols = colModel.getAllCols();
        for (let i = 0, len = allCols.length; i < len; ++i) {
            const col = allCols[i];
            col.sortIndex = null;
            col.dispatchStateUpdatedEvent('sortIndex');
        }

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

        this.invalidateOrder();
    }

    public onSortChanged(source: string, columns?: AgColumn[]): void {
        this.dispatchSortChangedEvents(source, columns);
    }

    public isSortActive(): boolean {
        return this.cachedSortActive ?? this.loadSortActive();
    }

    private loadSortActive(): boolean {
        // Free when cachedSortedCols is populated; otherwise scan once.
        const sortedList = this.cachedSortedCols;
        let active: boolean;
        if (sortedList) {
            active = sortedList.length > 0;
        } else {
            active = false;
            const allCols = this.beans.colModel.getAllCols();
            for (let i = 0, len = allCols.length; i < len; ++i) {
                if (allCols[i].getSortDef()) {
                    active = true;
                    break;
                }
            }
        }
        this.cachedSortActive = active;
        return active;
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
        // O(1) skip lookup; columnsToSkip is short but allCols can be in the thousands.
        const skipSet = columnsToSkip.length > 1 ? new Set(columnsToSkip) : null;
        const skipOne = columnsToSkip.length === 1 ? columnsToSkip[0] : null;

        // Batched: inlines setColSort to invalidate once at the end instead of per column.
        let needsInvalidate = false;
        for (let i = 0, len = allCols.length; i < len; ++i) {
            const col = allCols[i];
            if (col === skipOne || skipSet?.has(col)) {
                continue;
            }
            if (col.getSortDef()) {
                clearedColumns.push(col);
                needsInvalidate = true;
                // `undefined` (not null) marks the sortDef as implicitly modified, enabling groupMaintainOrder.
                col.setSortDef(_getSortDefFromInput(), true);
                col.dispatchColEvent('sortChanged', source);
            }
            col.dispatchStateUpdatedEvent('sort');
        }
        if (needsInvalidate) {
            this.invalidateAll();
        }

        return clearedColumns;
    }

    public getNextSortDirection(column: AgColumn, currentSort?: SortDef | SortDirection | null): SortDef {
        const sortingOrder = column.getSortingOrder();
        const currentSortDef = currentSort === undefined ? column.getSortDef() : _getSortDefFromInput(currentSort);
        const currentIndex = sortingOrder.findIndex((e) => _areSortDefsEqual(e, currentSortDef));
        return _getSortDefFromInput(sortingOrder[(currentIndex + 1) % sortingOrder.length]);
    }

    private ensureSortedColsList(): AgColumn[] {
        let list = this.cachedSortedCols;
        if (!list) {
            list = this.computeSortedCols();
            this.cachedSortedCols = list;
        }
        return list;
    }

    private ensureSortedColsIndexMap(): Map<AgColumn, number> {
        let map = this.cachedSortedColsIndexMap;
        if (!map) {
            map = this.buildSortedColsIndexMap(this.ensureSortedColsList());
            this.cachedSortedColsIndexMap = map;
        }
        return map;
    }

    /** Builds a column → display-index map. In linked-group mode, row-group cols share their
     *  parent display col's index (so the indicator UI shows the same ordinal for both). The
     *  index counts display cols only, not their interleaved row-group children. */
    private buildSortedColsIndexMap(sortedCols: AgColumn[]): Map<AgColumn, number> {
        const map = new Map<AgColumn, number>();
        const showRowGroupCols = this.beans.showRowGroupCols;
        const isCoupled = _isColumnsSortingCoupledToGroup(this.gos);
        let displayIdx = -1;
        for (let i = 0, len = sortedCols.length; i < len; ++i) {
            const col = sortedCols[i];
            const reflected = isCoupled ? showRowGroupCols?.getShowRowGroupCol(col.colId) : undefined;
            if (reflected && reflected !== col) {
                // Row-group child of the most recently seen display col — share its index.
                map.set(col, displayIdx);
            } else {
                // Display col (or non-linked col) — advance to the next display index.
                map.set(col, ++displayIdx);
            }
        }
        return map;
    }

    private computeSortedCols(): AgColumn[] {
        const { gos, colModel, showRowGroupCols, rowGroupColsSvc } = this.beans;
        const isCoupled = _isColumnsSortingCoupledToGroup(gos);
        const linkedMode = isCoupled && rowGroupColsSvc !== undefined;

        const allSortedCols: AgColumn[] = [];
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

        // Single-element sort is a no-op; skip the function call overhead.
        if (allSortedCols.length > 1) {
            allSortedCols.sort(compareBySortIndex);
        }

        if (!linkedMode) {
            return allSortedCols;
        }

        // Linked-group mode: build displayCol → [rowGroupCol, ...] for the interleave below.
        let rowGroupColsByDisplayCol: Map<AgColumn, AgColumn[]> | undefined;
        const rowGroupColumns = rowGroupColsSvc.columns;
        for (let i = 0, len = rowGroupColumns.length; i < len; ++i) {
            const rowGroupCol = rowGroupColumns[i];
            if (!rowGroupCol.getSortDef()) {
                continue;
            }
            const displayCol = showRowGroupCols!.getShowRowGroupCol(rowGroupCol.colId);
            if (!displayCol) {
                continue;
            }
            if (rowGroupColsByDisplayCol) {
                const existing = rowGroupColsByDisplayCol.get(displayCol);
                if (existing) {
                    existing.push(rowGroupCol);
                } else {
                    rowGroupColsByDisplayCol.set(displayCol, [rowGroupCol]);
                }
            } else {
                rowGroupColsByDisplayCol = new Map<AgColumn, AgColumn[]>().set(displayCol, [rowGroupCol]);
            }
        }

        if (!rowGroupColsByDisplayCol) {
            return allSortedCols;
        }

        const seen = new Set<AgColumn>();
        const sortedCols: AgColumn[] = [];
        for (let i = 0, len = allSortedCols.length; i < len; ++i) {
            const col = allSortedCols[i];
            const mapped = showRowGroupCols!.getShowRowGroupCol(col.colId) ?? col;
            if (seen.has(mapped)) {
                continue;
            }
            seen.add(mapped);
            sortedCols.push(mapped);
            const rowGroupCols = rowGroupColsByDisplayCol.get(mapped);
            if (rowGroupCols) {
                for (let j = 0, len = rowGroupCols.length; j < len; ++j) {
                    sortedCols.push(rowGroupCols[j]);
                }
            }
        }

        return sortedCols;
    }

    public getColumnsWithSortingOrdered(): AgColumn[] {
        return this.ensureSortedColsList();
    }

    public getSortModel(): SortModelItem[] {
        return this.cachedSortModel ?? this.loadSortModel();
    }

    public getSortOptions(): SortOption[] {
        return this.cachedSortOptions ?? this.loadSortOptions();
    }

    private loadSortModel(): SortModelItem[] {
        const cols = this.ensureSortedColsList();
        const result: SortModelItem[] = [];
        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            const def = col.getSortDef();
            const sort = def?.direction;
            if (sort) {
                result.push({ sort, type: _normalizeSortType(def.type), colId: col.colId });
            }
        }
        this.cachedSortModel = result;
        return result;
    }

    private loadSortOptions(): SortOption[] {
        const cols = this.ensureSortedColsList();
        const result: SortOption[] = [];
        for (let i = 0, len = cols.length; i < len; ++i) {
            const column = cols[i];
            const def = column.getSortDef();
            const sort = def?.direction;
            if (sort) {
                result.push({ sort, type: _normalizeSortType(def.type), column });
            }
        }
        this.cachedSortOptions = result;
        return result;
    }

    public canColumnDisplayMixedSort(column: AgColumn): boolean {
        return !!column.colDef.showRowGroup && _isColumnsSortingCoupledToGroup(this.gos);
    }

    public getDisplaySortForColumn(column: AgColumn): DisplaySortDef | null {
        const linkedColumns = this.beans.showRowGroupCols?.getSourceColumnsForGroupColumn(column);
        if (!this.canColumnDisplayMixedSort(column) || !linkedColumns?.length) {
            return column.getSortDef();
        }

        // Column with its own field/valueGetter sorts independently of the linked group.
        const colDef = column.colDef;
        const sortableColumns =
            colDef.field != null || !!colDef.valueGetter ? [column, ...linkedColumns] : linkedColumns;

        const firstSort = sortableColumns[0].getSortDef();
        for (let i = 1, len = sortableColumns.length; i < len; ++i) {
            if (!_areSortDefsEqual(sortableColumns[i].getSortDef(), firstSort)) {
                return { type: _normalizeSortType(column.getSortDef()?.type), direction: 'mixed' };
            }
        }
        return firstSort;
    }

    public getDisplaySortIndexForColumn(column: AgColumn): number | undefined {
        return this.ensureSortedColsIndexMap().get(column);
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
                // == intentional: null and undefined both mean "unsorted".
                const allMatch = sourceColumns?.every((src) => direction == src.getSortDef()?.direction);
                comp.toggleCss('ag-header-cell-sorted-mixed', !allMatch);
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
        const colDef = column.colDef;
        const sortDef = _getSortDefFromColDef(colDef);
        if (sortDef) {
            column.setSortDef(sortDef, true);
        }
        // sortIndex wins over initialSortIndex; null on either is treated as "leave unset".
        const { sortIndex, initialSortIndex } = colDef;
        if (sortIndex != null) {
            column.sortIndex = sortIndex;
        } else if (sortIndex === undefined && initialSortIndex !== null) {
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
        const previous = column.getSortDef();
        if (!_areSortDefsEqual(previous, sort)) {
            // Presence flip changes membership → invalidateAll. Direction/type-only → derived only.
            const presenceFlipped = !!previous !== !!sort;
            if (presenceFlipped) {
                this.invalidateAll();
            } else {
                this.invalidateDerived();
            }
            column.setSortDef(_getSortDefFromInput(sort), sort === undefined);
            column.dispatchColEvent('sortChanged', source);
        }
        column.dispatchStateUpdatedEvent('sort');
    }

    public setColSortIndex(column: AgColumn, sortOrder?: number | null): void {
        if (column.sortIndex !== sortOrder) {
            this.invalidateOrder();
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
 *  columns without sortIndex preserve their relative (discovery) order via stable sort.
 *  Relies on Array.prototype.sort being stable (ECMAScript 2019+, all supported browsers).
 *  Input order is `colModel.getAllCols()` order, which is the implicit secondary key. */
const compareBySortIndex = (a: AgColumn, b: AgColumn): number =>
    // null/undefined -> 0x7fffffff so missing indices sort last; equal sentinels → 0 (stable)
    (a.sortIndex ?? 0x7fffffff) - (b.sortIndex ?? 0x7fffffff);
