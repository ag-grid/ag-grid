type PageNumberItem = number | 'ellipsis';

// Above this many pages the truncated form (first … current±1 … last) is shorter than
// listing every page, so ellipses only start appearing once the count exceeds it.
const MAX_PAGES_WITHOUT_ELLIPSIS = 5;

// Pages shown around (and including) the current page while in the middle of the range.
const PAGE_WINDOW_SIZE = 3;

// While the current page sits within this many pages of either end, the window expands to a fixed
// block anchored to that end, so the first/last pages read `1 2 3 4 5 … N` / `1 … N-4 … N`.
const EDGE_BLOCK_SIZE = 5;

// Turns a sorted list of page numbers into display items, collapsing a single-page gap to that
// page and a wider gap to a non-interactive ellipsis.
function pagesToItems(sortedPages: number[]): PageNumberItem[] {
    const items: PageNumberItem[] = [];
    for (let i = 0, len = sortedPages.length; i < len; ++i) {
        const current = sortedPages[i];
        if (i > 0) {
            const gap = current - sortedPages[i - 1];
            if (gap === 2) {
                items.push(current - 1);
            } else if (gap > 2) {
                items.push('ellipsis');
            }
        }
        items.push(current);
    }
    return items;
}

/**
 * Builds the displayed page items for a 0-based `currentPage` and `totalPages` count.
 * Always keeps the first page plus a constant-width window around the current page. When the last
 * page is known it also pins the last page and collapses gaps with an ellipsis; when it is not yet
 * known (row count still loading) it never pins a concrete last page and ends with a trailing
 * ellipsis instead. The current page is clamped into range so transient out-of-range pagination
 * state cannot produce buttons beyond the available pages.
 */
export function _getPageNumberItems(
    currentPage: number,
    totalPages: number,
    isLastPageKnown: boolean
): PageNumberItem[] {
    const safeTotal = Math.max(totalPages, 1);
    const page = Math.min(Math.max(currentPage + 1, 1), safeTotal);

    if (!isLastPageKnown) {
        const pages = new Set<number>([1]);
        const start = Math.max(page - Math.floor(PAGE_WINDOW_SIZE / 2), 1);
        for (let i = 0; i < PAGE_WINDOW_SIZE; ++i) {
            const p = start + i;
            if (p <= safeTotal) {
                pages.add(p);
            }
        }
        const items = pagesToItems([...pages].sort((a, b) => a - b));
        items.push('ellipsis');
        return items;
    }

    if (totalPages <= 1) {
        return [1];
    }

    if (totalPages <= MAX_PAGES_WITHOUT_ELLIPSIS) {
        const allPages: PageNumberItem[] = [];
        for (let p = 1; p <= totalPages; ++p) {
            allPages.push(p);
        }
        return allPages;
    }

    const nearStart = page <= EDGE_BLOCK_SIZE - 1;
    const nearEnd = page >= totalPages - (EDGE_BLOCK_SIZE - 2);

    let windowStart: number;
    let windowSize: number;
    if (nearStart) {
        windowStart = 1;
        windowSize = EDGE_BLOCK_SIZE;
    } else if (nearEnd) {
        windowStart = totalPages - EDGE_BLOCK_SIZE + 1;
        windowSize = EDGE_BLOCK_SIZE;
    } else {
        windowStart = page - Math.floor(PAGE_WINDOW_SIZE / 2);
        windowSize = PAGE_WINDOW_SIZE;
    }

    const pages = new Set<number>([1, totalPages]);
    for (let i = 0; i < windowSize; ++i) {
        pages.add(windowStart + i);
    }

    return pagesToItems([...pages].sort((a, b) => a - b));
}
