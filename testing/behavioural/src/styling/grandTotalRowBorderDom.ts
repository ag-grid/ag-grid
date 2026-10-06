const CONTAINERS = {
    pinnedTop: 'ag-grid-pinned-top-rows-container',
    stickyTop: 'ag-grid-sticky-top-rows-container',
    scrolling: 'ag-grid-scrolling-container',
    stickyBottom: 'ag-grid-sticky-bottom-rows-container',
    pinnedBottom: 'ag-grid-pinned-bottom-rows-container',
};

function describeRow(row: Element): string | null {
    const { classList } = row;
    if (classList.contains('ag-row-grand-total')) {
        if (classList.contains('ag-row-grand-total-border-top')) {
            return 'TOTAL border-top';
        }
        return classList.contains('ag-row-grand-total-border-bottom') ? 'TOTAL border-bottom' : 'TOTAL';
    }
    return classList.contains('ag-row-before-grand-total-border') ? `${row.getAttribute('row-id')} above-total` : null;
}

/**
 * Summarises the grand total border classes per row container, listing only rows that carry one. A container key
 * gets an ` (at edge)` suffix when it has `ag-row-container-grand-total-at-edge`; containers with nothing to report
 * are omitted.
 */
export function grandTotalBorders(root: HTMLElement): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const [name, className] of Object.entries(CONTAINERS)) {
        const container = root.querySelector(`.${className}`);
        if (!container) {
            continue;
        }
        const rows: string[] = [];
        for (const row of Array.from(container.querySelectorAll('.ag-row'))) {
            const description = describeRow(row);
            if (description) {
                rows.push(description);
            }
        }
        const atEdge = container.classList.contains('ag-row-container-grand-total-at-edge');
        if (rows.length || atEdge) {
            result[atEdge ? `${name} (at edge)` : name] = rows;
        }
    }
    return result;
}
