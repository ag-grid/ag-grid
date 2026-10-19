import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';

interface RowPosition {
    /** The row's top before the update. */
    rowTop: number;
    /** The row's height before the update. */
    rowHeight: number;
}

/** The rows in view before a data update, and the rows the update adds and removes, to keep them in view after it. */
export interface RowsInViewAnchor {
    /** The page pixel at the top of the viewport before the update. */
    viewportTop: number;
    /** The first row on the page before the update. */
    pageFirstRow: number;
    /** In display order, the rows in view, with their tops before the update. */
    rowsInView: (RowPosition & { rowNode: RowNode })[];
    /** The rows the update created. */
    added: RowNode[];
    /** The rows on the page that the update removed. */
    removed: RowPosition[];
}

/**
 * Records the rows in view, or returns `null` when there is nothing to keep in view. A grid scrolled to the top is
 * not anchored, so rows added at the top come into view.
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
    const rowsInView: RowsInViewAnchor['rowsInView'] = [];
    for (let i = Math.max(rowModel.getRowIndexAtPixel(firstVisiblePixel), pageFirstRow); i <= pageLastRow; ++i) {
        const rowNode = rowModel.getRow(i);
        const { rowTop, rowHeight } = rowNode ?? {};
        if (rowTop == null || rowHeight == null) {
            continue;
        }
        if (rowsInView.length && rowTop >= viewportBottom) {
            break;
        }
        rowsInView.push({ rowNode: rowNode!, rowTop, rowHeight });
    }
    if (!rowsInView.length) {
        return null;
    }
    return { viewportTop, pageFirstRow, rowsInView, added: [], removed: [] };
}

/** Records a row the update removed, before it loses its position. */
export function _recordRemovedRow(anchor: RowsInViewAnchor, rowNode: RowNode): void {
    const { rowIndex, rowTop, rowHeight } = rowNode;
    if (rowIndex != null && rowIndex >= anchor.pageFirstRow && rowTop != null && rowHeight != null) {
        anchor.removed.push({ rowTop, rowHeight });
    }
}

/** The row's index if it is still displayed on the page, as a row that was removed can keep a stale one. */
function getIndexOnPage(beans: BeanCollection, rowNode: RowNode): number | null {
    const { pageBounds, rowModel } = beans;
    const rowIndex = rowNode.rowIndex;
    if (rowNode.destroyed || rowIndex == null || rowNode.rowTop == null || rowModel.getRow(rowIndex) !== rowNode) {
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
    let anchorTop = 0;
    let anchorIndex: number | null = null;
    for (const { rowNode, rowTop } of anchor.rowsInView) {
        anchorIndex = getIndexOnPage(beans, rowNode);
        if (anchorIndex != null) {
            anchorTop = rowTop;
            break;
        }
    }
    if (anchorIndex == null) {
        return false;
    }

    let shift = 0;
    for (const rowNode of anchor.added) {
        const rowIndex = rowNode.stub ? null : getIndexOnPage(beans, rowNode);
        if (rowIndex != null && rowIndex < anchorIndex) {
            shift += rowNode.rowHeight ?? 0;
        }
    }
    for (const { rowTop, rowHeight } of anchor.removed) {
        if (rowTop < anchorTop) {
            shift -= rowHeight;
        }
    }

    // compared even when nothing was added or removed, as a change in height scaling can move the rows on screen
    const scrollFeature = beans.ctrlsSvc.getScrollFeature();
    const scrollTop = beans.rowContainerHeight.getScrollPositionForPixel(anchor.viewportTop + shift);
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
