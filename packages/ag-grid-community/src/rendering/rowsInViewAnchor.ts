import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';

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
    /** The rows the update created. */
    added: RowNode[];
    /** The height of the rows the update removed from above the first visible pixel. */
    removedHeight: number;
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
    }
    return { viewportTop, firstVisiblePixel, pixelOffset, rowsInView, added: [], removedHeight: 0 };
}

/**
 * Records a row the update removed, before it loses its position. A row starting at the first visible pixel counts
 * as above it, so the rows after it stay where they were. Pinned rows are positioned in their own containers.
 */
export function _recordRemovedRow(anchor: RowsInViewAnchor, rowNode: RowNode): void {
    const { rowTop, rowHeight } = rowNode;
    if (!rowNode.rowPinned && rowTop != null && rowHeight != null && rowTop <= anchor.firstVisiblePixel) {
        anchor.removedHeight += rowHeight;
    }
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
 * Scrolls by the height of the rows the update added above the rows the user could see, less the height of the rows
 * it removed from above them, so the rows in view stay where they were. Rows that only moved, such as rows an update
 * re-sorts or filters, do not scroll the grid. Returns `true` if the grid scrolled.
 */
export function _restoreRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): boolean {
    const { firstVisiblePixel, removedHeight } = anchor;
    const added = anchor.added.filter((rowNode) => isDisplayed(beans, rowNode));
    added.sort((a, b) => a.rowIndex! - b.rowIndex!);
    // added rows are above the rows the user could see when they come before the first of those rows still displayed,
    // so rows that other rows moved past, by sorting or filtering, do not change which added rows count
    const firstRowInView = anchor.rowsInView.find((rowNode) => isDisplayed(beans, rowNode));
    // with every row in view removed, they are above it when the rows that were above those rows are all above them
    const keptHeight = firstVisiblePixel - removedHeight;
    let addedHeight = 0;
    for (const { rowIndex, rowTop, rowHeight } of added) {
        if (firstRowInView ? rowIndex! > firstRowInView.rowIndex! : rowTop! > keptHeight + addedHeight) {
            break;
        }
        addedHeight += rowHeight!;
    }
    // with pagination, rows added or removed before the page also move where the page starts
    const pixelOffsetChange = beans.pageBounds.getPixelOffset() - anchor.pixelOffset;
    const viewportTop = anchor.viewportTop + addedHeight - removedHeight - pixelOffsetChange;

    // compared even when nothing was added or removed, as a change in height scaling can move the rows on screen
    const scrollFeature = beans.ctrlsSvc.getScrollFeature();
    const scrollTop = beans.rowContainerHeight.getScrollPositionForPixel(viewportTop);
    // the capture read the viewport, and setting the position invalidates the cache, so the cache is current here
    const previousScrollTop = scrollFeature.getVScrollPosition().top;
    if (scrollTop === previousScrollTop) {
        return false;
    }
    scrollFeature.setVerticalScrollPosition(scrollTop);
    // false when the viewport cannot scroll that far, so the caller stops retrying. This read is the one rendering
    // the rows would make anyway.
    return scrollFeature.getVScrollPosition().top !== previousScrollTop;
}
