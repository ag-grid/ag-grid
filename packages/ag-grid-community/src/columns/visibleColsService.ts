import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import { edgeLeafColumn, isColumnGroup } from '../entities/agColumnGroup';
import type { RowNode } from '../entities/rowNode';
import type { ColumnEventType } from '../events';
import { _isGroupHideColumnsUntilExpanded, _isRowNumbers } from '../gridOptionsUtils';
import type { ColumnFlexService } from './columnFlexService';
import type { ColumnGroupService } from './columnGroups/columnGroupService';
import type { ColumnModel } from './columnModel';
import { getWidthOfColsInList } from './columnUtils';
import type { ColumnViewportService } from './columnViewportService';
import { GroupInstanceIdCreator } from './groupInstanceIdCreator';

/** Per-section total pixel widths (left-pinned, centre body, right-pinned). */
type SectionWidths = { left: number; center: number; right: number };

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class VisibleColsService extends BeanStub implements NamedBean {
    beanName = 'visibleCols' as const;

    private colModel: ColumnModel;
    private colGroupSvc: ColumnGroupService;
    private colViewport: ColumnViewportService;
    private ctrlsSvc: CtrlsService;
    private colFlex?: ColumnFlexService;
    /** True iff any centre col has `flex > 0` — lets the flex pass be skipped when nothing flexes. */
    private flexActive = false;

    // tree of columns to be displayed for each section
    public treeLeft: (AgColumn | AgColumnGroup)[] = [];
    public treeRight: (AgColumn | AgColumnGroup)[] = [];
    public treeCenter: (AgColumn | AgColumnGroup)[] = [];

    public leftCols: AgColumn[] = [];
    public rightCols: AgColumn[] = [];
    public centerCols: AgColumn[] = [];
    /** `leftCols + centerCols + rightCols` (RTL: right + center + left). */
    public allCols: AgColumn[] = [];

    /** `allCols` with `colDef.autoHeight`. Reused across refreshes to stay warm. */
    public readonly autoHeightCols: AgColumn[] = [];

    /** Number of header rows to render, accounting for group depth + padding rules. */
    public headerGroupRowCount: number = 0;

    /** Centre body width. Cached for body sizing and row insert/resize. */
    public bodyWidth = 0;
    public leftWidth = 0;
    public rightWidth = 0;
    public totalWidth = 0;

    /** `bodyWidth` changed in the last `updateBodyWidths()` — drives the RTL virtual-col calc. */
    public isBodyWidthDirty = true;

    /** Prev refresh's pinned-edge cols — drive an O(1) role-swap in `setFirstRightAndLastLeftPinned`. */
    private prevLastLeftPinned: AgColumn | null = null;
    private prevFirstRightPinned: AgColumn | null = null;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.colGroupSvc = beans.colGroupSvc;
        this.colViewport = beans.colViewport;
        this.ctrlsSvc = beans.ctrlsSvc;
        this.colFlex = beans.colFlex;
    }

    /** `skipTreeBuild=true` reuses the trees; valid only when liveCols are unchanged (group toggle, width autosize). */
    public refresh(source: ColumnEventType, skipTreeBuild: boolean): void {
        const { colFlex, colModel, colViewport, ctrlsSvc } = this;
        if (!skipTreeBuild) {
            this.buildTrees();
        }

        // One top-down DFS per section: computes `displayedChildren` and collects displayed leaves.
        const treeLeft = this.treeLeft;
        const treeCenter = this.treeCenter;
        const treeRight = this.treeRight;
        let leftCols: AgColumn[];
        let centerCols: AgColumn[];
        let rightCols: AgColumn[];
        if (colModel.colsTreeDepth === 0) {
            // Depth 0: trees are flat leaf lists; reuse directly (the DFS would only copy).
            leftCols = treeLeft as AgColumn[];
            centerCols = treeCenter as AgColumn[];
            rightCols = treeRight as AgColumn[];
        } else {
            leftCols = [];
            centerCols = [];
            rightCols = [];
            for (let i = 0, len = treeLeft.length; i < len; ++i) {
                updateGroupsAndCollectLeaves(treeLeft[i], null, leftCols);
            }
            for (let i = 0, len = treeCenter.length; i < len; ++i) {
                updateGroupsAndCollectLeaves(treeCenter[i], null, centerCols);
            }
            for (let i = 0, len = treeRight.length; i < len; ++i) {
                updateGroupsAndCollectLeaves(treeRight[i], null, rightCols);
            }
        }
        this.leftCols = leftCols;
        this.centerCols = centerCols;
        this.rightCols = rightCols;

        // `joinCols` stamps each col's `left` + returns section widths; then clear stale lefts + groups.
        const widths = this.joinCols(source);
        this.setLeftValuesOfGroups(source);

        // Run flex sizing when a flex col exists OR cols await a flex-then-reveal pass
        // (a "had flex" → "no flex" transition still needs the reveal).
        const runFlex = this.flexActive || colFlex?.columnsHidden;
        if (runFlex) {
            // colFlex's cached viewport width only updates on DOM resize, but pinning changes centre
            // width without one — so derive centre width from the just-set section totals.
            const viewportWidth = ctrlsSvc?.getGridBodyCtrl()?.getViewportWidthWithoutScrollbar();
            let flexParams: { viewportWidth: number } | undefined;
            if (viewportWidth != null) {
                const centerWidth = viewportWidth - widths.left - widths.right;
                flexParams = { viewportWidth: centerWidth > 0 ? centerWidth : 0 };
            }
            colFlex?.refreshFlexedColumns(flexParams);
        }
        // Reuse the section totals — except after a flex pass, which resized centre cols, so re-sum.
        this.updateBodyWidths(runFlex ? undefined : widths);
        this.setFirstRightAndLastLeftPinned(leftCols, rightCols, source);
        colViewport.checkViewportColumns(false);

        this.eventSvc.dispatchEvent({ type: 'displayedColumnsChanged', source });
    }

    /** `widths` reuses totals already computed on the hot `refresh` path; omit to re-sum. */
    public updateBodyWidths(widths?: SectionWidths): void {
        const newBodyWidth = widths ? widths.center : getWidthOfColsInList(this.centerCols);
        const newLeftWidth = widths ? widths.left : getWidthOfColsInList(this.leftCols);
        const newRightWidth = widths ? widths.right : getWidthOfColsInList(this.rightCols);

        // Drives the RTL virtual-col calc — body-width changes flip y coords.
        const bodyWidthDirty = this.bodyWidth !== newBodyWidth;
        this.isBodyWidthDirty = bodyWidthDirty;

        if (!bodyWidthDirty && this.leftWidth === newLeftWidth && this.rightWidth === newRightWidth) {
            return;
        }
        this.bodyWidth = newBodyWidth;
        this.leftWidth = newLeftWidth;
        this.rightWidth = newRightWidth;
        this.totalWidth = newBodyWidth + newLeftWidth + newRightWidth;

        // `columnContainerWidthChanged` BEFORE `displayedColumnsWidthChanged`: viewport must resize
        // before the scrollbar updates its visibility.
        const eventSvc = this.eventSvc;
        eventSvc.dispatchEvent({ type: 'columnContainerWidthChanged' });
        eventSvc.dispatchEvent({ type: 'displayedColumnsWidthChanged' });
    }

    /** Repositions each col's section-relative `left` without rebuilding the displayed set; returns
     *  per-section widths. Lighter sibling of `joinCols`, for resize / autosize / flex. */
    public setLeftValues(source: ColumnEventType): SectionWidths {
        const left = setLeftsLeftToRight(this.leftCols, source);
        const right = setLeftsLeftToRight(this.rightCols, source);
        const center = setLeftsLeftToRight(this.centerCols, source);
        this.setLeftValuesOfGroups(source);
        return { left, center, right };
    }

    private setLeftValuesOfGroups(source: ColumnEventType): void {
        // A col that left the displayed set keeps a stale `left`; clear it so it doesn't render offset.
        // `setLeft(null)` short-circuits on already-null cols, so cheap on warm refreshes.
        const colsList = this.colModel.colsList;
        for (let i = 0, len = colsList.length; i < len; ++i) {
            const column = colsList[i];
            if (!column.displayed) {
                column.setLeft(null, source);
            }
        }
        checkLeftOnGroups(this.treeLeft);
        checkLeftOnGroups(this.treeRight);
        checkLeftOnGroups(this.treeCenter);
    }

    private setFirstRightAndLastLeftPinned(leftCols: AgColumn[], rightCols: AgColumn[], source: ColumnEventType): void {
        const leftLen = leftCols.length;
        const newLastLeft = leftLen ? leftCols[leftLen - 1] : null;
        let newFirstRight: AgColumn | null = null;
        const rightLen = rightCols.length;
        if (rightLen) {
            newFirstRight = this.gos.get('enableRtl') ? rightCols[rightLen - 1] : rightCols[0];
        }

        // Destroyed prev refs are harmless: `AgColumn.destroy` already clears these flags, so the
        // false-clear short-circuits via the no-change guard.
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

    private buildTrees() {
        const { colModel, colGroupSvc } = this;
        const { leftCols, rightCols, centerCols, leftCount, centerCount } = this.partitionVisibleCols();
        this.stampAriaColIndexes(leftCount, centerCount);
        const idCreator = new GroupInstanceIdCreator();
        if (colGroupSvc) {
            const buildToken = colModel.nextBuildToken();
            this.treeLeft = colGroupSvc.createGroups(leftCols, idCreator, 'left', buildToken);
            this.treeRight = colGroupSvc.createGroups(rightCols, idCreator, 'right', buildToken);
            this.treeCenter = colGroupSvc.createGroups(centerCols, idCreator, null, buildToken);
            colGroupSvc.prune(buildToken);
        } else {
            // No group service: trees are flat lists of cols.
            this.treeLeft = leftCols;
            this.treeRight = rightCols;
            this.treeCenter = centerCols;
        }
    }

    /** Single pass over `colsList`: filter to displayable cols and bucket by pin. The selection col is held
     *  back until a non-service col proves it isn't the only displayed col — a lone checkbox adds nothing. */
    private partitionVisibleCols(): {
        leftCols: AgColumn[];
        rightCols: AgColumn[];
        centerCols: AgColumn[];
        leftCount: number;
        centerCount: number;
    } {
        const colModel = this.colModel;
        const leftCols: AgColumn[] = [];
        const rightCols: AgColumn[] = [];
        const centerCols: AgColumn[] = [];
        // Counts ALL colsList cols by pin (hidden included) to seed the aria cursors in one pass:
        // hidden cols still take aria slots, so the displayed buckets can't be used.
        let leftCount = 0;
        let centerCount = 0;
        if (!colModel.ready) {
            return { leftCols, rightCols, centerCols, leftCount, centerCount };
        }

        const beans = this.beans;
        const showAutoGroupAndValuesOnly = colModel.pivotMode && !colModel.showingPivotResult;
        const showSelectionColumn = beans.selectionColSvc?.isEnabled() ?? false;
        const showRowNumbers = _isRowNumbers(beans);
        const hideEmptyAutoColGroups = _isGroupHideColumnsUntilExpanded(this.gos);

        const colsList = colModel.colsList;
        let pending: AgColumn | null = null;
        for (let i = 0, len = colsList.length; i < len; ++i) {
            const col = colsList[i];
            const colKind = col.colKind;
            const pinned = col.pinned;
            // right cursor derives from total - left - center, so only left/center need counting
            if (pinned !== 'right') {
                if (pinned) {
                    ++leftCount;
                } else {
                    ++centerCount;
                }
            }
            const isAutoGroupCol = colKind === 'auto-group';
            let visible: boolean;
            if (showAutoGroupAndValuesOnly) {
                // `col.aggregationActive` ⟺ membership of valueColsSvc.
                visible =
                    col.aggregationActive ||
                    (isAutoGroupCol && (!hideEmptyAutoColGroups || col.visible)) ||
                    (showSelectionColumn && colKind === 'selection') ||
                    (showRowNumbers && colKind === 'row-number');
            } else {
                visible = (isAutoGroupCol && !hideEmptyAutoColGroups) || col.visible;
            }
            if (!visible) {
                continue;
            }
            if (colKind === 'selection' && col.visible) {
                pending = col;
                continue;
            }
            if (pending !== null && colKind !== 'row-number') {
                const selPinned = pending.pinned;
                if (selPinned === 'right') {
                    rightCols.push(pending);
                } else if (selPinned) {
                    leftCols.push(pending);
                } else {
                    centerCols.push(pending);
                }
                pending = null;
            }
            if (pinned === 'right') {
                rightCols.push(col);
            } else if (pinned) {
                leftCols.push(col);
            } else {
                centerCols.push(col);
            }
        }
        return { leftCols, rightCols, centerCols, leftCount, centerCount };
    }

    public clear(): void {
        const prevAll = this.allCols;
        for (let i = 0, len = prevAll.length; i < len; ++i) {
            prevAll[i].allColsIndex = -1;
            prevAll[i].displayed = false;
        }
        this.leftCols = [];
        this.rightCols = [];
        this.centerCols = [];
        this.allCols = [];
    }

    private stampAriaColIndexes(leftCount: number, centerCount: number): void {
        const cols = this.colModel.colsList;
        // 1-based: the value is consumed directly as `aria-colindex` (no `+1` at read time).
        let leftCursor = 1;
        let centerCursor = leftCount + 1;
        let rightCursor = leftCount + centerCount + 1;
        for (let i = 0, total = cols.length; i < total; ++i) {
            const col = cols[i];
            const pinned = col.pinned;
            if (pinned === 'right') {
                col.ariaColIndex = rightCursor++;
            } else if (pinned) {
                col.ariaColIndex = leftCursor++;
            } else {
                col.ariaColIndex = centerCursor++;
            }
        }
    }

    /** One pass over displayed cols: stamps `allColsIndex` (display order; RTL flips sections) and
     *  section-relative `left`, returning per-section widths so {@link updateBodyWidths} needn't re-sum. */
    private joinCols(source: ColumnEventType): SectionWidths {
        const { leftCols, centerCols, rightCols } = this;
        // `skipTreeBuild` path skips `clear()`, so un-stamp the prior set here: departed cols must
        // reach `displayed === false` or `setLeftValuesOfGroups` won't clear their stale `left`.
        const prevAll = this.allCols;
        for (let i = 0, len = prevAll.length; i < len; ++i) {
            prevAll[i].allColsIndex = -1;
            prevAll[i].displayed = false;
        }
        const all: AgColumn[] = [];
        this.autoHeightCols.length = 0;
        // `layoutSection` accumulates `flexActive` / `headerGroupRowCount` across its three calls — reset them first.
        this.flexActive = false;
        const hidePaddedHeaderRows = !!this.gos.get('hidePaddedHeaderRows');
        this.headerGroupRowCount = hidePaddedHeaderRows ? 0 : this.colModel.colsTreeDepth;

        let leftWidth: number;
        let centerWidth: number;
        let rightWidth: number;
        if (this.gos.get('enableRtl')) {
            rightWidth = this.layoutSection(rightCols, all, hidePaddedHeaderRows, source);
            centerWidth = this.layoutSection(centerCols, all, hidePaddedHeaderRows, source);
            leftWidth = this.layoutSection(leftCols, all, hidePaddedHeaderRows, source);
        } else {
            leftWidth = this.layoutSection(leftCols, all, hidePaddedHeaderRows, source);
            centerWidth = this.layoutSection(centerCols, all, hidePaddedHeaderRows, source);
            rightWidth = this.layoutSection(rightCols, all, hidePaddedHeaderRows, source);
        }

        this.allCols = all;
        return { left: leftWidth, center: centerWidth, right: rightWidth };
    }

    /** Lays one section's cols into `all`: stamps `allColsIndex` + section-relative `left`, folding in
     *  `autoHeightCols`/`flexActive`/`headerGroupRowCount`. A method not a closure, so it allocates nothing. */
    private layoutSection(
        cols: AgColumn[],
        all: AgColumn[],
        hidePaddedHeaderRows: boolean,
        source: ColumnEventType
    ): number {
        const autoHeightCols = this.autoHeightCols;
        let left = 0;
        // Leaves under one group are contiguous; skip the parent-chain walk for same-parent runs.
        let lastParent: AgColumnGroup | null = null;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            col.allColsIndex = all.length;
            col.displayed = true;
            col.setLeft(left, source);
            all.push(col);
            if (col.colDef.autoHeight) {
                autoHeightCols.push(col);
            }
            if (!this.flexActive && col.pinned == null) {
                const flex = col.flex;
                if (flex != null && flex > 0) {
                    this.flexActive = true;
                }
            }
            if (hidePaddedHeaderRows) {
                const parent = col.parent;
                if (parent !== null && parent !== lastParent) {
                    lastParent = parent;
                    const depth = displayedHeaderGroupDepth(parent);
                    if (depth > this.headerGroupRowCount) {
                        this.headerGroupRowCount = depth;
                    }
                }
            }
            left += col.actualWidth;
        }
        return left;
    }

    public getLeftColsForRow(rowNode: RowNode): AgColumn[] {
        return this.colModel.colSpanActive ? this.getColsForRow(rowNode, this.leftCols) : this.leftCols;
    }

    public getRightColsForRow(rowNode: RowNode): AgColumn[] {
        return this.colModel.colSpanActive ? this.getColsForRow(rowNode, this.rightCols) : this.rightCols;
    }

    /** `filterCallback` is only set for the centre (virtualised) area. A col-spanned run is kept if
     *  ANY spanned col passes the filter. */
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

    public getColBefore(col: AgColumn): AgColumn | null {
        const idx = col.allColsIndex;
        return idx > 0 ? this.allCols[idx - 1] : null;
    }

    public getColAfter(col: AgColumn): AgColumn | null {
        const cols = this.allCols;
        const idx = col.allColsIndex;
        // Not-displayed col (idx === -1) falls through to first col — header navigation relies on it.
        return idx < cols.length - 1 ? cols[idx + 1] : null;
    }

    /** Prefer the recomputed width: the `leftWidth` cache can be stale mid column-move. */
    public getLeftStickyColumnContainerWidth() {
        return this.leftCols.length ? getWidthOfColsInList(this.leftCols) : this.leftWidth;
    }

    /** Prefer the recomputed width: the `rightWidth` cache can be stale mid column-move. */
    public getRightStickyColumnContainerWidth() {
        return this.rightCols.length ? getWidthOfColsInList(this.rightCols) : this.rightWidth;
    }

    public isColAtEdge(col: AgColumn | AgColumnGroup, edge: 'first' | 'last'): boolean {
        const allCols = this.allCols;
        const allLen = allCols.length;
        if (!allLen) {
            return false;
        }
        const isFirst = edge === 'first';
        const target = isColumnGroup(col) ? edgeLeafColumn(col, true, !isFirst) : col;
        if (!target) {
            return false;
        }
        return (isFirst ? allCols[0] : allCols[allLen - 1]) === target;
    }
}

