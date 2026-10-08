import { _escapeString } from 'ag-stack';

import { BeanStub } from '../context/beanStub';
import type {
    AgColumnGroupEvent,
    Column,
    ColumnGroup,
    ColumnGroupShowType,
    ColumnPinnedType,
    HeaderColumnId,
} from '../interfaces/iColumn';
import type { AgColumn, ColumnLane } from './agColumn';
import { _laneOfPinned } from './agColumn';
import type { AgProvidedColumnGroup } from './agProvidedColumnGroup';
import type { AbstractColDef, ColGroupDef, HeaderLocation } from './colDef';

export const isColumnGroup = (col: Column | ColumnGroup | string): col is AgColumnGroup => col instanceof AgColumnGroup;

// INTERNAL CALLERS: on hot paths read public fields directly (group.groupId, group.pinned, …)
// rather than the getters — the getters exist only for the public ColumnGroup interface, and
// direct reads avoid method-call indirection in tight loops.
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AgColumnGroup<TValue = any> extends BeanStub<AgColumnGroupEvent> implements ColumnGroup<TValue> {
    public readonly isColumn = false as const;
    public readonly uniqueId: HeaderColumnId;

    /** Sanitised version of the column id */
    public readonly colIdSanitised: string;

    // all children, regardless of open/closed state
    public children: (AgColumn | AgColumnGroup)[] | null = null;
    // only the currently displaying children (depends on open/closed state). Kept as an array (never null at
    // runtime) so reads — `getDisplayedChildren()`, `setLeftFromChildren`, tool-panel membership — match released behaviour.
    public displayedChildren: (AgColumn | AgColumnGroup)[] | null = [];
    /** The `displayedChildren` its last `displayedChildrenChanged` reported. */
    private reportedDisplayedChildren = this.displayedChildren;
    /** Bumped on each `displayedChildrenChanged`, so a walk a listener's own update interrupted can tell it was told. */
    private childrenReports = 0;

    // measured header height when autoHeaderHeight is enabled
    public autoHeaderHeight: number | null = null;

    public left: number | null = null;
    /** The `left` its last `leftChanged` reported. */
    private reportedLeft: number | null = null;
    /** Where the group was before the latest layout moved it; a header drawn by a column move starts here. */
    public oldLeft: number | null = null;

    public parent: AgColumnGroup | null = null;

    /** Most recent build token that claimed this instance — sweeps use it to spot orphans. */
    public buildToken: number = 0;

    /** `pinned` resolved to a lane; written wherever `pinned` is. */
    public pinnedLane: ColumnLane;

    constructor(
        public readonly providedColumnGroup: AgProvidedColumnGroup,
        public readonly groupId: string,
        public readonly partId: number,
        public pinned: ColumnPinnedType
    ) {
        super();
        this.pinnedLane = _laneOfPinned(pinned);
        this.uniqueId = `${groupId}_${partId}` as HeaderColumnId;
        this.colIdSanitised = _escapeString(this.uniqueId)!;
    }

    public getParent(): AgColumnGroup | null {
        return this.parent;
    }

    public getUniqueId(): HeaderColumnId {
        return this.uniqueId;
    }

    public isEmptyGroup(): boolean {
        return !this.displayedChildren?.length;
    }

    /** Returns true only when every leaf column in this group is currently moving. */
    public isMoving(): boolean {
        return getLeafMoving(this.providedColumnGroup) === true;
    }

    public setLeftFromChildren(): void {
        const displayedChildren = this.displayedChildren;
        let minLeft: number | null = null;
        if (displayedChildren) {
            for (let i = 0, len = displayedChildren.length; i < len; ++i) {
                const child = displayedChildren[i];
                if (isColumnGroup(child)) {
                    child.setLeftFromChildren();
                }
                const childLeft = child.left;
                if (childLeft != null && (minLeft == null || childLeft < minLeft)) {
                    minLeft = childLeft;
                }
            }
        }
        this.oldLeft = this.reportedLeft;
        this.left = minLeft;
    }

    public getLeft(): number | null {
        return this.left;
    }

    /** Reports its layout changes; returns whether its own or a descendant's displayed children changed. */
    public dispatchLayoutEvents(): boolean {
        // a listener's own update may have rebuilt the groups, and reported the new ones
        if (!this.isAlive()) {
            return false;
        }
        const displayedChildren = this.displayedChildren;
        let childrenChanged = displayedChildren !== this.reportedDisplayedChildren;
        this.reportedDisplayedChildren = displayedChildren;
        const reports = this.childrenReports;
        const children = this.children;
        if (children !== null) {
            for (let i = 0, len = children.length; i < len; ++i) {
                const child = children[i];
                if (child.isColumn) {
                    continue;
                }
                if (child.dispatchLayoutEvents()) {
                    childrenChanged = true;
                }
            }
        }
        // a descendant's listener may have run a layout that already told this group its final children
        if (childrenChanged && reports === this.childrenReports) {
            ++this.childrenReports;
            this.dispatchLocalEvent({ type: 'displayedChildrenChanged' });
        }
        const left = this.left;
        if (left !== this.reportedLeft) {
            this.reportedLeft = left;
            this.dispatchLocalEvent({ type: 'leftChanged' });
        }
        return childrenChanged;
    }

    public getPinned(): ColumnPinnedType {
        return this.pinned;
    }

    public getGroupId(): string {
        return this.groupId;
    }

    public getDisplayName(location: HeaderLocation = 'columnDrop'): string {
        return (
            this.beans.colNames.getDisplayNameForColumnGroup(this, location) ||
            this.getColGroupDef()?.headerName ||
            this.getGroupId()
        );
    }

    public getPartId(): number {
        return this.partId;
    }

    public getActualWidth(): number {
        let groupActualWidth = 0;
        const displayedChildren = this.displayedChildren;
        if (displayedChildren) {
            for (let i = 0, len = displayedChildren.length; i < len; ++i) {
                groupActualWidth += displayedChildren[i].getActualWidth();
            }
        }
        return groupActualWidth;
    }

    public isResizable(): boolean {
        const displayedChildren = this.displayedChildren;
        if (displayedChildren) {
            // if at least one child is resizable, then the group is resizable
            for (let i = 0, len = displayedChildren.length; i < len; ++i) {
                const child = displayedChildren[i];
                if (child.isResizable()) {
                    return true;
                }
            }
        }
        return false;
    }

    public getMinWidth(): number {
        const displayedChildren = this.displayedChildren;
        if (!displayedChildren) {
            return 0;
        }
        let result = 0;
        for (let i = 0, len = displayedChildren.length; i < len; ++i) {
            const child = displayedChildren[i];
            result += child.getMinWidth();
        }
        return result;
    }

    public getDisplayedChildren(): (AgColumn | AgColumnGroup)[] | null {
        return this.displayedChildren;
    }

    public getLeafColumns(): AgColumn[] {
        const result: AgColumn[] = [];
        this.addLeafColumns(result);
        return result;
    }

    public getDisplayedLeafColumns(): AgColumn[] {
        const result: AgColumn[] = [];
        this.addDisplayedLeafColumns(result);
        return result;
    }

    /** 1-based aria column index for this group's header cell: first leaf column's index */
    public get ariaColIndex(): number {
        return edgeLeafColumn(this, false, false)?.ariaColIndex ?? 0;
    }

    public getDefinition(): AbstractColDef | null {
        return this.providedColumnGroup.colGroupDef;
    }

    public getColGroupDef(): ColGroupDef | null {
        return this.providedColumnGroup.colGroupDef;
    }

    public isPadding(): boolean {
        return this.providedColumnGroup.padding;
    }

    public isExpandable(): boolean {
        return this.providedColumnGroup.expandable;
    }

    public isExpanded(): boolean {
        return !!this.providedColumnGroup.expanded;
    }

    public isAutoHeaderHeight(): boolean {
        return !!this.providedColumnGroup.colGroupDef?.autoHeaderHeight;
    }

    public getAutoHeaderHeight(): number | null {
        return this.autoHeaderHeight;
    }

    /** Returns true if the header height has changed */
    public setAutoHeaderHeight(height: number | null): boolean {
        if (height === this.autoHeaderHeight) {
            return false;
        }
        this.autoHeaderHeight = height;
        return true;
    }

    private addDisplayedLeafColumns(leafColumns: AgColumn[]): void {
        const displayedChildren = this.displayedChildren;
        if (displayedChildren) {
            for (let i = 0, len = displayedChildren.length; i < len; ++i) {
                const child = displayedChildren[i];
                if (child.isColumn) {
                    leafColumns.push(child);
                } else if (isColumnGroup(child)) {
                    child.addDisplayedLeafColumns(leafColumns);
                }
            }
        }
    }

    private addLeafColumns(leafColumns: AgColumn[]): void {
        const children = this.children;
        if (children) {
            for (let i = 0, len = children.length; i < len; ++i) {
                const child = children[i];
                if (child.isColumn) {
                    leafColumns.push(child);
                } else if (isColumnGroup(child)) {
                    child.addLeafColumns(leafColumns);
                }
            }
        }
    }

    public getChildren(): (AgColumn | AgColumnGroup)[] | null {
        return this.children;
    }

    public getColumnGroupShow(): ColumnGroupShowType | undefined {
        return this.providedColumnGroup.getColumnGroupShow();
    }

    public getProvidedColumnGroup(): AgProvidedColumnGroup {
        return this.providedColumnGroup;
    }

    public getPaddingLevel(): number {
        let level = 0;
        let current: AgColumnGroup | null = this;

        while (current?.providedColumnGroup.padding && current.parent?.providedColumnGroup.padding) {
            ++level;
            current = current.parent;
        }

        return level;
    }
}

