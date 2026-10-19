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
}

/**
 * Records the rows in view, or returns `null` when there is nothing to keep in view. A grid scrolled to the top is
 * not anchored, so rows added at the top come into view.
 */
export function _captureRowsInView(beans: BeanCollection): RowsInViewAnchor | null {
    const { ctrlsSvc, pageBounds, rowContainerHeight, rowModel } = beans;
    const { top, bottom } = ctrlsSvc.getScrollFeature().getVScrollPosition();
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
    return rows.length ? { viewportTop, rows } : null;
}

/**
 * Scrolls by however far the first anchored row still displayed on the page has moved, so it stays where it was in
 * the viewport, then anchors to that row where it is now. Returns `true` if the grid scrolled.
 */
export function _restoreRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): boolean {
    const { ctrlsSvc, pageBounds, rowContainerHeight, rowModel } = beans;
    const firstRow = pageBounds.getFirstRow();
    const lastRow = pageBounds.getLastRow();
    for (const { rowNode, pageTop } of anchor.rows) {
        const { rowIndex, rowTop } = rowNode;
        const displayed = rowIndex != null && rowTop != null && rowModel.getRow(rowIndex) === rowNode;
        if (!displayed || rowIndex < firstRow || rowIndex > lastRow) {
            continue; // Removed, or moved off the page
        }
        const newPageTop = rowTop - pageBounds.getPixelOffset();
        const shift = newPageTop - pageTop;
        anchor.rows = [{ rowNode, pageTop: newPageTop }];
        if (shift === 0) {
            return false;
        }
        anchor.viewportTop += shift;
        ctrlsSvc
            .getScrollFeature()
            .setVerticalScrollPosition(rowContainerHeight.getScrollPositionForPixel(anchor.viewportTop));
        return true;
    }
    return false;
}
