import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { EventsType } from '../eventKeys';
import type {
    ColumnEvent,
    ColumnEventType,
    ColumnEverythingChangedEvent,
    ColumnGroupOpenedEvent,
    ColumnMovedEvent,
    ColumnPinnedEvent,
    ColumnPivotModeChangedEvent,
    ColumnResizedEvent,
    ColumnRowGroupChangedEvent,
    ColumnVisibleEvent,
    DisplayedColumnsChangedEvent,
    GridColumnsChangedEvent,
    NewColumnsLoadedEvent,
    VirtualColumnsChangedEvent,
} from '../events';
import type { WithoutGridCommon } from '../interfaces/iCommon';

/* 
Created this class to:
a) common methods, eg some methods here called by ColumnModel and also ColumnApplyStateService
b) to remove plumbing code from ColumnModel, to help make ColumnModel more maintainable
*/
export class ColumnEventDispatcher extends BeanStub implements NamedBean {
    beanName = 'columnEventDispatcher' as const;

    public visibleCols(): void {
        const event: WithoutGridCommon<DisplayedColumnsChangedEvent> = {
            type: 'displayedColumnsChanged',
        };
        this.eventService.dispatchEvent(event);
    }

    public gridColumns(): void {
        const event: WithoutGridCommon<GridColumnsChangedEvent> = {
            type: 'gridColumnsChanged',
        };
        this.eventService.dispatchEvent(event);
    }

    public headerHeight(col: AgColumn): void {
        const event: WithoutGridCommon<ColumnEvent> = {
            type: 'columnHeaderHeightChanged',
            column: col,
            columns: [col],
            source: 'autosizeColumnHeaderHeight',
        };
        this.eventService.dispatchEvent(event);
    }

    public groupOpened(impactedGroups: AgProvidedColumnGroup[]): void {
        const event: WithoutGridCommon<ColumnGroupOpenedEvent> = {
            type: 'columnGroupOpened',
            columnGroup: impactedGroups.length === 1 ? impactedGroups[0] : undefined,
            columnGroups: impactedGroups,
        };
        this.eventService.dispatchEvent(event);
    }

    public rowGroupChanged(impactedColumns: AgColumn[], source: ColumnEventType): void {
        const event: WithoutGridCommon<ColumnRowGroupChangedEvent> = {
            type: 'columnRowGroupChanged',
            columns: impactedColumns,
            column: impactedColumns.length === 1 ? impactedColumns[0] : null,
            source: source,
        };

        this.eventService.dispatchEvent(event);
    }

    public genericColumnEvent(eventType: string, masterList: AgColumn[], source: ColumnEventType): void {
        const event: WithoutGridCommon<ColumnEvent> = {
            type: eventType,
            columns: masterList,
            column: masterList.length === 1 ? masterList[0] : null,
            source: source,
        };
        this.eventService.dispatchEvent(event);
    }

    public pivotModeChanged(): void {
        const event: WithoutGridCommon<ColumnPivotModeChangedEvent> = {
            type: 'columnPivotModeChanged',
        };
        this.eventService.dispatchEvent(event);
    }

    public virtualColumnsChanged(afterScroll: boolean): void {
        const event: WithoutGridCommon<VirtualColumnsChangedEvent> = {
            type: 'virtualColumnsChanged',
            afterScroll,
        };

        this.eventService.dispatchEvent(event);
    }

    public newColumnsLoaded(source: ColumnEventType): void {
        const newColumnsLoadedEvent: WithoutGridCommon<NewColumnsLoadedEvent> = {
            type: 'newColumnsLoaded',
            source,
        };
        this.eventService.dispatchEvent(newColumnsLoadedEvent);
    }

    public everythingChanged(source: ColumnEventType): void {
        const eventEverythingChanged: WithoutGridCommon<ColumnEverythingChangedEvent> = {
            type: 'columnEverythingChanged',
            source,
        };
        this.eventService.dispatchEvent(eventEverythingChanged);
    }

    public columnMoved(params: {
        movedColumns: AgColumn[];
        source: ColumnEventType;
        toIndex?: number;
        finished: boolean;
    }): void {
        const { movedColumns, source, toIndex, finished } = params;

        const event: WithoutGridCommon<ColumnMovedEvent> = {
            type: 'columnMoved',
            columns: movedColumns,
            column: movedColumns && movedColumns.length === 1 ? movedColumns[0] : null,
            toIndex,
            finished,
            source,
        };

        this.eventService.dispatchEvent(event);
    }

    public columnPinned(changedColumns: AgColumn[], source: ColumnEventType) {
        if (!changedColumns.length) {
            return;
        }

        // if just one column, we use this, otherwise we don't include the col
        const column: AgColumn | null = changedColumns.length === 1 ? changedColumns[0] : null;

        // only include visible if it's common in all columns
        const pinned = this.getCommonValue(changedColumns, (col) => col.getPinned());

        const event: WithoutGridCommon<ColumnPinnedEvent> = {
            type: 'columnPinned',
            // mistake in typing, 'undefined' should be allowed, as 'null' means 'not pinned'
            pinned: pinned != null ? pinned : null,
            columns: changedColumns,
            column,
            source: source,
        };

        this.eventService.dispatchEvent(event);
    }

    public columnVisible(changedColumns: AgColumn[], source: ColumnEventType) {
        if (!changedColumns.length) {
            return;
        }

        // if just one column, we use this, otherwise we don't include the col
        const column: AgColumn | null = changedColumns.length === 1 ? changedColumns[0] : null;

        // only include visible if it's common in all columns
        const visible = this.getCommonValue(changedColumns, (col) => col.isVisible());

        const event: WithoutGridCommon<ColumnVisibleEvent> = {
            type: 'columnVisible',
            visible,
            columns: changedColumns,
            column,
            source: source,
        };

        this.eventService.dispatchEvent(event);
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

    public columnChanged<T extends EventsType>(type: T, columns: AgColumn[], source: ColumnEventType): void {
        const event: WithoutGridCommon<ColumnEvent<T>> = {
            type: type,
            columns: columns,
            column: columns && columns.length == 1 ? columns[0] : null,
            source: source,
        };
        this.eventService.dispatchEvent(event);
    }

    public columnResized(
        columns: AgColumn[] | null,
        finished: boolean,
        source: ColumnEventType,
        flexColumns: AgColumn[] | null = null
    ): void {
        if (columns && columns.length) {
            const event: WithoutGridCommon<ColumnResizedEvent> = {
                type: 'columnResized',
                columns: columns,
                column: columns.length === 1 ? columns[0] : null,
                flexColumns: flexColumns,
                finished: finished,
                source: source,
            };
            this.eventService.dispatchEvent(event);
        }
    }
}
