import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import { _isClientSideRowModel } from '../gridOptionsUtils';
import type { RowPosition } from '../interfaces/iRowPosition';

/** Where the viewport was before a data update, and the rows the user could see, to keep them in view. */
export interface RowsInViewAnchor {
    /** The page pixel at the top of the viewport before the update. */
    viewportTop: number;
    /** The pixel at the top of the rows the user could see before the update, below any sticky rows. */
    firstVisiblePixel: number;
    /** The page's pixel offset before the update. */
    pixelOffset: number;
    /** Whether the viewport was scrolled to the bottom of the rows, to keep it there. */
    atBottom: boolean;
    /** In display order, the rows from a view's height above the rows in view to a view's height below them. */
    rows: RowNode[];
    /** The `rowTop` of each of `rows` before the update. */
    rowTops: number[];
    /** The `rowHeight` of each of `rows` before the update. */
    rowHeights: number[];
    /** The index in `rows` of the first row the user could see. */
    firstInView: number;
    /** The index in `rows` after the last row the user could see. */
    afterView: number;
    /**
     * The groups above the first row in view, with their `rowTop`, for when the update removes a group with every row
     * in view, as a server-side group covers rows that are not loaded.
     */
    groups: [group: RowNode, rowTop: number][];
    /** The index in `rows` of the row whose move the rows in view follow, once restored. */
    followed?: number | null;
    /** The `rowTop` of the followed row and the page pixel at the top of the viewport the latest restore used. */
    restoredAt?: [rowTop: number, viewportTop: number];
    /** The vertical scroll position the latest restore left the viewport at, to tell a scroll elsewhere apart. */
    scrollTop?: number;
}

/** Records where the viewport is, or `null` at the top of the first page, so rows added at the top come into view. */
export function _captureRowsInView(beans: BeanCollection): RowsInViewAnchor | null {
    const { ctrlsSvc, pageBounds, rowContainerHeight, rowModel } = beans;
    const scrollFeature = ctrlsSvc.getScrollFeature();
    // read the viewport itself, as the cached position can lag behind a scroll whose event has not fired yet
    scrollFeature.invalidateVerticalScroll();
    const { top, bottom } = scrollFeature.getVScrollPosition();
    const pixelOffset = pageBounds.getPixelOffset();
    if ((top <= 0 && pixelOffset === 0) || !rowModel.isRowsToRender()) {
        return null;
    }
    rowContainerHeight.updateOffset(); // the height scaling offset follows the scroll position just read
    // within a pixel, as the scroll position can be fractional when zoomed
    const atBottom = top > 0 && top >= scrollFeature.getMaxVScrollPosition() - 1;

    const viewportTop = top + rowContainerHeight.divStretchOffset;
    // rows under the sticky rows are hidden, so rows added or removed there move the rows the user can see
    const firstVisiblePixel = viewportTop + ctrlsSvc.getGridBodyCtrl().stickyTopHeight + pixelOffset;
    const viewportBottom = bottom + rowContainerHeight.divStretchOffset + pixelOffset;
    const rows = getRowsAround(beans, firstVisiblePixel, viewportBottom);
    const rowTops = rows.map(({ rowTop }) => rowTop!);
    const rowHeights = rows.map(({ rowHeight }) => rowHeight!);
    let firstInView = rows.findIndex(({ rowTop, rowHeight }) => rowTop! + rowHeight! > firstVisiblePixel);
    if (firstInView === -1) {
        firstInView = rows.length;
    }
    let afterView = rows.findIndex(({ rowTop }) => rowTop! >= viewportBottom);
    if (afterView === -1) {
        afterView = rows.length;
    }
    return {
        viewportTop,
        firstVisiblePixel,
        pixelOffset,
        atBottom,
        rows,
        rowTops,
        rowHeights,
        firstInView,
        afterView,
        groups: getGroupsAbove(rows[firstInView]),
    };
}

/** The loaded server-side rows by index, read once for each capture of the rows in view. */
let capturedRows: { beans: BeanCollection; byIndex?: Map<number, RowNode> } | null = null;

