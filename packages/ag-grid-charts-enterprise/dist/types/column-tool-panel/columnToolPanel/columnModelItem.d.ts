import type { AgColumn, AgProvidedColumnGroup, IEventEmitter, IEventListener } from 'ag-grid-community';
export type ColumnModelItemEvent = 'expandedChanged';
export declare class ColumnModelItem implements IEventEmitter<ColumnModelItemEvent> {
    private localEventService;
    private readonly group;
    private readonly displayName;
    private readonly columnGroup;
    private readonly column;
    private readonly dept;
    private readonly children;
    private expanded;
    private passesFilter;
    constructor(displayName: string | null, columnOrGroup: AgColumn | AgProvidedColumnGroup, dept: number, group?: boolean, expanded?: boolean);
    isGroup(): boolean;
    getDisplayName(): string | null;
    getColumnGroup(): AgProvidedColumnGroup;
    getColumn(): AgColumn;
    getDept(): number;
    isExpanded(): boolean;
    getChildren(): ColumnModelItem[];
    isPassesFilter(): boolean;
    setExpanded(expanded: boolean): void;
    setPassesFilter(passesFilter: boolean): void;
    addEventListener<T extends ColumnModelItemEvent>(eventType: T, listener: IEventListener<ColumnModelItemEvent>): void;
    removeEventListener<T extends ColumnModelItemEvent>(eventType: T, listener: IEventListener<ColumnModelItemEvent>): void;
}
