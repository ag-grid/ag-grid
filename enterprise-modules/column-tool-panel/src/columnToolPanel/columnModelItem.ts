import type { AgColumn, AgProvidedColumnGroup, IEventEmitter, IEventListener } from '@ag-grid-community/core';
import { LocalEventService } from '@ag-grid-community/core';

export type ColumnModelItemEvent = 'expandedChanged';
export class ColumnModelItem implements IEventEmitter<ColumnModelItemEvent> {
    private localEventService: LocalEventService<ColumnModelItemEvent> = new LocalEventService();

    private readonly group: boolean;
    private readonly displayName: string | null;
    private readonly columnGroup: AgProvidedColumnGroup;
    private readonly column: AgColumn;
    private readonly dept: number;
    private readonly children: ColumnModelItem[];

    private expanded: boolean | undefined;
    private passesFilter: boolean;

    constructor(
        displayName: string | null,
        columnOrGroup: AgColumn | AgProvidedColumnGroup,
        dept: number,
        group = false,
        expanded?: boolean
    ) {
        this.displayName = displayName;
        this.dept = dept;
        this.group = group;

        if (group) {
            this.columnGroup = columnOrGroup as AgProvidedColumnGroup;
            this.expanded = expanded;
            this.children = [];
        } else {
            this.column = columnOrGroup as AgColumn;
        }
    }

    public isGroup(): boolean {
        return this.group;
    }
    public getDisplayName(): string | null {
        return this.displayName;
    }
    public getColumnGroup(): AgProvidedColumnGroup {
        return this.columnGroup;
    }
    public getColumn(): AgColumn {
        return this.column;
    }
    public getDept(): number {
        return this.dept;
    }
    public isExpanded(): boolean {
        return !!this.expanded;
    }
    public getChildren(): ColumnModelItem[] {
        return this.children;
    }
    public isPassesFilter(): boolean {
        return this.passesFilter;
    }

    public setExpanded(expanded: boolean): void {
        if (expanded === this.expanded) {
            return;
        }
        this.expanded = expanded;
        this.localEventService.dispatchEvent({ type: 'expandedChanged' });
    }

    public setPassesFilter(passesFilter: boolean): void {
        this.passesFilter = passesFilter;
    }

    public addEventListener<T extends ColumnModelItemEvent>(
        eventType: T,
        listener: IEventListener<ColumnModelItemEvent>
    ): void {
        this.localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener<T extends ColumnModelItemEvent>(
        eventType: T,
        listener: IEventListener<ColumnModelItemEvent>
    ): void {
        this.localEventService.removeEventListener(eventType, listener);
    }
}
