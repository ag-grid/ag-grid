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
    test.eachFramework('Post-sort pins Ireland rows to the top', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // country is sorted asc, but postSortRows floats every Ireland row to the top.
        await expect(async () => {
            const countries = await orderedValues(page, 'country');
            expect(countries.length).toBeGreaterThan(1);
            expect(countries[0]).toBe('Ireland');
        }).toPass();
    });

    test.eachFramework('Ireland stays on top after re-sorting another column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // postSortRows runs after any sort, so Ireland remains pinned when we sort by athlete.
        await agIdFor.headerCell('athlete').click();
        await waitForRowAnimations(page);
        await expect(async () => {
            const countries = await orderedValues(page, 'country');
            expect(countries[0]).toBe('Ireland');
        }).toPass();
    });
});
