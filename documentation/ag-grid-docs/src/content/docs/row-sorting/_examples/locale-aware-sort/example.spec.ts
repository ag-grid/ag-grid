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

        // accentedSort: true on load, so à and ä sort next to a.
        await expect(async () => {
            expect(await letterOrder(page)).toEqual(['a', 'à', 'ä', 'b', 'c', 'z']);
        }).toPass();
    });

    test.eachFramework('Default sort uses Unicode code-point order', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Default Sort disables accentedSort, so à and ä sort after z.
        await page.getByRole('button', { name: 'Default Sort', exact: true }).click();
        await waitForRowAnimations(page);
        await expect(async () => {
            expect(await letterOrder(page)).toEqual(['a', 'b', 'c', 'z', 'à', 'ä']);
        }).toPass();

        // Switching back to locale-specific sort restores the natural order.
        await page.getByRole('button', { name: 'Locale-specific Sort', exact: true }).click();
        await waitForRowAnimations(page);
        await expect(async () => {
            expect(await letterOrder(page)).toEqual(['a', 'à', 'ä', 'b', 'c', 'z']);
        }).toPass();
    });

    test.eachFramework('Swedish sort uses the Swedish alphabet', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Swedish collation sorts ä as its own letter after z, while à stays with a.
        await page.getByRole('button', { name: 'Swedish Sort', exact: true }).click();
        await waitForRowAnimations(page);
        await expect(async () => {
            expect(await letterOrder(page)).toEqual(['a', 'à', 'b', 'c', 'z', 'ä']);
        }).toPass();
    });
});
