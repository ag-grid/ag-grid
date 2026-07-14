import { getSortDefFromColDef } from '../columns/columnUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { _normalizeSortType, getSortDefFromInput, getSortingOrder } from '../entities/agColumn';
import type { ColumnEventType, SortChangedEvent } from '../events';
import { _isColumnsSortingCoupledToGroup } from '../gridOptionsUtils';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { DisplaySortDef, SortDef, SortDirection } from '../interfaces/iSort';
import type { SortModelItem } from '../interfaces/iSortModelItem';
import type { SortOption } from '../interfaces/iSortOption';
import type { Component } from '../widgets/component';
import { SortIndicatorComp, SortIndicatorSelector } from './sortIndicatorComp';
import { _resolveSortOptions } from './sortOptionUtils';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class SortService extends BeanStub implements NamedBean {
    beanName = 'sortSvc' as const;

    public readonly SortIndicatorSelector = SortIndicatorSelector;
    public readonly SortIndicatorComp = SortIndicatorComp;

    private cols: AgColumn[] | null = null;
    private map: Map<AgColumn, number> | null = null;
    private opts: SortOption[] | null = null;
    private multi = false;

    public override destroy(): void {
        super.destroy();
        this.invalidate();
    }

    public invalidate(): void {
        this.cols = null;
        this.map = null;
        this.opts = null;
    }

    public progressSort(column: AgColumn, multiSort: boolean, source: ColumnEventType): void {
        this.setSortForColumn(column, this.getNextSortDirection(column), multiSort, source);
    }

    public progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        const sortUsingCtrl = this.gos.get('multiSortKey') === 'ctrl';
        const multiSort = sortUsingCtrl ? event.ctrlKey || event.metaKey : event.shiftKey;
        this.progressSort(column, multiSort, 'uiColumnSorted');
    }

    public setSortForColumn(column: AgColumn, sortDef: SortDef, multiSort: boolean, source: ColumnEventType): void {
        const { gos, showRowGroupCols } = this.beans;
        const coupled = _isColumnsSortingCoupledToGroup(gos);

        const columnsToUpdate: AgColumn[] = [column];
        if (column.showRowGroup && coupled) {
            const rowGroupColumns = showRowGroupCols?.getSourceColumnsForGroupColumn?.(column);
            for (let i = 0, len = rowGroupColumns?.length ?? 0; i < len; ++i) {
                const col = rowGroupColumns![i];
                if (col.isSortable()) {
                    columnsToUpdate.push(col);
                }
            }
        }

        for (let i = 0, len = columnsToUpdate.length; i < len; ++i) {
            this.setColSort(columnsToUpdate[i], sortDef, source);
        }

        const displayCol = coupled ? column.showRowGroupCol : null;
        if (displayCol) {
            columnsToUpdate.push(displayCol);
        }

        const doingMultiSort = (multiSort || gos.get('alwaysMultiSort')) && !gos.get('suppressMultiSort');
        const updatedColumns = doingMultiSort ? [] : this.clearSortBarTheseColumns(columnsToUpdate, source);

        // Must run after clearSortBarTheseColumns, which may clear sibling sources in single-sort mode.
        if (displayCol) {
            this.setColSort(displayCol, this.getCoupledGroupSortDef(displayCol), source);
        }

        this.updateSortIndex(column);
        for (let i = 0, len = columnsToUpdate.length; i < len; ++i) {
            updatedColumns.push(columnsToUpdate[i]);
        }
        this.dispatchSortChangedEvents(source, updatedColumns);
    }

    /** A coupled display group col's own sortDef derived from its source cols: the first sorted source's
     *  def (only its truthiness matters — the arrow is source-derived), or unsorted when none is sorted. */
    private getCoupledGroupSortDef(displayCol: AgColumn): SortDef {
        const sourceCols = this.beans.showRowGroupCols?.getSourceColumnsForGroupColumn(displayCol);
        for (let i = 0, len = sourceCols?.length ?? 0; i < len; ++i) {
            const sortDef = sourceCols![i].getSortDef();
            if (sortDef) {
                return sortDef;
            }
        }
        return getSortDefFromInput();
    }

    private updateSortIndex(lastColToChange: AgColumn) {
        const { gos, colModel } = this.beans;
        const isCoupled = _isColumnsSortingCoupledToGroup(gos);
        const lastSortIndexCol = isCoupled ? lastColToChange.showRowGroupCol || lastColToChange : lastColToChange;

        // Read the old-order list before mutating sortIndex below.
        const sorted = this.getSortedCols();

        // Target index per col, dropping coupled group cols and the changed col — re-appended last so it
        // takes the highest index.
        const targetIndex = new Map<AgColumn, number>();
        let nextIndex = 0;
        for (let i = 0, len = sorted.length; i < len; ++i) {
            const col = sorted[i];
            if ((isCoupled && col.showRowGroup) || col === lastSortIndexCol) {
                continue;
            }
            targetIndex.set(col, nextIndex++);
        }
        if (lastSortIndexCol.getSortDef()) {
            targetIndex.set(lastSortIndexCol, nextIndex);
        }

        // Apply only where changed — `setColSortIndex` fires a state event per call.
        const allCols = colModel.getAllCols();
        for (let i = 0, len = allCols.length; i < len; ++i) {
            const col = allCols[i];
            const target = targetIndex.get(col) ?? null;
            if ((col.sortIndex ?? null) !== target) {
                this.setColSortIndex(col, target);
            }
        }
    }

    // Called by API when data changes out-of-band; we can't know what changed, so drop everything.
    public onSortChanged(source: string, columns?: AgColumn[]): void {
        this.invalidate();
        this.dispatchSortChangedEvents(source, columns);
    }

    public dispatchSortChangedEvents(source: string, columns?: AgColumn[]): void {
        const event: WithoutGridCommon<SortChangedEvent> = { type: 'sortChanged', source, columns };
        this.eventSvc.dispatchEvent(event);
    }

    private clearSortBarTheseColumns(columnsToSkip: AgColumn[], source: ColumnEventType): AgColumn[] {
        const clearedColumns: AgColumn[] = [];
        const skip = new Set(columnsToSkip);
        const allCols = this.beans.colModel.getAllCols();
        for (let i = 0, len = allCols.length; i < len; ++i) {
            const col = allCols[i];
            if (skip.has(col)) {
                continue;
            }
            if (col.getSortDef()) {
                clearedColumns.push(col);
            }
            // Fresh SortDef per col: `getColumnDefs()` exposes a reference to user code.
            this.setColSort(col, getSortDefFromInput(), source);
        }
        return clearedColumns;
    }

    public getNextSortDirection(column: AgColumn, currentSort?: SortDef | SortDirection | null): SortDef {
        const sortingOrder = getSortingOrder(this.gos, column);
        const len = sortingOrder.length;
        if (len === 0) {
            return getSortDefFromInput();
        }
        const currentSortDef = currentSort === undefined ? column.getSortDef() : getSortDefFromInput(currentSort);
        let next = 0;
        for (let i = 0; i < len; ++i) {
            if (areSortDefsEqual(sortingOrder[i], currentSortDef)) {
                next = i + 1 >= len ? 0 : i + 1;
                break;
            }
        }
        return getSortDefFromInput(sortingOrder[next]);
    }

    private getSortedCols(): AgColumn[] {
        return this.cols ?? this.loadSortedCols();
    }

    private getIndexMap(): Map<AgColumn, number> {
        return this.map ?? this.loadIndexMap(this.getSortedCols());
    }

    /** Sorted cols in display order. Pivot drops primary leaves (irrelevant to the result); coupled mode
     *  interleaves each display group col with its source row-group cols (shared display index). */
    private loadSortedCols(): AgColumn[] {
        const { colModel, showRowGroupCols } = this.beans;
        const coupled = _isColumnsSortingCoupledToGroup(this.gos);
        const pivotMode = colModel.pivotMode;
        const allCols = colModel.getAllCols();
        const sorted: AgColumn[] = [];
        for (let i = 0, len = allCols.length; i < len; ++i) {
            const col = allCols[i];
            if (!col.getSortDef()) {
                continue;
            }
            if (pivotMode) {
                const isGroup = coupled ? col.showRowGroupCol : col.showRowGroup;
                if (!col.aggFunc && col.primary && !isGroup) {
                    continue;
                }
            }
            sorted.push(col);
        }
        if (sorted.length > 1) {
            sorted.sort(compareBySortIndex);
        }

        // Coupled mode interleaves each display group col with its source row-group cols (enterprise).
        const result = coupled && showRowGroupCols ? showRowGroupCols.interleaveSortedColumns(sorted) : sorted;
        this.cols = result;
        return result;
    }

    /** Col -> display index. Coupled mode: source row-group cols share their display col's index (which
     *  counts display cols only). Sets `multi`. */
    private loadIndexMap(sortedCols: AgColumn[]): Map<AgColumn, number> {
        const map = new Map<AgColumn, number>();
        const len = sortedCols.length;
        const showRowGroupCols = this.beans.showRowGroupCols;
        let idx: number;
        if (_isColumnsSortingCoupledToGroup(this.gos) && showRowGroupCols) {
            // Coupled mode: source cols share their display group col's index (enterprise).
            idx = showRowGroupCols.fillCoupledSortIndexMap(sortedCols, map);
        } else {
            for (let i = 0; i < len; ++i) {
                map.set(sortedCols[i], i);
            }
            idx = len - 1;
        }
        this.multi = idx >= 1;
        this.map = map;
        return map;
    }

    public getSortOptions(): SortOption[] {
        let opts = this.opts;
        if (opts === null) {
            opts = [];
            const cols = this.getSortedCols();
            for (let i = 0, len = cols.length; i < len; ++i) {
                const column = cols[i];
                const sortDef = column.getSortDef();
                const sort = sortDef?.direction;
                if (sort) {
                    opts.push({
                        sort,
                        type: _normalizeSortType(sortDef.type),
                        column,
                        colComparator: undefined,
                        leafComparator: undefined,
                        descending: false,
                        absolute: false,
                    });
                }
            }
            _resolveSortOptions(opts, this.beans.colModel);
            this.opts = opts;
        }
        return opts;
    }

    public getDisplaySort(column: AgColumn): DisplaySortDef | null {
        const colSortDef = column.getSortDef();
        // Mixed sort only on a coupled group display col — check the cheap flags before the linked-col lookup.
        if (!column.showRowGroup || !_isColumnsSortingCoupledToGroup(this.gos)) {
            return colSortDef;
        }
        const linkedColumns = this.beans.showRowGroupCols?.getSourceColumnsForGroupColumn(column);
        if (!linkedColumns?.length) {
            return colSortDef;
        }
        // A group col with its own field/valueGetter sorts independently, so it joins the comparison.
        const ownData = column.field != null || !!column.valueGetter;
        const firstSort = ownData ? colSortDef : linkedColumns[0].getSortDef();
        let allMatch = true;
        for (let i = 0, len = linkedColumns.length; allMatch && i < len; ++i) {
            allMatch = areSortDefsEqual(linkedColumns[i].getSortDef(), firstSort);
        }
        return allMatch ? firstSort : { type: _normalizeSortType(colSortDef?.type), direction: 'mixed' };
    }

    public getDisplaySortIndex(column: AgColumn): number | undefined {
        return this.getIndexMap().get(column);
    }

    /** `true` when the indicator should show ordinal numbers (2+ distinct display indices). */
    public isMultiSort(): boolean {
        this.getIndexMap();
        return this.multi;
    }

    public setupHeader(comp: Component, column: AgColumn): void {
        const refreshStyles = () => {
            const { type, direction } = getSortDefFromInput(column.getSortDef());
            comp.toggleCss('ag-header-cell-sorted-asc', direction === 'asc');
            comp.toggleCss('ag-header-cell-sorted-desc', direction === 'desc');
            comp.toggleCss('ag-header-cell-sorted-abs-asc', type === 'absolute' && direction === 'asc');
            comp.toggleCss('ag-header-cell-sorted-abs-desc', type === 'absolute' && direction === 'desc');
            comp.toggleCss('ag-header-cell-sorted-none', !direction);
            if (column.showRowGroup) {
                const isMixed = this.beans.showRowGroupCols?.isGroupSortMixed(column, direction) ?? true;
                comp.toggleCss('ag-header-cell-sorted-mixed', isMixed);
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
        const sortDef = getSortDefFromColDef(column.colDef);
        if (sortDef) {
            column.setSortDef(sortDef);
        }
        // sortIndex wins over initialSortIndex; null/undefined leaves it unset.
        const idx = sortIndex !== undefined ? sortIndex : initialSortIndex;
        if (idx != null) {
            column.sortIndex = idx;
        }
    }

    /** Update a column's sort from a sort def; `undefined` is a no-op. */
    public updateColSort(
        column: AgColumn,
        sortDefOrDirection: SortDirection | SortDef | undefined,
        source: ColumnEventType
    ): void {
        if (sortDefOrDirection !== undefined) {
            this.setColSort(column, getSortDefFromInput(sortDefOrDirection), source);
        }
    }

    private setColSort(column: AgColumn, sortDef: SortDef, source: ColumnEventType): void {
        const prevSortDef = column.getSortDef();
        if (!areSortDefsEqual(prevSortDef, sortDef)) {
            // Presence flip changes membership (drop all); direction/type-only keeps order (drop opts).
            if (!!prevSortDef?.direction !== !!sortDef.direction) {
                this.invalidate();
            } else {
                this.opts = null;
            }
            column.setSortDef(sortDef);
            column.dispatchColEvent('sortChanged', source);
        }
        column.dispatchStateUpdatedEvent('sort');
    }

    public setColSortIndex(column: AgColumn, sortOrder?: number | null): void {
        column.sortIndex = sortOrder;
        this.invalidate();
        column.dispatchStateUpdatedEvent('sortIndex');
    }
}

/** Order by `sortIndex` ascending; cols without one sort last (sentinel) and, being equal, keep their
 *  discovery order via stable sort (ES2019+). */
const compareBySortIndex = (a: AgColumn, b: AgColumn): number =>
    (a.sortIndex ?? 0x7fffffff) - (b.sortIndex ?? 0x7fffffff);

/** True when two sort defs match. A falsy/absent def is treated as unsorted (direction `null`). */
const areSortDefsEqual = (sortDef1: SortDef | null | undefined, sortDef2: SortDef | null | undefined): boolean => {
    if (!sortDef1) {
        return sortDef2 ? sortDef2.direction === null : true;
    }
    if (!sortDef2) {
        return sortDef1.direction === null;
    }
    return sortDef1.type === sortDef2.type && sortDef1.direction === sortDef2.direction;
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getSortModel(sortSvc: SortService | undefined): SortModelItem[] {
    const opts = sortSvc?.getSortOptions();
    if (!opts) {
        return [];
    }
    const len = opts.length;
    const model: SortModelItem[] = new Array(len);
    for (let i = 0; i < len; ++i) {
        const o = opts[i];
        model[i] = { sort: o.sort, type: o.type, colId: (o.column as AgColumn).colId };
    }
    return model;
}