/** Top-down DFS: computes each `group.displayedChildren` and collects displayed leaves into `out` in one pass.
 *  `parentWithExpansion` carries `columnGroupShow` down (no per-group parent walk). Returns true if anything changed. */
const updateGroupsAndCollectLeaves = (
    node: AgColumn | AgColumnGroup,
    parentWithExpansion: AgColumnGroup | null,
    out: AgColumn[]
): boolean => {
    if (node.isColumn) {
        out.push(node);
        return false;
    }
    const myParentWithExpansion = node.isPadding() ? parentWithExpansion : node;
    const provided = myParentWithExpansion?.providedColumnGroup ?? null;
    const expandable = provided?.expandable;

    const oldList = node.displayedChildren;
    const oldLen = oldList?.length ?? 0;
    let newList: (AgColumn | AgColumnGroup)[] | null = null;
    let outLen = 0;
    let descendantChanged = false;
    const children = node.children;
    if (children !== null) {
        const expanded = expandable && provided.expanded;
        for (let i = 0, childrenLen = children.length; i < childrenLen; ++i) {
            const child = children[i];
            if (expandable) {
                const show = child.getColumnGroupShow();
                // padding children carry no `columnGroupShow`, so the default branch keeps them
                if ((show === 'open' && !expanded) || (show === 'closed' && expanded)) {
                    continue;
                }
                const startOut = out.length;
                if (updateGroupsAndCollectLeaves(child, myParentWithExpansion, out)) {
                    descendantChanged = true;
                }
                if (out.length === startOut) {
                    // Empty group under an expandable parent — exclude.
                    continue;
                }
            } else if (updateGroupsAndCollectLeaves(child, myParentWithExpansion, out)) {
                descendantChanged = true; // Not expandable: every child is displayed; recurse only to compute descendants.
            }
            if (newList !== null) {
                newList.push(child);
            } else if (outLen >= oldLen || oldList![outLen] !== child) {
                if (oldList === null) {
                    newList = [child];
                } else {
                    newList = oldList.slice(0, outLen);
                    newList.push(child);
                }
            }
            ++outLen;
        }
    }
    const selfChanged = newList !== null || outLen !== oldLen;
    if (selfChanged) {
        // `newList === null` => same prefix but oldList was longer => truncate to `outLen`.
        node.displayedChildren = newList ?? oldList!.slice(0, outLen);
    }
    if (selfChanged || descendantChanged) {
        node.dispatchLocalEvent({ type: 'displayedChildrenChanged' });
    }
    return selfChanged || descendantChanged;
};

const displayedHeaderGroupDepth = (group: AgColumnGroup): number => {
    let current: AgColumnGroup | null = group;
    while (current) {
        const provided = current.providedColumnGroup;
        if (!provided.padding) {
            return provided.level + 1;
        }
        current = current.parent;
    }
    return 0;
};

const checkLeftOnGroups = (tree: (AgColumn | AgColumnGroup)[]): void => {
    for (let i = 0, len = tree.length; i < len; ++i) {
        const node = tree[i];
        if (isColumnGroup(node)) {
            node.checkLeft();
        }
    }
};

/** Sets each col's `left` to the running offset; returns the total width (the final offset). */
const setLeftsLeftToRight = (columns: AgColumn[], source: ColumnEventType): number => {
    let left = 0;
    for (let i = 0, len = columns.length; i < len; ++i) {
        const column = columns[i];
        column.setLeft(left, source);
        left += column.actualWidth;
    }
    return left;
};
