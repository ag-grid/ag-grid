import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('autoHeight + wrapText measures SSRM row heights from content', async ({ page }) => {
        await waitForGridContent(page);

        // Wait for the server-side blocks to load several group rows before measuring.
        await expect(page.locator('.ag-row').nth(6)).toBeVisible();

        // The autoA / autoB columns use wrapText + autoHeight, so each row is sized to fit
        // its (randomly generated, variable-length) wrapped text. Correlate the amount of
        // text in each rendered row with its measured height.
        const rows = await page.evaluate(() => {
            const result: { textLen: number; height: number }[] = [];
            for (const row of document.querySelectorAll('.ag-row')) {
                const a = row.querySelector('[col-id="autoA"]')?.textContent ?? '';
                const b = row.querySelector('[col-id="autoB"]')?.textContent ?? '';
                result.push({ textLen: a.length + b.length, height: row.getBoundingClientRect().height });
            }
            return result;
        });

        // Enough rows rendered to make the comparison meaningful.
        expect(rows.length).toBeGreaterThan(5);

        const byText = [...rows].sort((x, y) => x.textLen - y.textLen);
        const shortest = byText[0];
        const longest = byText[byText.length - 1];

        // There is a real spread of text lengths to compare.
        expect(longest.textLen).toBeGreaterThan(shortest.textLen);

        // The row with the most wrapped text renders taller than the row with the least.
        expect(longest.height).toBeGreaterThan(shortest.height);

        // Heights genuinely vary across rows (auto-height is doing per-row measurement,
        // not applying a single fixed height).
        const heights = rows.map((r) => r.height);
        expect(Math.max(...heights)).toBeGreaterThan(Math.min(...heights));
    });
});
