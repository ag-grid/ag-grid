import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';

interface AnchorRow {
    rowNode: RowNode;
    /** The row's top, relative to the current page, before the update. */
    pageTop: number;
}

/** The rows in view before a data update, in display order, used to keep them in view after it. */
export interface RowsInViewAnchor {
    /** The page pixel at the top of the viewport before the update. */
    viewportTop: number;
    rows: AnchorRow[];
    /**
     * Rows above and below the rows in view, at doubling distances from them. They stay either side of the rows in
     * view unless those rows were re-sorted past them.
     */
    rowsAbove: RowNode[];
    rowsBelow: RowNode[];
}

/** The row's index if it is still displayed, as a row that was removed can keep a stale one. */
function getDisplayedIndex(beans: BeanCollection, rowNode: RowNode): number | null {
    const rowIndex = rowNode.rowIndex;
    return rowIndex != null && rowNode.rowTop != null && beans.rowModel.getRow(rowIndex) === rowNode ? rowIndex : null;
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
    const viewportBottom = bottom + rowContainerHeight.divStretchOffset;
    // rows under the sticky rows are hidden, so cannot be kept in view
    const firstVisiblePixel = viewportTop + ctrlsSvc.getGridBodyCtrl().stickyTopHeight;
    const firstRow = Math.max(rowModel.getRowIndexAtPixel(firstVisiblePixel + pixelOffset), pageBounds.getFirstRow());
    const lastRow = pageBounds.getLastRow();
    const rows: AnchorRow[] = [];
    let belowRow = lastRow + 1;
    for (let i = firstRow; i <= lastRow; ++i) {
        const rowNode = rowModel.getRow(i);
        if (rowNode?.rowTop == null) {
            continue;
        }
        const pageTop = rowNode.rowTop - pixelOffset;
        if (rows.length && pageTop >= viewportBottom) {
            belowRow = i;
            break;
        }
        rows.push({ rowNode, pageTop });
    }
    if (!rows.length) {
        return null;
    }
    const rowsAbove: RowNode[] = [];
    const rowsBelow: RowNode[] = [];
    for (let distance = 1; firstRow - distance >= pageBounds.getFirstRow(); distance *= 2) {
        pushRow(rowsAbove, rowModel.getRow(firstRow - distance));
    }
    for (let distance = 0; belowRow + distance <= lastRow; distance = distance * 2 || 1) {
        pushRow(rowsBelow, rowModel.getRow(belowRow + distance));
    }
    return { viewportTop, rows, rowsAbove, rowsBelow };
}

function pushRow(rows: RowNode[], rowNode: RowNode | undefined): void {
    if (rowNode) {
        rows.push(rowNode);
    }
}

/**
 * Scrolls by however far the rows in view have moved, so they stay where they were in the viewport, then anchors to
 * the row it followed where that row is now. Returns `true` if the grid scrolled.
 *
 * Follows the first row still on the page that moved as far as the next one and is still between the rows that were
 * above and below the rows in view. Rows only move together, and keep those rows either side of them, when rows were
 * added or removed above them; rows that moved because an update re-sorted them are not followed.
 */
export function _restoreRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): boolean {
    const { ctrlsSvc, pageBounds, rowContainerHeight } = beans;
    const firstRow = pageBounds.getFirstRow();
    const lastRow = pageBounds.getLastRow();
    const pixelOffset = pageBounds.getPixelOffset();
    let aboveIndex = -1;
    for (const rowNode of anchor.rowsAbove) {
        aboveIndex = Math.max(aboveIndex, getDisplayedIndex(beans, rowNode) ?? -1);
    }
    let belowIndex = Infinity;
    for (const rowNode of anchor.rowsBelow) {
        belowIndex = Math.min(belowIndex, getDisplayedIndex(beans, rowNode) ?? Infinity);
    }
    const movedRows: { rowNode: RowNode; pageTop: number; shift: number }[] = [];
    for (const { rowNode, pageTop } of anchor.rows) {
        const rowIndex = getDisplayedIndex(beans, rowNode);
        // skips rows removed, moved off the page, or re-sorted past the rows either side of the rows in view
        if (
            rowIndex != null &&
            rowIndex >= firstRow &&
            rowIndex <= lastRow &&
            rowIndex > aboveIndex &&
            rowIndex < belowIndex
        ) {
            const newPageTop = rowNode.rowTop! - pixelOffset;
            movedRows.push({ rowNode, pageTop: newPageTop, shift: newPageTop - pageTop });
        }
    }
    if (!movedRows.length) {
        return false;
    }

    const followed = movedRows.find((row, i) => row.shift === movedRows[i + 1]?.shift) ?? movedRows[0];
    anchor.rows = [{ rowNode: followed.rowNode, pageTop: followed.pageTop }];
    anchor.viewportTop += followed.shift;
    // compared even when the row did not move, as a change in height scaling can move it on screen
    const scrollFeature = ctrlsSvc.getScrollFeature();
    const scrollTop = rowContainerHeight.getScrollPositionForPixel(anchor.viewportTop);
    // the capture read the viewport, and setting the position invalidates the cache, so the cache is current here
    const previousScrollTop = scrollFeature.getVScrollPosition().top;
    if (Math.abs(scrollTop - previousScrollTop) < 1) {
        return false;
    }
    scrollFeature.setVerticalScrollPosition(scrollTop);
    // false when the viewport cannot scroll that far, so the caller stops retrying. This read is the one rendering
    // the rows would make anyway.
    return scrollFeature.getVScrollPosition().top !== previousScrollTop;
}
