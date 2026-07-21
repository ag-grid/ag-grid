import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

// Read the letter column values in top-to-bottom display order (by row-index).
async function letterOrder(page: Page): Promise<string[]> {
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
        const cell = row.locator('[col-id="letter"]');
        if ((await cell.count()) === 0) {
            continue;
        }
        seen.set(idx, ((await cell.first().innerText()) ?? '').trim());
    }
    return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

test.agExample(import.meta, () => {
    test.eachFramework('Locale-aware sort places the accented letter naturally', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // accentedSort: true on load, so à sorts next to a: a à b c.
        await expect(async () => {
            expect(await letterOrder(page)).toEqual(['a', 'à', 'b', 'c']);
        }).toPass();
    });

    test.eachFramework('Default sort uses Unicode code-point order', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Default Sort disables accentedSort, so à sorts after c: a b c à.
        await page.getByRole('button', { name: 'Default Sort', exact: true }).click();
        await waitForRowAnimations(page);
        await expect(async () => {
            expect(await letterOrder(page)).toEqual(['a', 'b', 'c', 'à']);
        }).toPass();

        // Switching back to locale-specific sort restores the natural order.
        await page.getByRole('button', { name: 'Locale-specific Sort', exact: true }).click();
        await waitForRowAnimations(page);
        await expect(async () => {
            expect(await letterOrder(page)).toEqual(['a', 'à', 'b', 'c']);
        }).toPass();
    });
});
