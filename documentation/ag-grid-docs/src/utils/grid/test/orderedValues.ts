import type { Page } from '@playwright/test';

/**
 * Read a column's rendered values in top-to-bottom display order (by row-index).
 *
 * Read in a single evaluate call: per-row awaits race virtualisation, hang on rows detached
 * mid-read, and cost one round-trip per cell, which alone can exhaust a test's budget when
 * called from inside a retry loop.
 */
export function orderedValues(page: Page, colId: string): Promise<string[]> {
    return page.evaluate((colId) => {
        const seen = new Map<number, string>();
        const rows = document.querySelectorAll('.ag-row[row-index]');
        for (let i = 0, len = rows.length; i < len; ++i) {
            const row = rows[i];
            const idxAttr = row.getAttribute('row-index');
            if (idxAttr == null) {
                continue;
            }
            const idx = Number(idxAttr);
            if (seen.has(idx)) {
                continue;
            }
            const cell = row.querySelector(`[col-id="${colId}"]`);
            if (!cell) {
                continue;
            }
            seen.set(idx, (cell.textContent ?? '').trim());
        }
        return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
    }, colId);
}
