import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColumnEvent, ColumnEventType } from '../events';
import type { WithoutGridCommon } from '../interfaces/iCommon';

/* 
Created this class to:
a) common methods, eg some methods here called by ColumnModel and also ColumnApplyStateService
b) to remove plumbing code from ColumnModel, to help make ColumnModel more maintainable
*/
export class ColumnEventDispatcher extends BeanStub implements NamedBean {
    beanName = 'columnEventDispatcher' as const;

    public visibleCols(): void {
        this.eventService.dispatchEvent({
            type: 'displayedColumnsChanged',
        });
    }

    public gridColumns(): void {
        this.eventService.dispatchEvent({
            type: 'gridColumnsChanged',
        });
    }

    public headerHeight(col: AgColumn): void {
        this.eventService.dispatchEvent({
            type: 'columnHeaderHeightChanged',
            column: col,
            columns: [col],
            source: 'autosizeColumnHeaderHeight',
        });
    }

    public groupOpened(impactedGroups: AgProvidedColumnGroup[]): void {
        this.eventService.dispatchEvent({
            type: 'columnGroupOpened',
            columnGroup: impactedGroups.length === 1 ? impactedGroups[0] : undefined,
            columnGroups: impactedGroups,
        });
    }

    public rowGroupChanged(impactedColumns: AgColumn[], source: ColumnEventType): void {
        this.eventService.dispatchEvent({
            type: 'columnRowGroupChanged',
            columns: impactedColumns,
            column: impactedColumns.length === 1 ? impactedColumns[0] : null,
            source: source,
        });
    }

    public genericColumnEvent(
        eventType: 'columnValueChanged' | 'columnPivotChanged' | 'columnRowGroupChanged',
        masterList: AgColumn[],
        source: ColumnEventType
    ): void {
        this.eventService.dispatchEvent({
            type: eventType,
            columns: masterList,
            column: masterList.length === 1 ? masterList[0] : null,
            source: source,
        } as WithoutGridCommon<ColumnEvent>);
    }

    public pivotModeChanged(): void {
        this.eventService.dispatchEvent({
            type: 'columnPivotModeChanged',
        });
    }

    public virtualColumnsChanged(afterScroll: boolean): void {
        this.eventService.dispatchEvent({
            type: 'virtualColumnsChanged',
            afterScroll,
        });
    }

    public newColumnsLoaded(source: ColumnEventType): void {
        this.eventService.dispatchEvent({
            type: 'newColumnsLoaded',
            source,
        });
    }

    public everythingChanged(source: ColumnEventType): void {
        this.eventService.dispatchEvent({
            type: 'columnEverythingChanged',
            source,
        });
    }

    public columnMoved(params: {
        movedColumns: AgColumn[];
        source: ColumnEventType;
        toIndex?: number;
        finished: boolean;
    }): void {
        const { movedColumns, source, toIndex, finished } = params;

        this.eventService.dispatchEvent({
            type: 'columnMoved',
            columns: movedColumns,
            column: movedColumns && movedColumns.length === 1 ? movedColumns[0] : null,
            toIndex,
            finished,
            source,
        });
    }

    public columnPinned(changedColumns: AgColumn[], source: ColumnEventType) {
        if (!changedColumns.length) {
            return;
        }

        // if just one column, we use this, otherwise we don't include the col
        const column: AgColumn | null = changedColumns.length === 1 ? changedColumns[0] : null;

        // only include visible if it's common in all columns
        const pinned = this.getCommonValue(changedColumns, (col) => col.getPinned());

        this.eventService.dispatchEvent({
            type: 'columnPinned',
            // mistake in typing, 'undefined' should be allowed, as 'null' means 'not pinned'
            pinned: pinned != null ? pinned : null,
            columns: changedColumns,
            column,
            source: source,
        });
    }

    public columnVisible(changedColumns: AgColumn[], source: ColumnEventType) {
        if (!changedColumns.length) {
            return;
        }

        // if just one column, we use this, otherwise we don't include the col
        const column: AgColumn | null = changedColumns.length === 1 ? changedColumns[0] : null;

        // only include visible if it's common in all columns
        const visible = this.getCommonValue(changedColumns, (col) => col.isVisible());

        this.eventService.dispatchEvent({
            type: 'columnVisible',
            visible,
            columns: changedColumns,
            column,
            source: source,
        });
    }

    private getCommonValue<T>(cols: AgColumn[], valueGetter: (col: AgColumn) => T): T | undefined {
        if (!cols || cols.length == 0) {
            return undefined;
        }

        // compare each value to the first value. if nothing differs, then value is common so return it.
        const firstValue = valueGetter(cols[0]);
        for (let i = 1; i < cols.length; i++) {
            if (firstValue !== valueGetter(cols[i])) {
                // values differ, no common value
                return undefined;
            }
        }

        return firstValue;
    }

    public columnChanged<T extends 'columnValueChanged' | 'columnPivotChanged' | 'columnRowGroupChanged'>(
        type: T,
        columns: AgColumn[],
        source: ColumnEventType
    ): void {
        this.eventService.dispatchEvent({
            type: type,
            columns: columns,
            column: columns && columns.length == 1 ? columns[0] : null,
            source: source,
        } as WithoutGridCommon<ColumnEvent>);
    }

    public columnResized(
        columns: AgColumn[] | null,
        finished: boolean,
        source: ColumnEventType,
        flexColumns: AgColumn[] | null = null
    ): void {
        if (columns && columns.length) {
            this.eventService.dispatchEvent({
                type: 'columnResized',
                columns: columns,
                column: columns.length === 1 ? columns[0] : null,
                flexColumns: flexColumns,
                finished: finished,
                source: source,
            });
        }
    }
}
