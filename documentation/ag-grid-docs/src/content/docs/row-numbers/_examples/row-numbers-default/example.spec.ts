import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

const ROW_NUMBERS_COL = 'ag-Grid-RowNumbersColumn';

// Read the row-number column values in top-to-bottom display order (by row-index).
async function rowNumberOrder(page: Page): Promise<string[]> {
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
        const cell = row.locator(`[col-id="${ROW_NUMBERS_COL}"]`);
        if ((await cell.count()) === 0) {
            continue;
        }
        seen.set(idx, ((await cell.first().innerText()) ?? '').trim());
    }
    return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

test.agExample(import.meta, () => {
    test.eachFramework('Renders sequential row numbers', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.rowNumber('0')).toContainText('1');
        await expect(agIdFor.rowNumber('1')).toContainText('2');
        await expect(agIdFor.rowNumber('2')).toContainText('3');
    });

    test.eachFramework('Row numbers stay positional after sorting', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.headerCell('athlete').click();
        await waitForRowAnimations(page);

        // Row numbers track display position, not the data, so they remain 1, 2, 3, ... after a sort.
        await expect(async () => {
            const numbers = await rowNumberOrder(page);
            expect(numbers.length).toBeGreaterThan(2);
            expect(numbers.slice(0, 3)).toEqual(['1', '2', '3']);
        }).toPass();
    });
});