/** First/last (`last`) leaf under `group`, walking `children` or `displayedChildren` (`displayed`) — the
 *  `get(Displayed)LeafColumns()` edge without allocating the array; `null` if empty. */
export const edgeLeafColumn = (group: AgColumnGroup, displayed: boolean, last: boolean): AgColumn | null => {
    const children = displayed ? group.displayedChildren : group.children;
    if (children) {
        for (let i = 0, len = children.length; i < len; ++i) {
            const child = children[last ? len - 1 - i : i];
            if (child.isColumn) {
                return child;
            }
            const leaf = edgeLeafColumn(child, displayed, last);
            if (leaf) {
                return leaf;
            }
        }
    }
    return null;
};

const getLeafMoving = (group: AgProvidedColumnGroup): boolean | null => {
    let hasLeafColumn = false;
    const children = group.children;
    for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        if (child.isColumn) {
            hasLeafColumn = true;
            if (!child.isMoving()) {
                return false;
            }
            continue;
        }
        const childState = getLeafMoving(child);
        if (childState === false) {
            return false;
        }
        if (childState === true) {
            hasLeafColumn = true;
        }
    }
    return hasLeafColumn || null;
};

/** Walk up `column`'s parent chain to the group sitting at header-row `level`. */
export const getColGroupAtLevel = (column: AgColumn, level: number): AgColumnGroup | null => {
    // Decrement `paddingLevel` inline on each parent step.
    let groupPointer = column.parent;
    if (groupPointer) {
        let paddingLevel = groupPointer.getPaddingLevel();
        while (groupPointer && groupPointer.providedColumnGroup.level + paddingLevel > level) {
            groupPointer = groupPointer.parent;
            paddingLevel = paddingLevel > 0 ? paddingLevel - 1 : 0;
        }
    }
    return groupPointer;
};
