import { AgEventListener, Column, IEventEmitter, ProvidedColumnGroup } from "ag-grid-community";
export declare class ColumnModelItem implements IEventEmitter {
    private eventService;
    static EVENT_EXPANDED_CHANGED: string;
    private readonly group;
    private readonly displayName;
    private readonly columnGroup;
    private readonly column;
    private readonly dept;
    private readonly children;
    private expanded;
    private passesFilter;
    constructor(displayName: string | null, columnOrGroup: Column | ProvidedColumnGroup, dept: number, group?: boolean, expanded?: boolean);
    isGroup(): boolean;
    getDisplayName(): string | null;
    getColumnGroup(): ProvidedColumnGroup;
    getColumn(): Column;
    getDept(): number;
    isExpanded(): boolean;
    getChildren(): ColumnModelItem[];
    isPassesFilter(): boolean;
    setExpanded(expanded: boolean): void;
    setPassesFilter(passesFilter: boolean): void;
    addEventListener(eventType: string, listener: AgEventListener): void;
    removeEventListener(eventType: string, listener: AgEventListener): void;
}