/**
 * Runs a capture of the rows in view, focus and cell ranges, during which the loaded server-side rows are walked at
 * most once, however many rows it looks up.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _captureWithLoadedRows<T>(beans: BeanCollection, capture: () => T): T {
    const outer = capturedRows;
    capturedRows = { beans };
    try {
        return capture();
    } finally {
        capturedRows = outer;
    }
}

/** The displayed loaded server-side rows by index, expanded detail rows included. */
function getLoadedRowsByIndex(rowModel: BeanCollection['rowModel']): Map<number, RowNode> {
    const byIndex = new Map<number, RowNode>();
    const add = (rowNode: RowNode | undefined) => {
        if (rowNode?.rowIndex != null) {
            byIndex.set(rowNode.rowIndex, rowNode);
        }
    };
    rowModel.forEachDisplayedNode?.((rowNode) => {
        add(rowNode);
        if (rowNode.master && rowNode.expanded) {
            add(rowNode.detailNode);
        }
    });
    return byIndex;
}

/**
 * In display order, the loaded rows from the first index to the last. The client-side row model reads them by index.
 * The server-side row model creates the rows it reads by index that are not loaded, and finds one by index by scanning
 * its loaded rows, so its loaded rows are walked instead, once for each capture.
 */
function getLoadedRows(beans: BeanCollection, first: number, last: number): RowNode[] {
    const { gos, rowModel } = beans;
    const rows: RowNode[] = [];
    if (_isClientSideRowModel(gos)) {
        for (let i = first; i <= last; ++i) {
            const rowNode = rowModel.getRow(i);
            if (rowNode) {
                rows.push(rowNode);
            }
        }
        return rows;
    }
    let byIndex: Map<number, RowNode>;
    if (capturedRows?.beans === beans) {
        byIndex = capturedRows.byIndex ??= getLoadedRowsByIndex(rowModel);
    } else {
        byIndex = getLoadedRowsByIndex(rowModel);
    }
    for (let i = first; i <= last; ++i) {
        const rowNode = byIndex.get(i);
        if (rowNode) {
            rows.push(rowNode);
        }
    }
    return rows;
}

const isPositioned = (rowNode: RowNode): boolean =>
    !rowNode.rowPinned && rowNode.rowTop != null && rowNode.rowHeight != null && rowNode.rowIndex != null;

/**
 * In display order, the loaded rows in view and within a viewport height of it, so the rows outside the view are
 * followed when the update removes or reorders every row in view. They are read from the row model, as the rendered
 * rows can be those of a scroll position not yet redrawn, or every row when row virtualisation is suppressed, and the
 * row buffer can be empty.
 */
function getRowsAround(beans: BeanCollection, firstVisiblePixel: number, viewportBottom: number): RowNode[] {
    const { pageBounds, rowModel } = beans;
    const margin = viewportBottom - firstVisiblePixel;
    const first = Math.max(
        rowModel.getRowIndexAtPixel(Math.max(0, firstVisiblePixel - margin)),
        pageBounds.getFirstRow()
    );
    const last = Math.min(rowModel.getRowIndexAtPixel(viewportBottom + margin), pageBounds.getLastRow());
    return getLoadedRows(beans, first, last).filter(isPositioned);
}

function getGroupsAbove(rowNode: RowNode | undefined): [group: RowNode, rowTop: number][] {
    const groups: [group: RowNode, rowTop: number][] = [];
    for (let parent = rowNode?.parent; parent?.rowTop != null; parent = parent.parent) {
        groups.push([parent, parent.rowTop]);
    }
    return groups;
}

/** The height from the outermost group removed above the first row in view to the first visible pixel. */
function getRemovedGroupHeight(beans: BeanCollection, anchor: RowsInViewAnchor): number {
    let removedTop: number | null = null;
    for (const [group, rowTop] of anchor.groups) {
        if (!isDisplayed(beans, group)) {
            removedTop = rowTop;
        }
    }
    return removedTop == null ? 0 : Math.max(0, anchor.firstVisiblePixel - removedTop);
}

