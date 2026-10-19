import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type { VerticalScrollPosition } from '../interfaces/iRowNode';

interface AnchorRow {
    rowNode: RowNode;
    /** The row's top, relative to the current page, before the update. */
    pageTop: number;
}

/** The rows in view before a data update, in display order, used to keep them in view after it. */
export interface RowsInViewAnchor {
    rows: AnchorRow[];
}

/** Reads the viewport itself, as a cached position can lag behind a scroll whose event has not fired yet. */
function getLiveVScrollPosition(beans: BeanCollection): VerticalScrollPosition {
    const scrollFeature = beans.ctrlsSvc.getScrollFeature();
    scrollFeature.invalidateVerticalScroll();
    return scrollFeature.getVScrollPosition();
}

/**
 * Records the rows in view, or returns `null` when there is nothing to keep in view. A grid scrolled to the top is
 * not anchored, so rows added at the top come into view.
 */
export function _captureRowsInView(beans: BeanCollection): RowsInViewAnchor | null {
    const { pageBounds, rowContainerHeight, rowModel } = beans;
    const { top, bottom } = getLiveVScrollPosition(beans);
    if (top <= 0 || !rowModel.isRowsToRender()) {
        return null;
    }

    const pixelOffset = pageBounds.getPixelOffset();
    const viewportTop = top + rowContainerHeight.divStretchOffset;
    const viewportBottom = bottom + rowContainerHeight.divStretchOffset;
    const firstRow = Math.max(rowModel.getRowIndexAtPixel(viewportTop + pixelOffset), pageBounds.getFirstRow());
    const lastRow = pageBounds.getLastRow();
    const rows: AnchorRow[] = [];
    for (let i = firstRow; i <= lastRow; ++i) {
        const rowNode = rowModel.getRow(i);
        if (rowNode?.rowTop == null) {
            continue;
        }
        const pageTop = rowNode.rowTop - pixelOffset;
        if (rows.length && pageTop >= viewportBottom) {
            break;
        }
        rows.push({ rowNode, pageTop });
    }
    return rows.length ? { rows } : null;
}

/**
 * Scrolls by however far the rows in view have moved, so they stay where they were in the viewport, then anchors to
 * the row it followed where that row is now. Returns `true` if the grid scrolled.
 *
 * Follows the first row still on the page that moved as far as the next one, as rows only move together when rows
 * were added or removed above them; a row that moved on its own, such as one re-sorted by an update, is not followed.
 */
export function _restoreRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): boolean {
    const { ctrlsSvc, pageBounds, rowContainerHeight, rowModel } = beans;
    const firstRow = pageBounds.getFirstRow();
    const lastRow = pageBounds.getLastRow();
    const pixelOffset = pageBounds.getPixelOffset();
    const movedRows: { rowNode: RowNode; pageTop: number; shift: number }[] = [];
    for (const { rowNode, pageTop } of anchor.rows) {
        const { rowIndex, rowTop } = rowNode;
        const displayed = rowIndex != null && rowTop != null && rowModel.getRow(rowIndex) === rowNode;
        if (displayed && rowIndex >= firstRow && rowIndex <= lastRow) {
            const newPageTop = rowTop - pixelOffset;
            movedRows.push({ rowNode, pageTop: newPageTop, shift: newPageTop - pageTop });
        }
    }
    if (!movedRows.length) {
        return false; // Removed, or moved off the page
    }

    const followed = movedRows.find((row, i) => row.shift === movedRows[i + 1]?.shift) ?? movedRows[0];
    anchor.rows = [{ rowNode: followed.rowNode, pageTop: followed.pageTop }];
    if (followed.shift === 0) {
        return false;
    }
    const { top } = getLiveVScrollPosition(beans);
    const viewportTop = top + rowContainerHeight.divStretchOffset + followed.shift;
    ctrlsSvc.getScrollFeature().setVerticalScrollPosition(rowContainerHeight.getScrollPositionForPixel(viewportTop));
    return true;
}
