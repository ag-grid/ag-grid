import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';

interface SampledRow {
    rowNode: RowNode;
    /** The row's top relative to the current page before the update. Only set on the rows in view. */
    pageTop?: number;
}

/** The rows in view before a data update, used to keep them in view after it. */
export interface RowsInViewAnchor {
    /** The page pixel at the top of the viewport before the update. */
    viewportTop: number;
    /** In display order: the rows in view, and rows sampled above and below them. */
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
        rowsInView.push({ rowNode, pageTop });
    }
    if (!rowsInView.length) {
        return null;
    }

    // twice as many rows either side as are in view, so rows in view re-sorted together, with any rows that were next
    // to them, have to outnumber the rows they leave behind to be followed
    const window = 2 * rowsInView.length;
    const rowsAbove = sampleRows(beans, firstRow - 1, pageFirstRow, -1, window);
    const rowsBelow = sampleRows(beans, belowRow, pageLastRow, 1, window);
    return { viewportTop, rows: [...rowsAbove.reverse(), ...rowsInView, ...rowsBelow] };
}

/**
 * Samples every row for `window` rows from `start`, then rows at doubling distances, going in `direction` up to and
 * including `end`.
 */
function sampleRows(
    beans: BeanCollection,
    start: number,
    end: number,
    direction: 1 | -1,
    window: number
): SampledRow[] {
    const rows: SampledRow[] = [];
    const count = (end - start) * direction + 1;
    for (let distance = 0; distance < count; distance = distance < window ? distance + 1 : distance * 2) {
        const rowNode = beans.rowModel.getRow(start + distance * direction);
        if (rowNode) {
            rows.push({ rowNode });
        }
    }
    return rows;
}

/** The row's index if it is still displayed, as a row that was removed can keep a stale one. */
function getDisplayedIndex(beans: BeanCollection, rowNode: RowNode): number | null {
    const rowIndex = rowNode.rowIndex;
    return rowIndex != null && rowNode.rowTop != null && beans.rowModel.getRow(rowIndex) === rowNode ? rowIndex : null;
}

/**
 * Whether each row is in every largest set of rows still in their previous order, given their indexes now in their
 * previous order.
 */
function getAlwaysOrderedRows(indexes: number[]): boolean[] {
    const len = indexes.length;
    const ranks = new Map([...indexes].sort((a, b) => a - b).map((index, rank) => [index, rank]));
    // the longest ordered sets ending at, and starting from, each row
    const ending = getLongestOrderedEnding(indexes.map((index) => ranks.get(index)!));
    const starting = getLongestOrderedEnding(indexes.map((index) => len - 1 - ranks.get(index)!).reverse()).reverse();
    const longest = Math.max(...ending);
    const inLongest = ending.map((length, i) => length + starting[i] - 1 === longest);
    // a row is in every largest set when no other row in one can take its place in the set
    const rowsAtPlace = new Array<number>(longest + 1).fill(0);
    for (let i = 0; i < len; ++i) {
        if (inLongest[i]) {
            ++rowsAtPlace[ending[i]];
        }
    }
    return inLongest.map((inSet, i) => inSet && rowsAtPlace[ending[i]] === 1);
}

/** The length of the longest increasing run of ranks ending at each rank, in O(n log n) with a max Fenwick tree. */
function getLongestOrderedEnding(ranks: number[]): number[] {
    const tree = new Array<number>(ranks.length + 1).fill(0);
    return ranks.map((rank) => {
        let before = 0;
        for (let i = rank; i > 0; i -= i & -i) {
            before = Math.max(before, tree[i]);
        }
        const length = before + 1;
        for (let i = rank + 1; i < tree.length; i += i & -i) {
            tree[i] = Math.max(tree[i], length);
        }
        return length;
    });
}

/**
 * Scrolls by however far the rows in view have moved, so they stay where they were in the viewport, then anchors to
 * the row it followed where that row is now. Returns `true` if the grid scrolled.
 *
 * Rows only move together, keeping their order, when rows are added or removed above them, while rows an update
 * re-sorts change their order. So the largest set of sampled rows still in their previous order is taken as the rows
 * that did not move on their own, and the first row in view that is in every such set is followed.
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
    if (!rows.length) {
        return false;
    }
    const alwaysOrdered = getAlwaysOrderedRows(indexes);
    const followed = rows.find(({ pageTop }, i) => pageTop != null && alwaysOrdered[i]);
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
    if (scrollTop === previousScrollTop) {
        return false;
    }
    scrollFeature.setVerticalScrollPosition(scrollTop);
    // false when the viewport cannot scroll that far, so the caller stops retrying. This read is the one rendering
    // the rows would make anyway.
    return scrollFeature.getVScrollPosition().top !== previousScrollTop;
}