/** The height of the rows the update removed from above the first visible pixel, counting overlapping ranges once. */
function getRemovedHeight(anchor: RowsInViewAnchor, isKept: boolean[]): number {
    const { rows, rowTops, rowHeights, firstVisiblePixel } = anchor;
    const removed: [top: number, bottom: number][] = [];
    for (let i = 0; i < rows.length && rowTops[i] <= firstVisiblePixel; ++i) {
        if (!isKept[i]) {
            removed.push([rowTops[i], rowTops[i] + rowHeights[i]]);
        }
    }
    let removedHeight = 0;
    let removedBottom = -Infinity;
    for (const [top, bottom] of removed.sort((a, b) => a[0] - b[0])) {
        removedHeight += Math.max(0, bottom - Math.max(top, removedBottom));
        removedBottom = Math.max(removedBottom, bottom);
    }
    return removedHeight;
}

/** For each of the `values` in turn, the length of the longest increasing subsequence ending with it, by patience sorting. */
function getLongestEndingAt(values: number[]): number[] {
    const tails: number[] = [];
    return values.map((value) => {
        let low = 0;
        let high = tails.length;
        while (low < high) {
            const mid = (low + high) >> 1;
            if (tails[mid] < value) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        tails[low] = value;
        return low + 1;
    });
}

/** The indexes of the `values` in every longest increasing subsequence of them: those that kept their order. */
function getKeptInOrder(values: number[]): number[] {
    const longestEndingAt = getLongestEndingAt(values);
    // the longest starting at each value is the longest ending at it, read backwards with the order reversed
    const longestStartingAt = getLongestEndingAt(values.map((value) => -value).reverse()).reverse();
    const longest = longestEndingAt.reduce((max, value) => Math.max(max, value), 0);
    const inLongest = values.flatMap((_, i) => (longestEndingAt[i] + longestStartingAt[i] - 1 === longest ? [i] : []));
    // a value is in every longest sequence when no other value can take its place in one
    const countAtPlace = new Map<number, number>();
    for (const i of inLongest) {
        countAtPlace.set(longestEndingAt[i], (countAtPlace.get(longestEndingAt[i]) ?? 0) + 1);
    }
    return inLongest.filter((i) => countAtPlace.get(longestEndingAt[i]) === 1);
}

/** The top row in view that kept its order, else the nearest kept in order below the view, then above it. */
function getFollowedRow(anchor: RowsInViewAnchor, isKept: boolean[]): number | null {
    const { rows, firstInView, afterView } = anchor;
    const kept = rows.flatMap((_, i) => (isKept[i] ? [i] : []));
    const keptInOrder = (candidates: number[]) =>
        getKeptInOrder(candidates.map((i) => rows[i].rowIndex!)).map((i) => candidates[i]);
    // a view sorted elsewhere as a whole would otherwise be outnumbered by the rows below it
    const near = kept.filter((i) => i >= firstInView - 1 && i <= afterView);
    const outside = keptInOrder(kept).filter((i) => i < firstInView || i >= afterView);
    return (
        keptInOrder(near).find((i) => i >= firstInView && i < afterView) ??
        outside.find((i) => i >= afterView) ??
        outside.pop() ??
        null
    );
}

/** How far the rows in view moved, or `null` when the update kept none of the rows captured. */
function getRowsInViewMoved(anchor: RowsInViewAnchor, isKept: boolean[]): number | null {
    const { rows, rowTops, rowHeights, firstVisiblePixel } = anchor;
    const followed = getFollowedRow(anchor, isKept);
    anchor.followed = followed;
    if (followed == null) {
        return null;
    }
    const rowTop = rows[followed].rowTop!;
    let moved = rowTop - rowTops[followed];
    for (let i = 0; i < rows.length; ++i) {
        if (i < followed) {
            // left from between the first visible pixel and the followed row, so filled by the rows after them
            const left = !isKept[i] || rows[i].rowTop! >= rowTop;
            if (left && rowTops[i] > firstVisiblePixel) {
                moved += rowHeights[i];
            }
        } else if (i > followed) {
            // left from between a followed row above the view and the first visible pixel, so removed above the view
            const left = !isKept[i] || rows[i].rowTop! <= rowTop;
            if (left && rowTops[i] <= firstVisiblePixel) {
                moved -= rowHeights[i];
            }
        }
    }
    return moved;
}

/** Whether a row recorded before a data update is still displayed after it. */
function isDisplayed(beans: BeanCollection, rowNode: RowNode | undefined): rowNode is RowNode & { rowIndex: number } {
    if (!rowNode || rowNode.destroyed || rowNode.rowIndex == null) {
        return false;
    }
    // a server-side row removed is destroyed, and one hidden under a collapsed group has no index
    return !_isClientSideRowModel(beans.gos) || beans.rowModel.getRow(rowNode.rowIndex) === rowNode;
}

/**
 * Records the row at a position before a data update, returning how to find its index after it, or `undefined` once
 * the row is removed.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _followRow(beans: BeanCollection, { rowIndex, rowPinned }: RowPosition): () => number | undefined {
    if (rowPinned) {
        return () => rowIndex;
    }
    const [rowNode] = getLoadedRows(beans, rowIndex, rowIndex);
    return () => (isDisplayed(beans, rowNode) ? rowNode.rowIndex : undefined);
}

/** The vertical scroll position that keeps the rows the user could see where they were. */
function getScrollTopForRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): number {
    // a loading row counts as kept, as it is still there
    const isKept = anchor.rows.map((rowNode) => isDisplayed(beans, rowNode) && rowNode.rowTop != null);
    const rowsInViewMoved =
        getRowsInViewMoved(anchor, isKept) ??
        -Math.max(getRemovedHeight(anchor, isKept), getRemovedGroupHeight(beans, anchor));
    // with pagination, rows added or removed before the page also move where the page starts
    const pixelOffsetChange = beans.pageBounds.getPixelOffset() - anchor.pixelOffset;
    const viewportTop = anchor.viewportTop + rowsInViewMoved - pixelOffsetChange;
    const { followed, rows } = anchor;
    const rowTop = followed == null ? null : rows[followed].rowTop;
    anchor.restoredAt = rowTop == null ? undefined : [rowTop, viewportTop];
    return beans.rowContainerHeight.getScrollPositionForPixel(viewportTop);
}

