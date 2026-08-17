import { LocalEventService } from 'ag-stack';

import type {
    AgColumn,
    AgProvidedColumnGroup,
    ColumnNameService,
    IEventEmitter,
    IEventListener,
} from 'ag-grid-community';

type ColumnModelItemEvent = 'expandedChanged';
export class ColumnModelItem implements IEventEmitter<ColumnModelItemEvent> {
    private readonly localEventService: LocalEventService<ColumnModelItemEvent> = new LocalEventService();

    public readonly columnGroup: AgProvidedColumnGroup;
    public readonly column: AgColumn;
    public readonly children: ColumnModelItem[];

    private _expanded: boolean | undefined;
    public passesFilter: boolean;

    constructor(
        private readonly colNames: ColumnNameService,
        columnOrGroup: AgColumn | AgProvidedColumnGroup,
        public readonly depth: number,
        public readonly group = false,
        expanded?: boolean
    ) {
        if (group) {
            this.columnGroup = columnOrGroup as AgProvidedColumnGroup;
            this._expanded = expanded;
            this.children = [];
        } else {
            this.column = columnOrGroup as AgColumn;
        }
    }

    // Resolved on read, not cached: names change without the tree being rebuilt, and rows are
    // recreated from these items on expand/collapse and on scroll recycling.
    public get displayName(): string | null {
        const { colNames, group, columnGroup, column } = this;
        return group
            ? colNames.getDisplayNameForProvidedColumnGroup(null, columnGroup, 'columnToolPanel')
            : colNames.getDisplayNameForColumn(column, 'columnToolPanel');
    }

    public get expanded(): boolean {
        return !!this._expanded;
    }

    public set expanded(expanded: boolean) {
        if (expanded === this._expanded) {
            return;
        }
        this._expanded = expanded;
        this.localEventService.dispatchEvent({ type: 'expandedChanged' });
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
