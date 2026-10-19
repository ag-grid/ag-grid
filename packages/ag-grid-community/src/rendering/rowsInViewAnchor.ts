import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import { _getNextRowNodeObjectId } from '../entities/rowNode';

interface CapturedRow {
    rowNode: RowNode;
    /** The row's height before the update, as a removed row can lose it. */
    rowHeight: number;
}

/** The rows in view before a data update, used to keep them in view after it. */
export interface RowsInViewAnchor {
    /** The page pixel at the top of the viewport before the update. */
    viewportTop: number;
    /** Rows created from here on were added by the update. */
    firstNewObjectId: number;
    /** In display order, the rows on the page from its first row to the last row in view. */
    rows: CapturedRow[];
    /** The position in `rows` of the first row in view. */
    firstRowInView: number;
}

/**
 * Records the rows in view and the rows above them, or returns `null` when there is nothing to keep in view. A grid
 * scrolled to the top is not anchored, so rows added at the top come into view.
 */
export function _captureRowsInView(beans: BeanCollection): RowsInViewAnchor | null {
    const { ctrlsSvc, pageBounds, rowContainerHeight, rowModel } = beans;
    const scrollFeature = ctrlsSvc.getScrollFeature();
    // read the viewport itself, as the cached position can lag behind a scroll whose event has not fired yet
    scrollFeature.invalidateVerticalScroll();
    const { top, bottom } = scrollFeature.getVScrollPosition();
    if (top <= 0 || !rowModel.isRowsToRender()) {
        return null;
    }
    rowContainerHeight.updateOffset(); // the height scaling offset follows the scroll position just read

    const pixelOffset = pageBounds.getPixelOffset();
    const viewportTop = top + rowContainerHeight.divStretchOffset;
    const viewportBottom = bottom + rowContainerHeight.divStretchOffset + pixelOffset;
    // rows under the sticky rows are hidden, so cannot be kept in view
    const firstVisiblePixel = viewportTop + ctrlsSvc.getGridBodyCtrl().stickyTopHeight + pixelOffset;
    const pageFirstRow = pageBounds.getFirstRow();
    const pageLastRow = pageBounds.getLastRow();
    const firstRowInView = Math.max(rowModel.getRowIndexAtPixel(firstVisiblePixel), pageFirstRow);
    const rows: CapturedRow[] = [];
    let firstInView = -1;
    for (let i = pageFirstRow; i <= pageLastRow; ++i) {
        const rowNode = rowModel.getRow(i);
        if (rowNode?.rowTop == null || rowNode.rowHeight == null) {
            continue;
        }
        if (i >= firstRowInView) {
            if (firstInView >= 0 && rowNode.rowTop >= viewportBottom) {
                break;
            }
            if (firstInView < 0) {
                firstInView = rows.length;
            }
        }
        rows.push({ rowNode, rowHeight: rowNode.rowHeight });
    }
    if (firstInView < 0) {
        return null;
    }
    return { viewportTop, firstNewObjectId: _getNextRowNodeObjectId(), rows, firstRowInView: firstInView };
}

/** The row's index if it is still displayed on the page, as a row that was removed can keep a stale one. */
function getIndexOnPage(beans: BeanCollection, rowNode: RowNode): number | null {
    const { pageBounds, rowModel } = beans;
    const rowIndex = rowNode.rowIndex;
    if (rowIndex == null || rowNode.rowTop == null || rowModel.getRow(rowIndex) !== rowNode) {
        return null;
    }
    return rowIndex >= pageBounds.getFirstRow() && rowIndex <= pageBounds.getLastRow() ? rowIndex : null;
}

/**
 * Scrolls by the height of the rows added above the first row in view still displayed, less the height of the rows
 * removed above it, so the rows in view stay where they were. Rows that only moved, such as rows an update re-sorts
 * or filters, do not scroll the grid. Returns `true` if the grid scrolled.
 */
export function _restoreRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): boolean {
    const { ctrlsSvc, pageBounds, rowContainerHeight, rowModel } = beans;
    const { rows, firstRowInView, firstNewObjectId } = anchor;
    let anchorPosition = -1;
    let anchorIndex: number | null = null;
    for (let i = firstRowInView; i < rows.length && anchorIndex == null; ++i) {
        anchorIndex = rows[i].rowNode.destroyed ? null : getIndexOnPage(beans, rows[i].rowNode);
        anchorPosition = i;
    }
    if (anchorIndex == null) {
        return false;
    }

    let shift = 0;
    for (let i = 0; i < anchorPosition; ++i) {
        if (rows[i].rowNode.destroyed) {
            shift -= rows[i].rowHeight;
        }
    }
    for (let i = pageBounds.getFirstRow(); i < anchorIndex; ++i) {
        const rowNode = rowModel.getRow(i);
        if (rowNode && rowNode.__objectId >= firstNewObjectId) {
            shift += rowNode.rowHeight ?? 0;
        }
    }

    // compared even when nothing was added or removed, as a change in height scaling can move the rows on screen
    const scrollFeature = ctrlsSvc.getScrollFeature();
    const scrollTop = rowContainerHeight.getScrollPositionForPixel(anchor.viewportTop + shift);
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
