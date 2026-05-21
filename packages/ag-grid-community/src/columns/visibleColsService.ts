import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { isColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import { isColumnGroup } from '../entities/agColumnGroup';
import type { RowNode } from '../entities/rowNode';
import type { ColumnEventType } from '../events';
import { _isGroupHideColumnsUntilExpanded, _isRowNumbers } from '../gridOptionsUtils';
import type { ColumnPinnedType } from '../interfaces/iColumn';
import type { ColumnGroupService } from './columnGroups/columnGroupService';
import type { ColumnModel } from './columnModel';
import { getWidthOfColsInList, isColumnGroupAutoCol, isColumnSelectionCol, isRowNumberCol } from './columnUtils';
import { GroupInstanceIdCreator } from './groupInstanceIdCreator';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class VisibleColsService extends BeanStub implements NamedBean {
    beanName = 'visibleCols' as const;

    /** Header tree (groups + leaves) for the left-pinned section. */
    public treeLeft: (AgColumn | AgColumnGroup)[] = [];
    /** Header tree (groups + leaves) for the right-pinned section. */
    public treeRight: (AgColumn | AgColumnGroup)[] = [];
    /** Header tree (groups + leaves) for the centre (scrollable) section. */
    public treeCenter: (AgColumn | AgColumnGroup)[] = [];

    /** Displayed leaf cols in the left-pinned section. */
    public leftCols: AgColumn[] = [];
    /** Displayed leaf cols in the right-pinned section. */
    public rightCols: AgColumn[] = [];
    /** Displayed leaf cols in the centre section. */
    public centerCols: AgColumn[] = [];
    /** Concatenation of `leftCols + centerCols + rightCols` (RTL: right + center + left). */
    public allCols: AgColumn[] = [];

    /** Subset of `allCols` flagged with `colDef.autoHeight`. Rebuilt each refresh. */
    public autoHeightCols: AgColumn[];

    /** Number of header rows to render, accounting for group depth + padding rules. */
    public headerGroupRowCount: number = 0;

    /**
     * Total pixel width of the centre body. Cached because:
     *  - `angularGrid` reads it to size the body element.
     *  - `rowController` reads it when inserting / resizing rows.
     */
    public bodyWidth = 0;
    /** Total pixel width of the left-pinned section (cache; may be stale mid column-move). */
    private leftWidth = 0;
    /** Total pixel width of the right-pinned section (cache; may be stale mid column-move). */
    private rightWidth = 0;

    /** True when `bodyWidth` changed in the last `updateBodyWidths()` — used by virtual col calc in RTL. */
    public isBodyWidthDirty = true;

    /** All cols (displayed + hidden) in visible order including pinned sections — drives `aria-colindex`. */
    private ariaOrderColumns: AgColumn[];

    /** Flat depth-first walk of left + center + right trees (via `children` — ALL children).
     *  Built lazily on first `forEachTreeNode()` after `buildTrees()` / `clear()`. */
    private cachedTreeNodes: (AgColumn | AgColumnGroup)[] | null = null;

    /** Last refresh's `lastLeftPinned` col — drives an O(1) role-swap in `setFirstRightAndLastLeftPinned`. */
    private prevLastLeftPinned: AgColumn | null = null;
    /** Last refresh's `firstRightPinned` col — drives an O(1) role-swap in `setFirstRightAndLastLeftPinned`. */
    private prevFirstRightPinned: AgColumn | null = null;
    /** Last refresh's displayed leaf cols — used to clear stale `col.displayed` and reset stale `col.left`. */
    private prevDisplayedCols: AgColumn[] = [];
    /** Last refresh's displayed groups — used to clear stale `group.displayed`. */
    private prevDisplayedGroups: AgColumnGroup[] = [];

    public refresh(source: ColumnEventType, skipTreeBuild = false): void {
        const { colFlex, colModel, colGroupSvc, colViewport, selectionColSvc, ctrlsSvc } = this.beans;
        // when we open/close col group, skipTreeBuild=false, as we know liveCols haven't changed
        if (!skipTreeBuild) {
            this.buildTrees(colModel, colGroupSvc);
        }

        colGroupSvc?.updateOpenClosedVisibility();

        const leftCols = pickDisplayedCols(this.treeLeft);
        const centerCols = pickDisplayedCols(this.treeCenter);
        const rightCols = pickDisplayedCols(this.treeRight);
        this.leftCols = leftCols;
        this.centerCols = centerCols;
        this.rightCols = rightCols;

        selectionColSvc?.refreshVisibility(leftCols, centerCols, rightCols);

        this.joinColsAriaOrder(colModel);
        this.joinCols();

        this.headerGroupRowCount = this.getHeaderRowCount();

        this.setLeftValues(source);

        const allCols = this.allCols;
        const autoHeightCols: AgColumn[] = [];
        for (let i = 0, len = allCols.length; i < len; ++i) {
            const col = allCols[i];
            if (col.colDef.autoHeight) {
                autoHeightCols.push(col);
            }
        }
        this.autoHeightCols = autoHeightCols;

        // The cached flex viewport width inside `colFlex` only updates from the resize observer
        // in viewportSizeFeature. When pinning changes the logical centre width without resizing
        // the DOM viewport, we must pass the freshly-derived centre width here.
        // Compute pinned widths directly from the just-updated column lists rather than using
        // `getCenterWidth()` — the latter reads the cached `leftWidth`/`rightWidth` via
        // `getLeftStickyColumnContainerWidth`, which is only refreshed by `updateBodyWidths` below.
        const viewportWidth = ctrlsSvc?.getGridBodyCtrl()?.getViewportWidthWithoutScrollbar();
        let flexParams: { viewportWidth: number } | undefined;
        if (viewportWidth != null) {
            const centerWidth = viewportWidth - getWidthOfColsInList(leftCols) - getWidthOfColsInList(rightCols);
            flexParams = { viewportWidth: centerWidth > 0 ? centerWidth : 0 };
        }
        colFlex?.refreshFlexedColumns(flexParams);
        this.updateBodyWidths();
        this.setFirstRightAndLastLeftPinned(leftCols, rightCols, source);
        colViewport.checkViewportColumns(false);

        this.eventSvc.dispatchEvent({
            type: 'displayedColumnsChanged',
            source,
        });
    }

    private getHeaderRowCount(): number {
        if (!this.gos.get('hidePaddedHeaderRows')) {
            return this.beans.colModel.colsTreeDepth;
        }

        let headerGroupRowCount = 0;
        const allCols = this.allCols;
        for (let i = 0, len = allCols.length; i < len; ++i) {
            let parent = allCols[i].parent;
            while (parent) {
                const provided = parent.providedColumnGroup;
                if (!provided.padding) {
                    const level = provided.level + 1;
                    if (level > headerGroupRowCount) {
                        headerGroupRowCount = level;
                    }
                    break;
                }
                parent = parent.parent;
            }
        }

        return headerGroupRowCount;
    }

    /** Called after `setColumnWidth` or `updateGroupsAndPresentedCols`. */
    public updateBodyWidths(): void {
        const newBodyWidth = getWidthOfColsInList(this.centerCols);
        const newLeftWidth = getWidthOfColsInList(this.leftCols);
        const newRightWidth = getWidthOfColsInList(this.rightCols);

        // `isBodyWidthDirty` drives the RTL virtual-col calc — body-width changes flip y coords.
        this.isBodyWidthDirty = this.bodyWidth !== newBodyWidth;

        if (this.bodyWidth === newBodyWidth && this.leftWidth === newLeftWidth && this.rightWidth === newRightWidth) {
            return;
        }
        this.bodyWidth = newBodyWidth;
        this.leftWidth = newLeftWidth;
        this.rightWidth = newRightWidth;

        // Fire `columnContainerWidthChanged` BEFORE `displayedColumnsWidthChanged` so the grid
        // viewport resizes before the scrollbar tries to update its visibility.
        const eventSvc = this.eventSvc;
        eventSvc.dispatchEvent({ type: 'columnContainerWidthChanged' });
        eventSvc.dispatchEvent({ type: 'displayedColumnsWidthChanged' });
    }

    // sets the left pixel position of each column
    public setLeftValues(source: ColumnEventType): void {
        this.setLeftValuesOfCols(source);
        this.setLeftValuesOfGroups();
    }

    private setFirstRightAndLastLeftPinned(leftCols: AgColumn[], rightCols: AgColumn[], source: ColumnEventType): void {
        const leftLen = leftCols.length;
        const newLastLeft = leftLen ? leftCols[leftLen - 1] : null;
        let newFirstRight: AgColumn | null = null;
        const rightLen = rightCols.length;
        if (rightLen) {
            newFirstRight = this.gos.get('enableRtl') ? rightCols[rightLen - 1] : rightCols[0];
        }

        const prevLastLeft = this.prevLastLeftPinned;
        if (prevLastLeft !== newLastLeft) {
            prevLastLeft?.setLastLeftPinned(false, source);
            newLastLeft?.setLastLeftPinned(true, source);
            this.prevLastLeftPinned = newLastLeft;
        }
        const prevFirstRight = this.prevFirstRightPinned;
        if (prevFirstRight !== newFirstRight) {
            prevFirstRight?.setFirstRightPinned(false, source);
            newFirstRight?.setFirstRightPinned(true, source);
            this.prevFirstRightPinned = newFirstRight;
        }
    }

    private buildTrees(colModel: ColumnModel, columnGroupSvc: ColumnGroupService | undefined) {
        const { leftCols, rightCols, centerCols } = this.partitionVisibleCols(colModel);
        const idCreator = new GroupInstanceIdCreator();

        if (columnGroupSvc) {
            this.treeLeft = columnGroupSvc.createColumnGroups({
                columns: leftCols,
                idCreator,
                pinned: 'left',
                oldDisplayedGroups: this.treeLeft,
            });
            this.treeRight = columnGroupSvc.createColumnGroups({
                columns: rightCols,
                idCreator,
                pinned: 'right',
                oldDisplayedGroups: this.treeRight,
            });
            this.treeCenter = columnGroupSvc.createColumnGroups({
                columns: centerCols,
                idCreator,
                pinned: null,
                oldDisplayedGroups: this.treeCenter,
            });
        } else {
            // No group service: trees are flat lists of cols.
            this.treeLeft = leftCols;
            this.treeRight = rightCols;
            this.treeCenter = centerCols;
        }

        this.cachedTreeNodes = null;
        this.refreshDisplayedGroupsFlags();
    }

    /** Single pass over `colsList` that simultaneously filters cols to "should display now" and
     *  partitions them by `pinned` position. Replaces 4 separate filter passes (visibility + 3
     *  pin buckets) with one. Display rules:
     *  - In pivot mode without pivot results: only show value cols, auto-group cols, and enabled
     *    selection / row-numbers cols.
     *  - Otherwise: show auto-group cols (unless `groupHideColumnsUntilExpanded` is managing them)
     *    or any visible col. */
    private partitionVisibleCols(colModel: ColumnModel): {
        leftCols: AgColumn[];
        rightCols: AgColumn[];
        centerCols: AgColumn[];
    } {
        const leftCols: AgColumn[] = [];
        const rightCols: AgColumn[] = [];
        const centerCols: AgColumn[] = [];
        if (!colModel.ready) {
            return { leftCols, rightCols, centerCols };
        }

        const beans = this.beans;
        const showAutoGroupAndValuesOnly = colModel.pivotMode && !colModel.showingPivotResult;
        const showSelectionColumn = beans.selectionColSvc?.isSelectionColumnEnabled() ?? false;
        const showRowNumbers = _isRowNumbers(beans);
        const hideEmptyAutoColGroups = _isGroupHideColumnsUntilExpanded(this.gos);
        // Set-ify value cols only on the pivot-only branch — the cross-product (.includes per row)
        // is O(valueCols × colsList) without this. Empty Set is fine when valueColsSvc is missing.
        const valueColumnsSet = showAutoGroupAndValuesOnly ? new Set(beans.valueColsSvc?.columns) : null;

        const colsList = colModel.colsList;
        for (let i = 0, len = colsList.length; i < len; ++i) {
            const col = colsList[i];
            const isAutoGroupCol = isColumnGroupAutoCol(col);
            let visible: boolean;
            if (valueColumnsSet) {
                visible =
                    valueColumnsSet.has(col) ||
                    (isAutoGroupCol && (!hideEmptyAutoColGroups || col.visible)) ||
                    (showSelectionColumn && isColumnSelectionCol(col)) ||
                    (showRowNumbers && isRowNumberCol(col));
            } else {
                visible = (isAutoGroupCol && !hideEmptyAutoColGroups) || col.visible;
            }
            if (!visible) {
                continue;
            }
            const pinned = col.pinned;
            if (pinned === 'left') {
                leftCols.push(col);
            } else if (pinned === 'right') {
                rightCols.push(col);
            } else {
                centerCols.push(col);
            }
        }
        return { leftCols, rightCols, centerCols };
    }

    public clear(): void {
        // Reset `displayed` on every previously-displayed col/group before dropping the arrays —
        // external readers of `col.displayed` / `group.displayed` (before the next refresh) must see false.
        const prevAll = this.allCols;
        for (let i = 0, len = prevAll.length; i < len; ++i) {
            prevAll[i].displayed = false;
        }
        const prevGroups = this.prevDisplayedGroups;
        for (let i = 0, len = prevGroups.length; i < len; ++i) {
            prevGroups[i].displayed = false;
        }
        this.leftCols = [];
        this.rightCols = [];
        this.centerCols = [];
        this.allCols = [];
        this.prevDisplayedCols = [];
        this.prevDisplayedGroups = [];
        this.ariaOrderColumns = [];
        this.cachedTreeNodes = null;
        // Drop stale pinned-edge refs — cols they pointed at may be destroyed/replaced after clear.
        this.prevLastLeftPinned = null;
        this.prevFirstRightPinned = null;
    }

    private joinColsAriaOrder(colModel: ColumnModel): void {
        // Reorder cols as [left-pinned, center, right-pinned] writing into a preallocated array.
        const cols = colModel.getCols();
        const total = cols.length;
        let leftCount = 0;
        let centerCount = 0;
        for (let i = 0; i < total; ++i) {
            const pinned = cols[i].pinned;
            if (pinned === 'left') {
                ++leftCount;
            } else if (pinned !== 'right') {
                ++centerCount;
            }
        }
        const ordered = new Array<AgColumn>(total);
        let leftCursor = 0;
        let centerCursor = leftCount;
        let rightCursor = leftCount + centerCount;
        for (let i = 0; i < total; ++i) {
            const col = cols[i];
            const pinned = col.pinned;
            if (pinned === 'left') {
                ordered[leftCursor++] = col;
            } else if (pinned === 'right') {
                ordered[rightCursor++] = col;
            } else {
                ordered[centerCursor++] = col;
            }
        }
        this.ariaOrderColumns = ordered;
    }

    public getAriaColIndex(colOrGroup: AgColumn | AgColumnGroup): number {
        const col = isColumnGroup(colOrGroup) ? colOrGroup.getLeafColumns()[0] : colOrGroup;
        return this.ariaOrderColumns.indexOf(col) + 1;
    }

    private setLeftValuesOfGroups(): void {
        // a group's `left` is the lowest `left` of its children.
        checkLeftOnGroups(this.treeLeft);
        checkLeftOnGroups(this.treeRight);
        checkLeftOnGroups(this.treeCenter);
    }

    private setLeftValuesOfCols(source: ColumnEventType): void {
        if (!this.beans.colModel.getColDefCols()) {
            return;
        }

        setLeftsLeftToRight(this.leftCols, source);
        setLeftsLeftToRight(this.rightCols, source);
        setLeftsLeftToRight(this.centerCols, source);

        // Cols that just transitioned displayed → hidden need `left` reset — otherwise if the col
        // is shown again later the cell animates in from the stale old position. Scoping to
        // `prevDisplayedCols` avoids walking the full master list (only prev-displayed cols can be stale).
        const prevDisplayed = this.prevDisplayedCols;
        for (let i = 0, len = prevDisplayed.length; i < len; ++i) {
            const column = prevDisplayed[i];
            if (!column.displayed) {
                column.setLeft(null, source);
            }
        }
    }

    private joinCols(): void {
        const { leftCols, centerCols, rightCols } = this;
        // Clear `displayed` on cols that were shown last refresh — only those can be stale,
        // since hidden cols already had `displayed === false`.
        const prevAll = this.allCols;
        for (let i = 0, len = prevAll.length; i < len; ++i) {
            prevAll[i].displayed = false;
        }
        const all = this.gos.get('enableRtl')
            ? rightCols.concat(centerCols, leftCols)
            : leftCols.concat(centerCols, rightCols);
        this.prevDisplayedCols = prevAll;
        this.allCols = all;
        for (let i = 0, len = all.length; i < len; ++i) {
            all[i].displayed = true;
        }
    }

    public getAllTrees(): (AgColumn | AgColumnGroup)[] | null {
        // `| null` is kept for the public API contract (columnGroupApi.getAllDisplayedColumnGroups).
        return this.treeLeft.concat(this.treeCenter, this.treeRight);
    }

    /** Flat depth-first list of every node in left + center + right trees (via `children` — ALL
     *  children, displayed or not). Cached and reused until `buildTrees()` / `clear()` invalidates.
     *  Callers iterate the returned array directly — no callback overhead. */
    public getTreeNodes(): readonly (AgColumn | AgColumnGroup)[] {
        let result = this.cachedTreeNodes;
        if (result === null) {
            result = [];
            collectAllTreeNodes(this.treeLeft, result);
            collectAllTreeNodes(this.treeCenter, result);
            collectAllTreeNodes(this.treeRight, result);
            this.cachedTreeNodes = result;
        }
        return result;
    }

    public getLeftColsForRow(rowNode: RowNode): AgColumn[] {
        return this.beans.colModel.colSpanActive ? this.getColsForRow(rowNode, this.leftCols) : this.leftCols;
    }

    public getRightColsForRow(rowNode: RowNode): AgColumn[] {
        return this.beans.colModel.colSpanActive ? this.getColsForRow(rowNode, this.rightCols) : this.rightCols;
    }

    /** `filterCallback` is only set for the centre (virtualised) area. For a col-spanned run
     *  we keep it if ANY spanned col passes the filter. */
    public getColsForRow(
        rowNode: RowNode,
        displayedColumns: AgColumn[],
        filterCallback?: (column: AgColumn) => boolean,
        emptySpaceBeforeColumn?: (column: AgColumn) => boolean
    ): AgColumn[] {
        const result: AgColumn[] = [];
        let lastConsideredCol: AgColumn | null = null;
        const len = displayedColumns.length;

        for (let i = 0; i < len; ++i) {
            const col = displayedColumns[i];
            const colSpan = Math.min(col.getColSpan(rowNode), len - i);

            let filterPasses: boolean;
            if (filterCallback) {
                filterPasses = filterCallback(col);
                for (let j = 1; !filterPasses && j < colSpan; ++j) {
                    if (filterCallback(displayedColumns[i + j])) {
                        filterPasses = true;
                    }
                }
            } else {
                filterPasses = true;
            }

            if (colSpan > 1) {
                i += colSpan - 1;
            }

            if (filterPasses) {
                if (result.length === 0 && lastConsideredCol && emptySpaceBeforeColumn?.(col)) {
                    result.push(lastConsideredCol);
                }
                result.push(col);
            }

            lastConsideredCol = col;
        }

        return result;
    }

    public getContainerWidth(pinned: ColumnPinnedType): number {
        switch (pinned) {
            case 'left':
                return this.leftWidth;
            case 'right':
                return this.rightWidth;
            default:
                return this.bodyWidth;
        }
    }

    public getColBefore(col: AgColumn): AgColumn | null {
        const cols = this.allCols;
        const idx = cols.indexOf(col);
        return idx > 0 ? cols[idx - 1] : null;
    }

    public isPinningLeft(): boolean {
        return this.leftCols.length > 0;
    }

    public isPinningRight(): boolean {
        return this.rightCols.length > 0;
    }

    private refreshDisplayedGroupsFlags(): void {
        // Clear `displayed` on every group that was displayed last refresh — only those can
        // be stale (orphaned by this rebuild). Then flag the newly-displayed set.
        const prev = this.prevDisplayedGroups;
        for (let i = 0, len = prev.length; i < len; ++i) {
            prev[i].displayed = false;
        }
        const next: AgColumnGroup[] = [];
        const nodes = this.getTreeNodes();
        for (let i = 0, len = nodes.length; i < len; ++i) {
            const node = nodes[i];
            if (isColumnGroup(node)) {
                node.displayed = true;
                next.push(node);
            }
        }
        this.prevDisplayedGroups = next;
    }

    // used by:
    // + rowRenderer -> for navigation
    public getColAfter(col: AgColumn): AgColumn | null {
        const cols = this.allCols;
        const idx = cols.indexOf(col);
        // When `col` isn't currently displayed (idx === -1) returns the first col (if any).
        // Header navigation relies on this fall-through.
        return idx < cols.length - 1 ? cols[idx + 1] : null;
    }

    // used by:
    // + angularGrid -> setting pinned body width
    // note: the cache value `leftWidth` can be stale while actively moving column, so prefer getWidthOfColsInList.
    public getLeftStickyColumnContainerWidth() {
        // sometimes the leftCols are empty after a refresh, so attempt to grab cached values.
        return this.leftCols.length ? getWidthOfColsInList(this.leftCols) : this.leftWidth;
    }

    // note: the cache value `rightWidth` can be stale while actively moving columns, so prefer getWidthOfColsInList.
    public getRightStickyColumnContainerWidth() {
        // sometimes the rightCols are empty after a refresh, so attempt to grab cached values.
        return this.rightCols.length ? getWidthOfColsInList(this.rightCols) : this.rightWidth;
    }

    public isColAtEdge(col: AgColumn | AgColumnGroup, edge: 'first' | 'last'): boolean {
        const allCols = this.allCols;
        const allLen = allCols.length;
        if (!allLen) {
            return false;
        }
        const isFirst = edge === 'first';

        let target: AgColumn;
        if (isColumnGroup(col)) {
            const leaves = col.getDisplayedLeafColumns();
            const leafLen = leaves.length;
            if (!leafLen) {
                return false;
            }
            target = isFirst ? leaves[0] : leaves[leafLen - 1];
        } else {
            target = col;
        }
        return (isFirst ? allCols[0] : allCols[allLen - 1]) === target;
    }
}

/** Flat depth-first walk via `children` (ALL children) into `out`. */
function collectAllTreeNodes(tree: (AgColumn | AgColumnGroup)[], out: (AgColumn | AgColumnGroup)[]): void {
    for (let i = 0, len = tree.length; i < len; ++i) {
        const child = tree[i];
        if (isColumnGroup(child)) {
            const children = child.children;
            if (children) {
                collectAllTreeNodes(children, out);
            }
        }
        out.push(child);
    }
}

function pickDisplayedCols(tree: (AgColumn | AgColumnGroup)[]): AgColumn[] {
    const out: AgColumn[] = [];
    pickDisplayedColsInto(tree, out);
    return out;
}

function pickDisplayedColsInto(tree: (AgColumn | AgColumnGroup)[] | null, out: AgColumn[]): void {
    if (!tree) {
        return;
    }
    for (let i = 0, len = tree.length; i < len; ++i) {
        const child = tree[i];
        if (isColumn(child)) {
            out.push(child);
        } else {
            pickDisplayedColsInto(child.displayedChildren, out);
        }
    }
}

function checkLeftOnGroups(tree: (AgColumn | AgColumnGroup)[] | null): void {
    if (!tree) {
        return;
    }
    for (let i = 0, len = tree.length; i < len; ++i) {
        const node = tree[i];
        if (isColumnGroup(node)) {
            node.checkLeft();
        }
    }
}

function setLeftsLeftToRight(columns: AgColumn[], source: ColumnEventType): void {
    let left = 0;
    for (let i = 0, len = columns.length; i < len; ++i) {
        const column = columns[i];
        column.setLeft(left, source);
        left += column.getActualWidth();
    }
}
