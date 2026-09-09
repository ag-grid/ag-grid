import { LocalEventService } from 'ag-stack';

import type { AgColumn, AgProvidedColumnGroup, BeanCollection, IEventEmitter, IEventListener } from 'ag-grid-community';

type ColumnModelItemEvent = 'expandedChanged';
export class ColumnModelItem implements IEventEmitter<ColumnModelItemEvent> {
    private readonly localEventService: LocalEventService<ColumnModelItemEvent> = new LocalEventService();

    public readonly columnGroup: AgProvidedColumnGroup;
    public readonly column: AgColumn;
    public readonly children: ColumnModelItem[];

    private _expanded: boolean | undefined;
    public passesFilter: boolean;

    private cachedName: string | null = null;
    /** -1 never matches a real `colDefsVersion`, so the first read always resolves. */
    private cachedNameVersion: number = -1;
    private cachedNameOverride: string | null = null;

    constructor(
        private readonly beans: BeanCollection,
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

    // OPTIMIZATION: resolved on read so a name change is picked up without rebuilding the tree, but
    // memoised against its only two inputs so a user `headerValueGetter` runs once per change rather
    // than once per read - search filtering and row recycling both read this for every item.
    public get displayName(): string | null {
        const { beans, group, columnGroup, column } = this;
        const { colNames, colModel } = beans;
        const version = colModel.colDefsVersion;
        const override = group
            ? (colModel.groupHeaderNameOverrides.get(columnGroup.groupId) ?? null)
            : column.headerNameOverride;

        if (version !== this.cachedNameVersion || override !== this.cachedNameOverride) {
            this.cachedNameVersion = version;
            this.cachedNameOverride = override;
            this.cachedName = group
                ? colNames.getDisplayNameForProvidedColumnGroup(null, columnGroup, 'columnToolPanel')
                : colNames.getDisplayNameForColumn(column, 'columnToolPanel');
        }

        return this.cachedName;
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
