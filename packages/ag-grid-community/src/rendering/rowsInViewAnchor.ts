import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';

/** Where the viewport was before a data update, and the rows the user could see, to keep them in view. */
export interface RowsInViewAnchor {
    /** The page pixel at the top of the viewport before the update. */
    viewportTop: number;
    /** The pixel at the top of the rows the user could see before the update, below any sticky rows. */
    firstVisiblePixel: number;
    /** The page's pixel offset before the update. */
    pixelOffset: number;
    /** In display order, the rows the user could see before the update. */
    rowsInView: RowNode[];
    /** The `rowTop` of each of `rowsInView` before the update. */
    rowTopsInView: number[];
    /** The `rowHeight` of each of `rowsInView` before the update. */
    rowHeightsInView: number[];
    /** The pixel ranges of the rows the update removed from above the first visible pixel, which can overlap. */
    removed: [top: number, bottom: number][];
    /** The height `removed` covers, worked out once as the restore can be repeated. */
    removedHeight?: number;
}

/**
 * Records where the viewport is, or returns `null` when there is nothing to keep in view. A grid scrolled to its top,
 * at the top of the first page, is not anchored, so rows added at the top come into view.
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

    const viewportTop = top + rowContainerHeight.divStretchOffset;
    // rows under the sticky rows are hidden, so rows added or removed there move the rows the user can see
    const firstVisiblePixel = viewportTop + ctrlsSvc.getGridBodyCtrl().stickyTopHeight + pixelOffset;
    const viewportBottom = bottom + rowContainerHeight.divStretchOffset + pixelOffset;
    const rowsInView: RowNode[] = [];
    const rowTopsInView: number[] = [];
    const rowHeightsInView: number[] = [];
    const lastRow = pageBounds.getLastRow();
    for (
        let i = Math.max(rowModel.getRowIndexAtPixel(firstVisiblePixel), pageBounds.getFirstRow());
        i <= lastRow;
        ++i
    ) {
        const rowNode = rowModel.getRow(i);
        if (rowNode?.rowTop == null || rowNode.rowHeight == null) {
            continue;
        }
        if (rowsInView.length && rowNode.rowTop >= viewportBottom) {
            break;
        }
        rowsInView.push(rowNode);
        rowTopsInView.push(rowNode.rowTop);
        rowHeightsInView.push(rowNode.rowHeight);
    }
    return { viewportTop, firstVisiblePixel, pixelOffset, rowsInView, rowTopsInView, rowHeightsInView, removed: [] };
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

/** The indexes of the longest sequence of `values`, not necessarily adjacent, that is in increasing order. */
function getLongestIncreasing(values: number[]): number[] {
    const lengths: number[] = [];
    const previous: number[] = [];
    let last = -1;
    for (let i = 0; i < values.length; ++i) {
        lengths.push(1);
        previous.push(-1);
        for (let j = 0; j < i; ++j) {
            if (values[j] < values[i] && lengths[j] + 1 > lengths[i]) {
                lengths[i] = lengths[j] + 1;
                previous[i] = j;
            }
        }
        if (last === -1 || lengths[i] > lengths[last]) {
            last = i;
        }
    }
    const indexes: number[] = [];
    for (let i = last; i !== -1; i = previous[i]) {
        indexes.push(i);
    }
    return indexes.reverse();
}

/**
 * How far the rows in view moved, or `null` when the update kept none of them. Only the rows that kept their order
 * are followed, so rows an update sorts elsewhere count as having left the view. Rows in view that left from below
 * the first visible pixel, removed or moved below a row, are left for the rows after them to fill, and rows added
 * between rows in view move only the rows below them, so the first rows that moved together are followed.
 */
function getRowsInViewMoved(beans: BeanCollection, anchor: RowsInViewAnchor): number | null {
    const { rowsInView, rowTopsInView, rowHeightsInView, firstVisiblePixel } = anchor;
    const { rowModel } = beans;
    // a loading row in view counts as kept, as it is still there
    const isKept = rowsInView.map(
        ({ destroyed, rowIndex, rowTop }, i) =>
            !destroyed && rowIndex != null && rowTop != null && rowModel.getRow(rowIndex) === rowsInView[i]
    );
    const kept = rowsInView.flatMap((_, i) => (isKept[i] ? [i] : []));
    const inOrder = getLongestIncreasing(kept.map((i) => rowsInView[i].rowIndex!)).map((i) => kept[i]);
    const moves = inOrder.map((i) => {
        const rowTop = rowsInView[i].rowTop!;
        let move = rowTop - rowTopsInView[i];
        for (let j = 0; j < i; ++j) {
            const leftAbove = !isKept[j] || rowsInView[j].rowTop! >= rowTop;
            if (leftAbove && rowTopsInView[j] > firstVisiblePixel) {
                move += rowHeightsInView[j];
            }
        }
        return move;
    });
    if (!moves.length) {
        return null;
    }
    // with no rows moving together, such as when the rows in view resolve their heights, the top row is followed
    const firstMovedTogether = moves.findIndex((move, i) => move === moves[i + 1]);
    return moves[Math.max(firstMovedTogether, 0)];
}

/**
 * Scrolls by how far the rows the user could see moved, so they stay where they were, whether the update added,
 * removed, sorted or filtered the rows above them. With every row in view removed, scrolls by the height of the rows
 * removed above them instead. Returns `true` if the grid scrolled.
 */
export function _restoreRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): boolean {
    const rowsInViewMoved = getRowsInViewMoved(beans, anchor) ?? -getRemovedHeight(anchor);
    // with pagination, rows added or removed before the page also move where the page starts
    const pixelOffsetChange = beans.pageBounds.getPixelOffset() - anchor.pixelOffset;
    const viewportTop = anchor.viewportTop + rowsInViewMoved - pixelOffsetChange;

    // compared even when nothing was added or removed, as a change in height scaling can move the rows on screen
    const scrollFeature = beans.ctrlsSvc.getScrollFeature();
    const scrollTop = beans.rowContainerHeight.getScrollPositionForPixel(viewportTop);
    // the capture read the viewport, and setting the position invalidates the cache, so the cache is current here
    const previousScrollTop = scrollFeature.getVScrollPosition().top;
    if (scrollTop === previousScrollTop) {
        return false;
    }
    scrollFeature.setVerticalScrollPosition(scrollTop);
    // false when the viewport cannot scroll that far, so the caller stops retrying
    return scrollFeature.getVScrollPosition().top !== previousScrollTop;
}
