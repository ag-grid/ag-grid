import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('autoHeight + wrapText measures SSRM row heights from content', async ({ page }) => {
        await waitForGridContent(page);

        // Wait for the server-side blocks to load several group rows before measuring.
        await expect(page.locator('.ag-row').nth(6)).toBeVisible();

        // The autoA / autoB columns use wrapText + autoHeight, so each row is sized to fit its
        // (randomly generated, variable-length) wrapped text. Measure, per rendered row, whether
        // each cell's full content fits within its rendered height, plus the row height.
        const rows = await page.evaluate(() => {
            const result: { clipped: boolean; height: number }[] = [];
            for (const row of document.querySelectorAll('.ag-row')) {
                const cells = [row.querySelector('[col-id="autoA"]'), row.querySelector('[col-id="autoB"]')].filter(
                    (c): c is HTMLElement => c instanceof HTMLElement
                );
                if (cells.length === 0) {
                    continue;
                }
                // A cell whose wrapped content overflows its box (scrollHeight > clientHeight) is
                // clipped — which is exactly what autoHeight prevents by sizing the row to the content.
                const clipped = cells.some((c) => c.scrollHeight > c.clientHeight + 2);
                result.push({ clipped, height: row.getBoundingClientRect().height });
            }
            return result;
        });

        // Enough rows rendered to make the measurement meaningful.
        expect(rows.length).toBeGreaterThan(5);

        // autoHeight sizes every row to fit its content: no cell's wrapped text is clipped.
        expect(rows.every((r) => !r.clipped)).toBe(true);

        // Heights genuinely vary across rows (auto-height is doing per-row measurement of the
        // variable-length content, not applying a single fixed height).
        const heights = rows.map((r) => r.height);
        expect(Math.max(...heights)).toBeGreaterThan(Math.min(...heights));
    });
});
