import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
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
    ColumnValueChangedEvent,
    ColumnVisibleEvent,
    DisplayedColumnsChangedEvent,
    GridColumnsChangedEvent,
    NewColumnsLoadedEvent,
    VirtualColumnsChangedEvent,
} from '../events';
import { Events } from '../events';
import type { WithoutGridCommon } from '../interfaces/iCommon';

/* 
Created this class to:
a) common methods, eg some methods here called by ColumnModel and also ColumnApplyStateService
b) to remove plumbing code from ColumnModel, to help make ColumnModel more maintainable
*/
export class ColumnEventDispatcher extends BeanStub {
    beanName: BeanName = 'columnEventDispatcher';

    public visibleCols(): void {
        const event: WithoutGridCommon<DisplayedColumnsChangedEvent> = {
            type: Events.EVENT_DISPLAYED_COLUMNS_CHANGED,
        };
        this.eventService.dispatchEvent(event);
    }

    public gridColumns(): void {
        const event: WithoutGridCommon<GridColumnsChangedEvent> = {
            type: Events.EVENT_GRID_COLUMNS_CHANGED,
        };
        this.eventService.dispatchEvent(event);
    }

    public headerHeight(col: AgColumn): void {
        const event: WithoutGridCommon<ColumnEvent> = {
            type: Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED,
            column: col,
            columns: [col],
            source: 'autosizeColumnHeaderHeight',
        };
        this.eventService.dispatchEvent(event);
    }

    public groupOpened(impactedGroups: AgProvidedColumnGroup[]): void {
        const event: WithoutGridCommon<ColumnGroupOpenedEvent> = {
            type: Events.EVENT_COLUMN_GROUP_OPENED,
            columnGroup: impactedGroups.length === 1 ? impactedGroups[0] : undefined,
            columnGroups: impactedGroups,
        };
        this.eventService.dispatchEvent(event);
    }

    public rowGroupChanged(impactedColumns: AgColumn[], source: ColumnEventType): void {
        const event: WithoutGridCommon<ColumnRowGroupChangedEvent> = {
            type: Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
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
            type: Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
        };
        this.eventService.dispatchEvent(event);
    }

    public virtualColumnsChanged(afterScroll: boolean): void {
        const event: WithoutGridCommon<VirtualColumnsChangedEvent> = {
            type: Events.EVENT_VIRTUAL_COLUMNS_CHANGED,
            afterScroll,
        };

        this.eventService.dispatchEvent(event);
    }

    public newColumnsLoaded(source: ColumnEventType): void {
        const newColumnsLoadedEvent: WithoutGridCommon<NewColumnsLoadedEvent> = {
            type: Events.EVENT_NEW_COLUMNS_LOADED,
            source,
        };
        this.eventService.dispatchEvent(newColumnsLoadedEvent);
    }

    public everythingChanged(source: ColumnEventType): void {
        const eventEverythingChanged: WithoutGridCommon<ColumnEverythingChangedEvent> = {
            type: Events.EVENT_COLUMN_EVERYTHING_CHANGED,
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
            type: Events.EVENT_COLUMN_MOVED,
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
            type: Events.EVENT_COLUMN_PINNED,
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
            type: Events.EVENT_COLUMN_VISIBLE,
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

    public columnChanged(type: string, columns: AgColumn[], source: ColumnEventType): void {
        const event: WithoutGridCommon<ColumnValueChangedEvent> = {
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
                type: Events.EVENT_COLUMN_RESIZED,
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
