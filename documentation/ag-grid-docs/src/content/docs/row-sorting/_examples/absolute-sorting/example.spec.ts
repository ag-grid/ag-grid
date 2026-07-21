import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

// Read a column's rendered values in top-to-bottom display order (by row-index).
async function orderedValues(page: Page, colId: string): Promise<string[]> {
    const rows = await page.locator('.ag-row[row-index]').all();
    const seen = new Map<number, string>();
    for (let i = 0, len = rows.length; i < len; ++i) {
        const row = rows[i];
        const idxAttr = await row.getAttribute('row-index');
        if (idxAttr == null) {
            continue;
        }
        const idx = Number(idxAttr);
        if (seen.has(idx)) {
            continue;
        }
        const cell = row.locator(`[col-id="${colId}"]`);
        if ((await cell.count()) === 0) {
            continue;
        }
        seen.set(idx, ((await cell.first().innerText()) ?? '').trim());
    }
    return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

test.agExample(import.meta, () => {
    test.eachFramework('Loads sorted by absolute value ascending', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // rankingChange has sort { direction: 'asc', type: 'absolute' } configured on load.
        await expect(agIdFor.headerCell('rankingChange').locator('.ag-sort-absolute-ascending-icon')).toBeVisible();

        await expect(async () => {
            const magnitudes = (await orderedValues(page, 'rankingChange')).map((v) => Math.abs(Number(v)));
            expect(magnitudes.length).toBeGreaterThan(1);
            const sortedAsc = [...magnitudes].sort((a, b) => a - b);
            expect(magnitudes).toEqual(sortedAsc);
        }).toPass();
    });

    test.eachFramework('Cycles to absolute descending then to no sort', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const header = agIdFor.headerCell('rankingChange');

        // First click moves from absolute asc to absolute desc.
        await header.click();
        await expect(header.locator('.ag-sort-absolute-descending-icon')).toBeVisible();
        await expect(async () => {
            const magnitudes = (await orderedValues(page, 'rankingChange')).map((v) => Math.abs(Number(v)));
            const sortedDesc = [...magnitudes].sort((a, b) => b - a);
            expect(magnitudes).toEqual(sortedDesc);
        }).toPass();

        // Next click reaches the null entry in the sortingOrder, clearing the sort.
        await waitForRowAnimations(page);
        await header.click();
        await expect(header.locator('.ag-sort-absolute-ascending-icon')).not.toBeVisible();
        await expect(header.locator('.ag-sort-absolute-descending-icon')).not.toBeVisible();
    });
});
