import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { AgEventType } from '../eventTypes';
import type { ColumnEventType } from '../events';
export declare class ColumnEventDispatcher extends BeanStub implements NamedBean {
    beanName: "columnEventDispatcher";
    visibleCols(): void;
    gridColumns(): void;
    headerHeight(col: AgColumn): void;
    groupOpened(impactedGroups: AgProvidedColumnGroup[]): void;
    rowGroupChanged(impactedColumns: AgColumn[], source: ColumnEventType): void;
    genericColumnEvent(eventType: string, masterList: AgColumn[], source: ColumnEventType): void;
    pivotModeChanged(): void;
    virtualColumnsChanged(afterScroll: boolean): void;
    newColumnsLoaded(source: ColumnEventType): void;
    everythingChanged(source: ColumnEventType): void;
    columnMoved(params: {
        movedColumns: AgColumn[];
        source: ColumnEventType;
        toIndex?: number;
        finished: boolean;
    }): void;
    columnPinned(changedColumns: AgColumn[], source: ColumnEventType): void;
    columnVisible(changedColumns: AgColumn[], source: ColumnEventType): void;
    private getCommonValue;
    columnChanged<T extends AgEventType>(type: T, columns: AgColumn[], source: ColumnEventType): void;
    columnResized(columns: AgColumn[] | null, finished: boolean, source: ColumnEventType, flexColumns?: AgColumn[] | null): void;
}
