import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import { edgeLeafColumn, isColumnGroup } from '../entities/agColumnGroup';
import type { ColumnEventType } from '../events';
import { _isGroupHideColumnsUntilExpanded, _isRowNumbers } from '../gridOptionsUtils';
import type { RowAutoHeightService } from '../rendering/row/rowAutoHeightService';
import type { RowRenderer } from '../rendering/rowRenderer';
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
    private rowRenderer: RowRenderer;
    private rowAutoHeight?: RowAutoHeightService;
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

    /** How many displayed columns have `colDef.colSpan`, sizing a row's colSpans cache; while not 0, rows can differ
     *  in the cells they draw. */
    public colSpanColCount = 0;

    /** `allCols` with a legacy `colDef.rowSpan`, whose cells re-read it as their row's data changes. */
    public readonly rowSpanCols: AgColumn[] = [];

    /** Number of header rows to render, accounting for group depth + padding rules. */
    public headerGroupRowCount: number = 0;

    /** Centre body width. Cached for body sizing and row insert/resize. */
    public bodyWidth = 0;
    public leftWidth = 0;
    public rightWidth = 0;
    public totalWidth = 0;

    /** Bumped once per pass that restamps the column lefts, so anything derived from where the columns
     *  are can tell whether it is looking at the same layout without re-deriving it. */
    public layoutVersion = 0;

    /** A cell may have moved or resized with no section total changing since the cells were last placed. */
    private cellsMoved = false;
    /** The source of the last layout made inside a column update, whose layout events wait for its end. */
    private pendingLayoutSource: ColumnEventType | null = null;

    /** Bumped whenever `allCols` is replaced, so a cache keyed on the displayed columns need not hold the old list. */
    public displayedColsVersion = 0;

    /** The pinned-edge cols, so `setPinnedEdges` swaps the roles in O(1). */
    private lastLeftPinnedCol: AgColumn | null = null;
    private firstRightPinnedCol: AgColumn | null = null;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.colGroupSvc = beans.colGroupSvc;
        this.colViewport = beans.colViewport;
        this.ctrlsSvc = beans.ctrlsSvc;
        this.colFlex = beans.colFlex;
        this.rowRenderer = beans.rowRenderer;
        this.rowAutoHeight = beans.rowAutoHeight;
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
                collectLeaves(treeLeft[i], null, leftCols);
            }
            for (let i = 0, len = treeCenter.length; i < len; ++i) {
                collectLeaves(treeCenter[i], null, centerCols);
            }
            for (let i = 0, len = treeRight.length; i < len; ++i) {
                collectLeaves(treeRight[i], null, rightCols);
            }
        }
        // Replaced, never mutated in place: `colViewport` detects a changed render set by comparing
        // against the array it last kept, so an in-place edit would read as unchanged forever.
        this.leftCols = leftCols;
        this.centerCols = centerCols;
        this.rightCols = rightCols;

        // `joinCols` stamps each col's `left` + returns section widths; then the groups' lefts.
        const widths = this.joinCols();
        this.setLeftValuesOfGroups();
        // set before anything is drawn or told, so a cell drawn now and a listener's own refresh both see them
        this.setPinnedEdges(leftCols, rightCols);

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
        // a changed displayed set can trade one column's width for another's with no left or total moving
        this.cellsMoved = true;
        // Reuse the section totals — except after a flex pass, which resized centre cols, so re-sum.
        this.layoutBodyWidths(runFlex ? undefined : widths);
        colViewport.checkViewportColumns(false);

        this.rowAutoHeight?.requestCheckAutoHeight();
        this.dispatchLayoutEvents(source);
        this.eventSvc.dispatchEvent({ type: 'displayedColumnsChanged', source });
    }

    /** Ends a resize, a fit or a flex pass; `widths` reuses totals already summed, else they are re-summed. */
    public updateBodyWidths(source: ColumnEventType, widths?: SectionWidths): void {
        this.layoutBodyWidths(widths);
        this.dispatchLayoutEvents(source);
    }

    private layoutBodyWidths(widths: SectionWidths | undefined): void {
        // Above the comparison below: a move restamps the lefts and leaves all three totals unchanged.
        ++this.layoutVersion;

        const newBodyWidth = widths ? widths.center : getWidthOfColsInList(this.centerCols);
        const newLeftWidth = widths ? widths.left : getWidthOfColsInList(this.leftCols);
        const newRightWidth = widths ? widths.right : getWidthOfColsInList(this.rightCols);

        if (this.bodyWidth === newBodyWidth && this.leftWidth === newLeftWidth && this.rightWidth === newRightWidth) {
            // over the same displayed columns, a width change moves a section total or a later left
            if (this.cellsMoved) {
                this.cellsMoved = false;
                this.refreshCellPositions();
            }
            return;
        }
        this.bodyWidth = newBodyWidth;
        this.leftWidth = newLeftWidth;
        this.rightWidth = newRightWidth;
        this.totalWidth = newBodyWidth + newLeftWidth + newRightWidth;
        this.cellsMoved = false;
        this.refreshCellPositions();

        // `columnContainerWidthChanged` BEFORE `displayedColumnsWidthChanged`: the viewport must resize
        // before the scrollbar updates its visibility, and both are public, so the order is observable.
        const eventSvc = this.eventSvc;
        eventSvc.dispatchEvent({ type: 'columnContainerWidthChanged' });
        eventSvc.dispatchEvent({ type: 'displayedColumnsWidthChanged' });
    }

    /** Body cells and header cells are sized and placed here, once every left and width is set, never by column events. */
    private refreshCellPositions(): void {
        this.rowRenderer.refreshCellPositions();
        this.ctrlsSvc.getHeaderRowContainerCtrl()?.refreshCellPositions();
    }

    /** Each column and group reports how its layout changed since it last did, now that the layout is final: inside
     *  a column update, at its end, after its column events. `null` raises only what the update deferred. */
    public dispatchLayoutEvents(source: ColumnEventType | null): void {
        const colModel = this.colModel;
        if (colModel.colEventsDepth !== 0) {
            this.pendingLayoutSource = source;
            return;
        }
        try {
            colModel.flushColEvents();
        } finally {
            const layoutSource = source ?? this.pendingLayoutSource;
            this.pendingLayoutSource = null;
            if (layoutSource !== null) {
                this.raiseLayoutEvents(layoutSource);
            }
        }
    }

    private raiseLayoutEvents(source: ColumnEventType): void {
        const colModel = this.colModel;
        dispatchColLayoutEvents(colModel.colsList, source);
        // the primary columns are parked out of `colsList` while pivoting, and can still be resized
        if (colModel.showingPivotResult) {
            dispatchColLayoutEvents(colModel.colDefList, source);
        }
        // with no groups the trees hold only columns
        if (colModel.colsTreeDepth !== 0) {
            dispatchGroupLayoutEvents(this.treeLeft);
            dispatchGroupLayoutEvents(this.treeCenter);
            dispatchGroupLayoutEvents(this.treeRight);
        }
    }

    /** Repositions each col's section-relative `left` without rebuilding the displayed set; returns
     *  per-section widths. Lighter sibling of `joinCols`, for resize / autosize / flex. */
    public setLeftValues(): SectionWidths {
        const left = this.setLeftsLeftToRight(this.leftCols);
        const right = this.setLeftsLeftToRight(this.rightCols);
        const center = this.setLeftsLeftToRight(this.centerCols);
        this.setLeftValuesOfGroups();
        return { left, center, right };
    }

    private setLeftValuesOfGroups(): void {
        if (this.colModel.colsTreeDepth !== 0) {
            setGroupLefts(this.treeLeft);
            setGroupLefts(this.treeRight);
            setGroupLefts(this.treeCenter);
        }
    }

    private setPinnedEdges(leftCols: AgColumn[], rightCols: AgColumn[]): void {
        const leftLen = leftCols.length;
        const newLastLeft = leftLen ? leftCols[leftLen - 1] : null;
        let newFirstRight: AgColumn | null = null;
        const rightLen = rightCols.length;
        if (rightLen) {
            newFirstRight = this.gos.get('enableRtl') ? rightCols[rightLen - 1] : rightCols[0];
        }

        const prevLastLeft = this.lastLeftPinnedCol;
        const lastLeftMoved = prevLastLeft !== newLastLeft;
        if (lastLeftMoved) {
            prevLastLeft?.setLastLeftPinned(false);
            newLastLeft?.setLastLeftPinned(true);
            this.lastLeftPinnedCol = newLastLeft;
        }
        const prevFirstRight = this.firstRightPinnedCol;
        const firstRightMoved = prevFirstRight !== newFirstRight;
        if (firstRightMoved) {
            prevFirstRight?.setFirstRightPinned(false);
            newFirstRight?.setFirstRightPinned(true);
            this.firstRightPinnedCol = newFirstRight;
        }
        if (lastLeftMoved || firstRightMoved) {
            const fromLastLeft = lastLeftMoved ? prevLastLeft : null;
            const toLastLeft = lastLeftMoved ? newLastLeft : null;
            const fromFirstRight = firstRightMoved ? prevFirstRight : null;
            const toFirstRight = firstRightMoved ? newFirstRight : null;
            this.rowRenderer.refreshPinnedEdgeCells(fromLastLeft, toLastLeft, fromFirstRight, toFirstRight);
            this.ctrlsSvc
                .getHeaderRowContainerCtrl()
                ?.refreshPinnedEdgeCells(fromLastLeft, toLastLeft, fromFirstRight, toFirstRight);
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

    /** Single pass over `colsList`: filter to displayable cols and bucket by pin, hiding a lone selection col. */
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
        let hasDataCol = false;
        for (let i = 0, len = colsList.length; i < len; ++i) {
            const col = colsList[i];
            const colKind = col.colKind;
            const lane = col.pinnedLane;
            // right cursor derives from total - left - center, so only left/center need counting
            if (lane !== 2) {
                if (lane === 0) {
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
            if (colKind === 'selection' && col.visible && !hasDataCol) {
                pending = col;
                continue;
            }
            if (colKind !== 'selection' && colKind !== 'row-number') {
                hasDataCol = true;
            }
            if (pending !== null && colKind !== 'row-number') {
                const selLane = pending.pinnedLane;
                if (selLane === 2) {
                    rightCols.push(pending);
                } else if (selLane === 0) {
                    leftCols.push(pending);
                } else {
                    centerCols.push(pending);
                }
                pending = null;
            }
            if (lane === 2) {
                rightCols.push(col);
            } else if (lane === 0) {
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
            const prev = prevAll[i];
            prev.allColsIndex = -1;
            prev.colSpanIndex = -1;
            prev.displayed = false;
            prev.left = null;
        }
        this.leftCols = [];
        this.rightCols = [];
        this.centerCols = [];
        this.allCols = [];
        ++this.displayedColsVersion;
        this.autoHeightCols.length = 0;
        this.colSpanColCount = 0;
        this.rowSpanCols.length = 0;
    }

    private stampAriaColIndexes(leftCount: number, centerCount: number): void {
        const cols = this.colModel.colsList;
        // 1-based: the value is consumed directly as `aria-colindex` (no `+1` at read time).
        let leftCursor = 1;
        let centerCursor = leftCount + 1;
        let rightCursor = leftCount + centerCount + 1;
        for (let i = 0, total = cols.length; i < total; ++i) {
            const col = cols[i];
            const lane = col.pinnedLane;
            if (lane === 2) {
                col.ariaColIndex = rightCursor++;
            } else if (lane === 0) {
                col.ariaColIndex = leftCursor++;
            } else {
                col.ariaColIndex = centerCursor++;
            }
        }
    }

    /** One pass over displayed cols: stamps `allColsIndex` (display order; RTL flips sections) and
     *  section-relative `left`, returning per-section widths so {@link layoutBodyWidths} needn't re-sum. */
    private joinCols(): SectionWidths {
        const { leftCols, centerCols, rightCols } = this;
        // `skipTreeBuild` path skips `clear()`, so un-stamp the prior set here; `layoutSection` re-stamps the displayed.
        // Destroy aside, a column leaves the displayed set only here or in `clear`, so only they clear its `left`.
        const prevAll = this.allCols;
        for (let i = 0, len = prevAll.length; i < len; ++i) {
            const prev = prevAll[i];
            prev.allColsIndex = -1;
            prev.colSpanIndex = -1;
            prev.displayed = false;
            prev.left = null;
        }
        const all: AgColumn[] = [];
        this.autoHeightCols.length = 0;
        this.colSpanColCount = 0;
        this.rowSpanCols.length = 0;
        // `layoutSection` accumulates `flexActive` / `headerGroupRowCount` across its three calls — reset them first.
        this.flexActive = false;
        const hidePaddedHeaderRows = !!this.gos.get('hidePaddedHeaderRows');
        this.headerGroupRowCount = hidePaddedHeaderRows ? 0 : this.colModel.colsTreeDepth;

        let leftWidth: number;
        let centerWidth: number;
        let rightWidth: number;
        if (this.gos.get('enableRtl')) {
            rightWidth = this.layoutSection(rightCols, all, hidePaddedHeaderRows);
            centerWidth = this.layoutSection(centerCols, all, hidePaddedHeaderRows);
            leftWidth = this.layoutSection(leftCols, all, hidePaddedHeaderRows);
        } else {
            leftWidth = this.layoutSection(leftCols, all, hidePaddedHeaderRows);
            centerWidth = this.layoutSection(centerCols, all, hidePaddedHeaderRows);
            rightWidth = this.layoutSection(rightCols, all, hidePaddedHeaderRows);
        }

        this.allCols = all;
        ++this.displayedColsVersion;
        return { left: leftWidth, center: centerWidth, right: rightWidth };
    }

    /** Lays one section's cols into `all`: stamps `allColsIndex` + section-relative `left`, folding in the
     *  per-column lists and `flexActive`/`headerGroupRowCount`. A method not a closure, so it allocates nothing. */
    private layoutSection(cols: AgColumn[], all: AgColumn[], hidePaddedHeaderRows: boolean): number {
        const { autoHeightCols, rowSpanCols } = this;
        let left = 0;
        // Leaves under one group are contiguous; skip the parent-chain walk for same-parent runs.
        let lastParent: AgColumnGroup | null = null;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            col.allColsIndex = all.length;
            col.displayed = true;
            col.oldLeft = col.reportedLeft;
            col.left = left;
            all.push(col);
            if (col.colDef.autoHeight) {
                autoHeightCols.push(col);
            }
            if (col.colSpan != null) {
                col.colSpanIndex = this.colSpanColCount;
                ++this.colSpanColCount;
            } else {
                col.colSpanIndex = -1;
            }
            if (col.rowSpan != null) {
                rowSpanCols.push(col);
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

    /** Restamps the lefts from 0, noting a moved one in `cellsMoved`; returns the section width. */
    private setLeftsLeftToRight(cols: AgColumn[]): number {
        let left = 0;
        let moved = false;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            moved ||= col.left !== left;
            col.oldLeft = col.reportedLeft;
            col.left = left;
            left += col.actualWidth;
        }
        this.cellsMoved ||= moved;
        return left;
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

/** Top-down DFS: computes each `group.displayedChildren`, replaced only when it changes, and collects displayed
 *  leaves into `out` in one pass. `parentWithExpansion` carries `columnGroupShow` down (no per-group parent walk). */
const collectLeaves = (
    node: AgColumn | AgColumnGroup,
    parentWithExpansion: AgColumnGroup | null,
    out: AgColumn[]
): void => {
    if (node.isColumn) {
        out.push(node);
        return;
    }
    const myParentWithExpansion = node.isPadding() ? parentWithExpansion : node;
    const provided = myParentWithExpansion?.providedColumnGroup ?? null;
    const expandable = provided?.expandable;

    const oldList = node.displayedChildren;
    const oldLen = oldList?.length ?? 0;
    let newList: (AgColumn | AgColumnGroup)[] | null = null;
    let outLen = 0;
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
                collectLeaves(child, myParentWithExpansion, out);
                if (out.length === startOut) {
                    // Empty group under an expandable parent — exclude.
                    continue;
                }
            } else {
                collectLeaves(child, myParentWithExpansion, out);
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
    if (newList !== null || outLen !== oldLen) {
        // `newList === null` => same prefix but oldList was longer => truncate to `outLen`.
        node.displayedChildren = newList ?? oldList!.slice(0, outLen);
    }
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

const dispatchColLayoutEvents = (cols: AgColumn[], source: ColumnEventType): void => {
    for (let i = 0, len = cols.length; i < len; ++i) {
        const col = cols[i];
        // a listener's own update may have destroyed the rest
        if (col.isAlive()) {
            col.dispatchLayoutEvents(source);
        }
    }
};

const setGroupLefts = (tree: (AgColumn | AgColumnGroup)[]): void => {
    for (let i = 0, len = tree.length; i < len; ++i) {
        const node = tree[i];
        if (isColumnGroup(node)) {
            node.setLeftFromChildren();
        }
    }
};

const dispatchGroupLayoutEvents = (tree: (AgColumn | AgColumnGroup)[]): void => {
    for (let i = 0, len = tree.length; i < len; ++i) {
        const node = tree[i];
        if (isColumnGroup(node)) {
            node.dispatchLayoutEvents();
        }
    }
};
