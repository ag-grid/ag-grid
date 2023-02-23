import {
    Column,
    EventService,
    IEventEmitter,
    ProvidedColumnGroup
} from "@ag-grid-community/core";

export class ColumnModelItem implements IEventEmitter {

    private eventService: EventService = new EventService();

    public static EVENT_EXPANDED_CHANGED = 'expandedChanged';

    private readonly group: boolean;
    private readonly displayName: string | null;
    private readonly columnGroup: ProvidedColumnGroup;
    private readonly column: Column;
    private readonly dept: number;
    private readonly children: ColumnModelItem[];

    private expanded: boolean | undefined;
    private passesFilter: boolean;

    constructor(
        displayName: string | null,
        columnOrGroup: Column | ProvidedColumnGroup,
        dept: number,
        group = false,
        expanded?: boolean
    ) {
        this.displayName = displayName;
        this.dept = dept;
        this.group = group;

        if (group) {
            this.columnGroup = columnOrGroup as ProvidedColumnGroup;
            this.expanded = expanded;
            this.children = [];
        } else {
            this.column = columnOrGroup as Column;
        }
    }

    public isGroup(): boolean { return this.group; }
    public getDisplayName(): string | null { return this.displayName; }
    public getColumnGroup(): ProvidedColumnGroup { return this.columnGroup; }
    public getColumn(): Column { return this.column; }
    public getDept(): number { return this.dept; }
    public isExpanded(): boolean { return !!this.expanded; }
    public getChildren(): ColumnModelItem[] { return this.children; }
    public isPassesFilter(): boolean { return this.passesFilter; }

    public setExpanded(expanded: boolean): void {
        if (expanded === this.expanded) { return; }
        this.expanded = expanded;
        this.eventService.dispatchEvent({type: ColumnModelItem.EVENT_EXPANDED_CHANGED});
    }

    public setPassesFilter(passesFilter: boolean): void {
        this.passesFilter = passesFilter;
    }

    public addEventListener(eventType: string, listener: Function): void {
        this.eventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.eventService.removeEventListener(eventType, listener);
    }

}
