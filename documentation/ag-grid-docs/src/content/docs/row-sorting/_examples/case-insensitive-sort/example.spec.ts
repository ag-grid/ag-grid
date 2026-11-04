import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

// Read the code column values in top-to-bottom display order (by row-index).
async function codeOrder(page: Page): Promise<string[]> {
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
        const cell = row.locator('[col-id="code"]');
        if ((await cell.count()) === 0) {
            continue;
        }
        seen.set(idx, ((await cell.first().innerText()) ?? '').trim());
    }
    return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
}

test.agExample(import.meta, () => {
    test.eachFramework(
        'Case-insensitive sort ignores case and keeps the original order of case variants',
        async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // sensitivity: 'accent' on load, so aa sorts before AZ, and AA, aa, Aa keep their row data order.
            await expect(async () => {
                expect(await codeOrder(page)).toEqual(['AA', 'aa', 'Aa', 'az', 'AZ', 'b', 'B']);
            }).toPass();
        }
    );

    test.eachFramework('Default sort puts all uppercase letters before lowercase', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Default Sort', exact: true }).click();
        await waitForRowAnimations(page);
        await expect(async () => {
            expect(await codeOrder(page)).toEqual(['AA', 'AZ', 'Aa', 'B', 'aa', 'az', 'b']);
        }).toPass();

        await page.getByRole('button', { name: 'Case-insensitive Sort', exact: true }).click();
        await waitForRowAnimations(page);
        await expect(async () => {
            expect(await codeOrder(page)).toEqual(['AA', 'aa', 'Aa', 'az', 'AZ', 'b', 'B']);
        }).toPass();
    });
});
