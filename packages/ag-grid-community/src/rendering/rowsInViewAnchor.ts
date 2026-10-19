import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';

interface SampledRow {
    rowNode: RowNode;
    /** How many rows this row stands for when working out which rows kept their order. */
    weight: number;
    /** The row's top relative to the current page before the update. Only set on the rows in view. */
    pageTop?: number;
}

/** The rows in view before a data update, used to keep them in view after it. */
export interface RowsInViewAnchor {
    /** The page pixel at the top of the viewport before the update. */
    viewportTop: number;
    /**
     * In display order: the rows in view, and rows at doubling distances above and below them, each standing for the
     * rows between it and the previous sample.
     */
    rows: SampledRow[];
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
    const pageFirstRow = pageBounds.getFirstRow();
    const pageLastRow = pageBounds.getLastRow();
    const firstRow = Math.max(rowModel.getRowIndexAtPixel(firstVisiblePixel + pixelOffset), pageFirstRow);
    const rowsInView: SampledRow[] = [];
    let belowRow = pageLastRow + 1;
    for (let i = firstRow; i <= pageLastRow; ++i) {
        const rowNode = rowModel.getRow(i);
        if (rowNode?.rowTop == null) {
            continue;
        }
        const pageTop = rowNode.rowTop - pixelOffset;
        if (rowsInView.length && pageTop >= viewportBottom) {
            belowRow = i;
            break;
        }
        rowsInView.push({ rowNode, weight: 1, pageTop });
    }
    if (!rowsInView.length) {
        return null;
    }

    const rowsAbove = sampleRows(beans, firstRow - 1, pageFirstRow, -1);
    const rowsBelow = sampleRows(beans, belowRow, pageLastRow, 1);
    return { viewportTop, rows: [...rowsAbove.reverse(), ...rowsInView, ...rowsBelow] };
}

/** Samples rows at doubling distances from `start`, going in `direction` up to and including `end`. */
function sampleRows(beans: BeanCollection, start: number, end: number, direction: 1 | -1): SampledRow[] {
    const rows: SampledRow[] = [];
    const count = (end - start) * direction + 1;
    let sampled = 0;
    for (let distance = 0; distance < count; distance = distance * 2 || 1) {
        const rowNode = beans.rowModel.getRow(start + distance * direction);
        if (rowNode) {
            rows.push({ rowNode, weight: distance + 1 - sampled });
            sampled = distance + 1;
        }
    }
    if (rows.length) {
        rows[rows.length - 1].weight += count - sampled; // the farthest sample also stands for the rest of the page
    }
    return rows;
}

/** The row's index if it is still displayed, as a row that was removed can keep a stale one. */
function getDisplayedIndex(beans: BeanCollection, rowNode: RowNode): number | null {
    const rowIndex = rowNode.rowIndex;
    return rowIndex != null && rowNode.rowTop != null && beans.rowModel.getRow(rowIndex) === rowNode ? rowIndex : null;
}

/**
 * The heaviest set of rows that are still in their previous order, as weights ending at and starting from each row.
 * `excluded` leaves one row out.
 */
function getHeaviestOrderedRows(
    indexes: number[],
    weights: number[],
    excluded = -1
): { ending: number[]; starting: number[]; best: number } {
    const len = indexes.length;
    const ending: number[] = new Array(len).fill(0);
    const starting: number[] = new Array(len).fill(0);
    let best = 0;
    for (let i = 0; i < len; ++i) {
        if (i === excluded) {
            continue;
        }
        let before = 0;
        for (let j = 0; j < i; ++j) {
            if (j !== excluded && indexes[j] < indexes[i]) {
                before = Math.max(before, ending[j]);
            }
        }
        ending[i] = before + weights[i];
        best = Math.max(best, ending[i]);
    }
    for (let i = len - 1; i >= 0; --i) {
        if (i === excluded) {
            continue;
        }
        let after = 0;
        for (let j = i + 1; j < len; ++j) {
            if (j !== excluded && indexes[j] > indexes[i]) {
                after = Math.max(after, starting[j]);
            }
        }
        starting[i] = after + weights[i];
    }
    return { ending, starting, best };
}

/**
 * Scrolls by however far the rows in view have moved, so they stay where they were in the viewport, then anchors to
 * the row it followed where that row is now. Returns `true` if the grid scrolled.
 *
 * Rows only move together, keeping their order, when rows are added or removed above them, while rows an update
 * re-sorts change their order. So the heaviest set of sampled rows still in their previous order is taken as the
 * rows that did not move on their own, and the first row in view that is in every such set is followed.
 */
export function _restoreRowsInView(beans: BeanCollection, anchor: RowsInViewAnchor): boolean {
    const { ctrlsSvc, pageBounds, rowContainerHeight } = beans;
    const firstRow = pageBounds.getFirstRow();
    const lastRow = pageBounds.getLastRow();
    const rows: SampledRow[] = [];
    const indexes: number[] = [];
    for (const row of anchor.rows) {
        const rowIndex = getDisplayedIndex(beans, row.rowNode);
        // skips rows removed or moved off the page
        if (rowIndex != null && rowIndex >= firstRow && rowIndex <= lastRow) {
            rows.push(row);
            indexes.push(rowIndex);
        }
    }
    const weights = rows.map((row) => row.weight);
    const { ending, starting, best } = getHeaviestOrderedRows(indexes, weights);
    const followed = rows.find(
        ({ pageTop, weight }, i) =>
            pageTop != null &&
            ending[i] + starting[i] - weight === best &&
            getHeaviestOrderedRows(indexes, weights, i).best < best
    );
    if (!followed) {
        return false;
    }

    const newPageTop = followed.rowNode.rowTop! - pageBounds.getPixelOffset();
    anchor.viewportTop += newPageTop - followed.pageTop!;
    anchor.rows = [{ ...followed, pageTop: newPageTop }];
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
