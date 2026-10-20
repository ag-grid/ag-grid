import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import { _isClientSideRowModel } from '../gridOptionsUtils';

/** Where the viewport was before a data update, and the rows the update adds and removes, to keep the rows in view. */
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
    /** The rows the update created. */
    added: RowNode[];
    /** The pixel ranges of the rows the update removed from above the first visible pixel, which can overlap. */
    removed: [top: number, bottom: number][];
    /** The height `removed` covers, worked out once as the restore can be repeated. */
    removedHeight?: number;
    /** Set when the update sorted server-side rows on the client, which moves rows without adding or removing them. */
    sorted?: boolean;
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
    const lastRow = pageBounds.getLastRow();
    for (
        let i = Math.max(rowModel.getRowIndexAtPixel(firstVisiblePixel), pageBounds.getFirstRow());
        i <= lastRow;
        ++i
    ) {
        const rowNode = rowModel.getRow(i);
        if (rowNode?.rowTop == null) {
            continue;
        }
        if (rowsInView.length && rowNode.rowTop >= viewportBottom) {
            break;
        }
        rowsInView.push(rowNode);
        rowTopsInView.push(rowNode.rowTop);
    }
    return { viewportTop, firstVisiblePixel, pixelOffset, rowsInView, rowTopsInView, added: [], removed: [] };
}

/**
 * Records a row the update removed, before it loses its position. A row starting at the first visible pixel counts
 * as above it, so the rows after it stay where they were. Pinned rows are positioned in their own containers.
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

/**
 * The height the pixel ranges cover, counting overlapping ranges once. With `getBottom`, stops at the first range
 * starting below the pixel it returns for the height covered so far.
 */
function getCoveredHeight(ranges: [top: number, bottom: number][], getBottom?: (height: number) => number): number {
    let height = 0;
    let coveredBottom = -Infinity;
    for (const [top, bottom] of ranges.sort((a, b) => a[0] - b[0])) {
        if (getBottom && top > getBottom(height)) {
            break;
        }
        height += Math.max(0, bottom - Math.max(top, coveredBottom));
        coveredBottom = Math.max(coveredBottom, bottom);
    }
    return height;
}

/** The height of the rows the update removed from above the first visible pixel. */
function getRemovedHeight(anchor: RowsInViewAnchor): number {
    return (anchor.removedHeight ??= getCoveredHeight(anchor.removed));
}

function isDisplayed(beans: BeanCollection, rowNode: RowNode): boolean {
    const { rowIndex } = rowNode;
    // a stub stands in for a row that is not loaded yet, rather than one the update added
    return (
        !rowNode.destroyed &&
        !rowNode.stub &&
        rowIndex != null &&
        rowNode.rowTop != null &&
        beans.rowModel.getRow(rowIndex) === rowNode
    );
}

/**
 * The pixel ranges of the rows the update added, read again on each restore, as working out the rows to render can
 * resolve their heights.
 */
function getAddedRanges(beans: BeanCollection, anchor: RowsInViewAnchor): [top: number, bottom: number][] {
    const ranges: [top: number, bottom: number][] = [];
    for (const rowNode of anchor.added) {
        if (isDisplayed(beans, rowNode)) {
            // possibly an estimate, but the rows in view moved by this height; the caller restores again if it resolves
            ranges.push([rowNode.rowTop!, rowNode.rowTop! + rowNode.rowHeight!]);
        }
        const storeRange = !rowNode.destroyed && getStoreRange(rowNode);
        if (storeRange) {
            ranges.push(storeRange);
        }
    }
    return ranges;
}

/** The height of the rows the update added above the rows the user could see. */
function getAddedHeightAbove(beans: BeanCollection, anchor: RowsInViewAnchor): number {
    const firstRowInView = anchor.rowsInView.find((rowNode) => isDisplayed(beans, rowNode));
    const added = getAddedRanges(beans, anchor);
    if (firstRowInView) {
        // the boundary is the first row in view still displayed, at its new position even when the update sorted it there
        const boundary = firstRowInView.rowTop!;
        return getCoveredHeight(added.filter(([top]) => top < boundary));
    }
    // with every row in view removed, they are above it when the rows that were above those rows are all above them
    const keptHeight = anchor.firstVisiblePixel - getRemovedHeight(anchor);
    return getCoveredHeight(added, (addedHeight) => keptHeight + addedHeight);
}

/**
 * How far the first row in view the update kept moved, less the rows in view it removed from below the first visible
 * pixel, which are left for the rows after them to fill. For server-side rows the update did not sort on the client,
 * this counts every row added or removed above, including rows that are not loaded or that the cache evicted.
 */
function getFirstRowInViewMoved(beans: BeanCollection, anchor: RowsInViewAnchor): number {
    const { rowsInView, rowTopsInView, firstVisiblePixel } = anchor;
    // a loading row in view counts as kept, as it is still there
    const keptIndex = rowsInView.findIndex(
        (rowNode) =>
            !rowNode.destroyed && rowNode.rowIndex != null && beans.rowModel.getRow(rowNode.rowIndex) === rowNode
    );
    if (keptIndex === -1) {
        return getAddedHeightAbove(beans, anchor) - getRemovedHeight(anchor);
    }
    const keptTop = rowTopsInView[keptIndex];
    const removedInViewTop = rowTopsInView.slice(0, keptIndex).find((rowTop) => rowTop > firstVisiblePixel);
    return rowsInView[keptIndex].rowTop! - keptTop + (removedInViewTop == null ? 0 : keptTop - removedInViewTop);
}

/**
 * Scrolls by the height of the rows the update added above the rows the user could see, less the height of the rows
 * it removed from above them, so the rows in view stay where they were. Rows that only moved, such as rows an update
 * re-sorts or filters, do not scroll the grid. Returns `true` if the grid scrolled.
 */
export function _restoreRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): boolean {
    // server-side rows sorted on the client are loaded, or in the stores of the groups added or removed, so are counted
    // as client-side rows are
    const rowsInViewMoved =
        _isClientSideRowModel(beans.gos) || anchor.sorted
            ? getAddedHeightAbove(beans, anchor) - getRemovedHeight(anchor)
            : getFirstRowInViewMoved(beans, anchor);
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
