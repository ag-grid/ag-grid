import { BeanStub } from '../context/beanStub';
import type { Column, ColumnGroupShowType, ColumnInstanceId, ProvidedColumnGroup } from '../interfaces/iColumn';
import type { AgColumn } from './agColumn';
import { getNextColInstanceId } from './agColumn';
import type { AgColumnGroup } from './agColumnGroup';
import type { ColGroupDef } from './colDef';

export function isProvidedColumnGroup(
    col: Column | ProvidedColumnGroup | string | null | undefined
): col is AgProvidedColumnGroup {
    return col instanceof AgProvidedColumnGroup;
}

export type AgProvidedColumnGroupEvent = 'expandedChanged' | 'expandableChanged';
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AgProvidedColumnGroup extends BeanStub<AgProvidedColumnGroupEvent> implements ProvidedColumnGroup {
    public readonly isColumn = false as const;

    public originalParent: AgProvidedColumnGroup | null;

    public children: (AgColumn | AgProvidedColumnGroup)[];
    public expandable = false;

    public expanded: boolean = false;

    /** Most recent build token that claimed this group — detects "already used in this refresh". */
    public buildToken: number = 0;

    /** Packed `AgColumnGroup` display instances by dense per-refresh `partId` (`displayInstances[0]` is primary), lazily allocated and pruned by `columnGroupService`. */
    public displayInstances: AgColumnGroup[] | null = null;

    /** Cache previous `setExpandable` visibility so `AgColumn.setVisible` ancestor walk can stop when unchanged. */
    private lastVisible = false;

    // stable key for framework (React) rendering and old-vs-new destroy diffing
    public readonly instanceId: ColumnInstanceId = getNextColInstanceId();

    constructor(
        public colGroupDef: ColGroupDef | null,
        public readonly groupId: string,
        public readonly padding: boolean,
        public level: number
    ) {
        super();
        this.expanded = !!colGroupDef?.openByDefault;
    }

    public getInstanceId(): ColumnInstanceId {
        return this.instanceId;
    }

    public getOriginalParent(): AgProvidedColumnGroup | null {
        return this.originalParent;
    }

    public getLevel(): number {
        return this.level;
    }

    /** Visible iff at least one child is visible. */
    public isVisible(): boolean {
        const children = this.children;
        for (let i = 0, len = children.length; i < len; ++i) {
            if (children[i].isVisible()) {
                return true;
            }
        }
        return false;
    }

    public isPadding(): boolean {
        return this.padding;
    }

    public setExpanded(expanded: boolean | undefined): boolean {
        expanded = !!expanded;
        if (this.expanded === expanded) {
            return false;
        }
        this.expanded = expanded;
        this.dispatchLocalEvent({ type: 'expandedChanged' });
        return true;
    }

    public isExpandable(): boolean {
        return this.expandable;
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public getGroupId(): string {
        return this.groupId;
    }

    public getId(): string {
        return this.groupId;
    }

    public getChildren(): (AgColumn | AgProvidedColumnGroup)[] {
        return this.children;
    }

    public getColGroupDef(): ColGroupDef | null {
        return this.colGroupDef;
    }

    public getLeafColumns(): AgColumn[] {
        const result: AgColumn[] = [];
        this.addLeafColumns(result);
        return result;
    }

    private addLeafColumns(leafColumns: AgColumn[]): void {
        const children = this.children;
        for (let i = 0, len = children.length; i < len; ++i) {
            const child = children[i];
            if (child.isColumn) {
                leafColumns.push(child);
            } else {
                child.addLeafColumns(leafColumns);
            }
        }
    }

    public getColumnGroupShow(): ColumnGroupShowType | undefined {
        return this.colGroupDef?.columnGroupShow;
    }

    /** Recompute child-driven expandability and return whether `AgColumn.setVisible` should continue ancestor walking. */
    public setExpandable(): boolean {
        if (this.padding) {
            return true;
        }
        const flags = walkForExpandFlags(this.children, 0);
        const expandable = flags === EXPANDABLE_ALL;
        if (this.expandable !== expandable) {
            this.expandable = expandable;
            this.dispatchLocalEvent({ type: 'expandableChanged' });
        }
        const visible = flags !== 0;
        if (this.lastVisible === visible) {
            return false;
        }
        this.lastVisible = visible;
        return true;
    }
}

// Bit flags accumulated by `walkForExpandFlags`. A group is `expandable` iff all three are set.
const FLAG_SHOWING_WHEN_OPEN = 0b001;
const FLAG_SHOWING_WHEN_CLOSED = 0b010;
const FLAG_CHANGEABLE = 0b100;
const EXPANDABLE_ALL = 0b111;

/** Bit-flag walk: short-circuits once all three flags are set. Padding groups transparent. */
const walkForExpandFlags = (items: (AgColumn | AgProvidedColumnGroup)[], flags: number): number => {
    for (let i = 0, n = items.length; i < n; ++i) {
        const item = items[i];
        if (isProvidedColumnGroup(item) && item.padding) {
            flags = walkForExpandFlags(item.children, flags);
        } else if (item.isVisible()) {
            // `getColumnGroupShow()` returns undefined for grid-generated groups (no colDef).
            const show = item.getColumnGroupShow();
            if (show === 'open') {
                flags |= FLAG_SHOWING_WHEN_OPEN | FLAG_CHANGEABLE;
            } else if (show === 'closed') {
                flags |= FLAG_SHOWING_WHEN_CLOSED | FLAG_CHANGEABLE;
            } else {
                flags |= FLAG_SHOWING_WHEN_OPEN | FLAG_SHOWING_WHEN_CLOSED;
            }
        }
        if (flags === EXPANDABLE_ALL) {
            return flags;
        }
    }
    return flags;
};