/** Scrolls so the rows the user could see stay where they were, or to the bottom if it was there. True if it scrolled. */
export function _restoreRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): boolean {
    // compared even when nothing was added or removed, as a change in height scaling can move the rows on screen
    const scrollFeature = beans.ctrlsSvc.getScrollFeature();
    return scrollRowsInView(
        beans,
        anchor,
        anchor.atBottom ? scrollFeature.getMaxVScrollPosition() : getScrollTopForRowsInView(beans, anchor)
    );
}

/**
 * Scrolls by how far the followed row moved since the latest restore, as heights worked out since can move it, or
 * back to the bottom. True if it scrolled.
 */
export function _correctRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): boolean {
    if (anchor.atBottom) {
        return scrollRowsInView(beans, anchor, beans.ctrlsSvc.getScrollFeature().getMaxVScrollPosition());
    }
    const { followed, rows, restoredAt } = anchor;
    const rowTop = followed == null ? null : rows[followed].rowTop;
    if (rowTop == null || !restoredAt || rowTop === restoredAt[0]) {
        return false;
    }
    const viewportTop = restoredAt[1] + rowTop - restoredAt[0];
    anchor.restoredAt = [rowTop, viewportTop];
    return scrollRowsInView(beans, anchor, beans.rowContainerHeight.getScrollPositionForPixel(viewportTop));
}

function scrollRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor, scrollTop: number): boolean {
    const scrollFeature = beans.ctrlsSvc.getScrollFeature();
    // the capture read the viewport, and setting the position invalidates the cache, so the cache is current here
    const previousScrollTop = scrollFeature.getVScrollPosition().top;
    if (scrollTop !== previousScrollTop) {
        scrollFeature.setVerticalScrollPosition(scrollTop);
    }
    anchor.scrollTop = scrollFeature.getVScrollPosition().top;
    // false when the viewport cannot scroll that far, so the caller stops retrying
    return anchor.scrollTop !== previousScrollTop;
}
