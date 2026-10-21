import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type { IRowModel } from '../interfaces/iRowModel';
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
    /**
     * In display order, the rows displayed before the update from a view's height above the rows the user could see to
     * a view's height below them.
     */
    rows: RowNode[];
    /** The `rowTop` of each of `rows` before the update. */
    rowTops: number[];
    /** The `rowHeight` of each of `rows` before the update. */
    rowHeights: number[];
    /** The index in `rows` of the first row the user could see. */
    firstInView: number;
    /** The index in `rows` after the last row the user could see. */
    afterView: number;
    /** The pixel ranges of the rows the update removed from above the first visible pixel, which can overlap. */
    removed: [top: number, bottom: number][];
    /** The height `removed` covers, worked out once as the restore can be repeated. */
    removedHeight?: number;
    /** The vertical scroll position the latest restore left the viewport at, to tell a scroll elsewhere apart. */
    scrollTop?: number;
}

/**
 * Records where the viewport is, or returns `null` when there is nothing to keep in view. A grid scrolled to its top,
 * at the top of the first page, is not anchored, so rows added at the top come into view. A grid scrolled to the bottom
 * of its rows, and not also at the top, is kept at the bottom, so rows added at the end come into view.
 */
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
    const rows: RowNode[] = [];
    const rowTops: number[] = [];
    const rowHeights: number[] = [];
    const firstRow = pageBounds.getFirstRow();
    const lastRow = pageBounds.getLastRow();
    // the rows outside the view are followed when the update removes or reorders every row in view
    const viewHeight = viewportBottom - firstVisiblePixel;
    const firstIndexInView = Math.max(rowModel.getRowIndexAtPixel(firstVisiblePixel), firstRow);
    let firstInView = 0;
    let afterView = -1;
    for (let i = Math.max(rowModel.getRowIndexAtPixel(firstVisiblePixel - viewHeight), firstRow); i <= lastRow; ++i) {
        const rowNode = rowModel.getRow(i);
        if (rowNode?.rowTop == null || rowNode.rowHeight == null) {
            continue;
        }
        if (i < firstIndexInView) {
            firstInView = rows.length + 1;
        } else if (rows.length > firstInView) {
            if (rowNode.rowTop >= viewportBottom + viewHeight) {
                break;
            }
            if (afterView === -1 && rowNode.rowTop >= viewportBottom) {
                afterView = rows.length;
            }
        }
        rows.push(rowNode);
        rowTops.push(rowNode.rowTop);
        rowHeights.push(rowNode.rowHeight);
    }
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
        removed: [],
    };
}

/**
 * Records a row the update removed, before it loses its position, for when the update removes every row in view. A row
 * starting at the first visible pixel counts as above it. Pinned rows are positioned in their own containers.
 */
export function _recordRemovedRow(anchor: RowsInViewAnchor, rowNode: RowNode): void {
    const { rowTop, rowHeight } = rowNode;
    const { firstVisiblePixel, removed } = anchor;
    if (rowNode.rowPinned) {
        return;
    }
    if (rowTop != null && rowHeight != null && rowTop <= firstVisiblePixel) {
        removed.push([rowTop, rowTop + rowHeight]);
    }
    const storeRange = getStoreRange(rowNode);
    if (storeRange && storeRange[0] < firstVisiblePixel) {
        removed.push([storeRange[0], Math.min(storeRange[1], firstVisiblePixel)]);
    }
}

/**
 * The pixel range of the rows of a server-side group, which counts its rows that are not loaded, as they have no row
 * nodes. Its rows can be displayed while the group itself is hidden, such as an unbalanced group.
 */
function getStoreRange({ childStore }: RowNode): [top: number, bottom: number] | null {
    if (childStore?.getDisplayIndexStart() == null) {
        return null;
    }
    const { topPx, heightPx } = childStore.getStoreBounds();
    return [topPx, topPx + heightPx];
}

/** The height of the rows the update removed from above the first visible pixel, counting overlapping ranges once. */
function getRemovedHeight(anchor: RowsInViewAnchor): number {
    if (anchor.removedHeight == null) {
        let removedHeight = 0;
        let removedBottom = -Infinity;
        for (const [top, bottom] of anchor.removed.sort((a, b) => a[0] - b[0])) {
            removedHeight += Math.max(0, bottom - Math.max(top, removedBottom));
            removedBottom = Math.max(removedBottom, bottom);
        }
        anchor.removedHeight = removedHeight;
    }
    return anchor.removedHeight;
}

/**
 * The indexes of the `values` in every longest sequence of them, not necessarily adjacent, that is in increasing order.
 * These are the values that kept their order, leaving out values that could swap places with others in the sequence.
 */
function getKeptInOrder(values: number[]): number[] {
    const longestEndingAt = values.map(() => 1);
    const longestStartingAt = values.map(() => 1);
    for (let i = 0; i < values.length; ++i) {
        for (let j = 0; j < i; ++j) {
            if (values[j] < values[i]) {
                longestEndingAt[i] = Math.max(longestEndingAt[i], longestEndingAt[j] + 1);
            }
        }
    }
    for (let i = values.length - 1; i >= 0; --i) {
        for (let j = i + 1; j < values.length; ++j) {
            if (values[i] < values[j]) {
                longestStartingAt[i] = Math.max(longestStartingAt[i], longestStartingAt[j] + 1);
            }
        }
    }
    const longest = Math.max(0, ...longestEndingAt);
    const inLongest = values.flatMap((_, i) => (longestEndingAt[i] + longestStartingAt[i] - 1 === longest ? [i] : []));
    // a value is in every longest sequence when no other value can take its place in one
    const countAtPlace = new Map<number, number>();
    for (const i of inLongest) {
        countAtPlace.set(longestEndingAt[i], (countAtPlace.get(longestEndingAt[i]) ?? 0) + 1);
    }
    return inLongest.filter((i) => countAtPlace.get(longestEndingAt[i]) === 1);
}

/**
 * How far the rows in view moved, or `null` when the update kept none of the rows captured. The top row in view that
 * kept its order, among the rows in view and the rows just outside them, is followed, so rows an update sorts
 * elsewhere, or reorders among themselves, count as having left the view, and rows added below it move only the rows
 * below them. With no row in view kept in order, the nearest row below the view that kept its order among all the
 * rows kept is followed, then the nearest above it. Rows in view that left from below the first visible pixel,
 * removed or moved below the followed row, are left for the rows after them to fill, and rows that left from between a
 * followed row above the view and the first visible pixel count as removed above the view.
 */
function getRowsInViewMoved(beans: BeanCollection, anchor: RowsInViewAnchor): number | null {
    const { rows, rowTops, rowHeights, firstInView, afterView, firstVisiblePixel } = anchor;
    const { rowModel } = beans;
    // a loading row counts as kept, as it is still there
    const isKept = rows.map((rowNode) => isDisplayed(rowModel, rowNode) && rowNode.rowTop != null);
    const kept = rows.flatMap((_, i) => (isKept[i] ? [i] : []));
    const keptInOrder = (candidates: number[]) =>
        getKeptInOrder(candidates.map((i) => rows[i].rowIndex!)).map((i) => candidates[i]);
    // the rows far from the view take no part in the order of the rows in view, as a view sorted elsewhere as a whole
    // would be as long as the rows below it
    const near = kept.filter((i) => i >= firstInView - 1 && i <= afterView);
    const outside = keptInOrder(kept).filter((i) => i < firstInView || i >= afterView);
    const followed =
        keptInOrder(near).find((i) => i >= firstInView && i < afterView) ??
        outside.find((i) => i >= afterView) ??
        outside.pop();
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
function isDisplayed(rowModel: IRowModel, rowNode: RowNode | undefined): rowNode is RowNode & { rowIndex: number } {
    return !!rowNode && !rowNode.destroyed && rowNode.rowIndex != null && rowModel.getRow(rowNode.rowIndex) === rowNode;
}

/**
 * Records the row at a position before a data update, returning how to find the index of that row after the update.
 * A position whose row the update removed keeps its index, within the rows left, as without following. Pinned rows
 * keep their index, as data updates do not move them.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _followRow(beans: BeanCollection, { rowIndex, rowPinned }: RowPosition): () => number {
    const { rowModel } = beans;
    if (rowPinned) {
        return () => rowIndex;
    }
    const rowNode = rowModel.getRow(rowIndex);
    return () => {
        if (isDisplayed(rowModel, rowNode)) {
            return rowNode.rowIndex;
        }
        const lastIndex = rowModel.getRowCount() - 1;
        return lastIndex < 0 ? rowIndex : Math.min(rowIndex, lastIndex);
    };
}

/** The vertical scroll position that keeps the rows the user could see where they were. */
function getScrollTopForRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): number {
    const rowsInViewMoved = getRowsInViewMoved(beans, anchor) ?? -getRemovedHeight(anchor);
    // with pagination, rows added or removed before the page also move where the page starts
    const pixelOffsetChange = beans.pageBounds.getPixelOffset() - anchor.pixelOffset;
    const viewportTop = anchor.viewportTop + rowsInViewMoved - pixelOffsetChange;
    return beans.rowContainerHeight.getScrollPositionForPixel(viewportTop);
}

/**
 * Scrolls by how far the rows the user could see moved, so they stay where they were, whether the update added,
 * removed, sorted or filtered the rows above them. With every row in view removed, scrolls by the height of the rows
 * removed above them instead. A viewport at the bottom of the rows scrolls to their new bottom. Returns `true` if the
 * grid scrolled.
 */
export function _restoreRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): boolean {
    // compared even when nothing was added or removed, as a change in height scaling can move the rows on screen
    const scrollFeature = beans.ctrlsSvc.getScrollFeature();
    const scrollTop = anchor.atBottom
        ? scrollFeature.getMaxVScrollPosition()
        : getScrollTopForRowsInView(beans, anchor);
    // the capture read the viewport, and setting the position invalidates the cache, so the cache is current here
    const previousScrollTop = scrollFeature.getVScrollPosition().top;
    anchor.scrollTop = previousScrollTop;
    if (scrollTop === previousScrollTop) {
        return false;
    }
    scrollFeature.setVerticalScrollPosition(scrollTop);
    anchor.scrollTop = scrollFeature.getVScrollPosition().top;
    // false when the viewport cannot scroll that far, so the caller stops retrying
    return anchor.scrollTop !== previousScrollTop;
}
