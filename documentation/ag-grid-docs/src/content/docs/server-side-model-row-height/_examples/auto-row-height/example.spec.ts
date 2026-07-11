import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('autoHeight + wrapText measures SSRM row heights from content', async ({ page }) => {
        await waitForGridContent(page);

        // Wait for the server-side blocks to load several group rows before measuring.
        await expect(page.locator('.ag-row').nth(6)).toBeVisible();

        // The autoA / autoB columns use wrapText + autoHeight, so each row is sized to fit its
        // (randomly generated, variable-length) wrapped text. Wait until the autoHeight pass has
        // settled: more than 5 rows are measured and no autoA/autoB cell's wrapped content overflows
        // its box (scrollHeight > clientHeight) — clipping is exactly what autoHeight prevents. This
        // auto-retries, so it can't sample mid-reflow.
        await page.waitForFunction(
            () => {
                const measuredRows = Array.from(document.querySelectorAll('.ag-row'))
                    .map((row) =>
                        [row.querySelector('[col-id="autoA"]'), row.querySelector('[col-id="autoB"]')].filter(
                            (c): c is HTMLElement => c instanceof HTMLElement
                        )
                    )
                    .filter((cells) => cells.length > 0);
                if (measuredRows.length <= 5) {
                    return false;
                }
                return measuredRows.every((cells) => cells.every((c) => c.scrollHeight <= c.clientHeight + 2));
            },
            undefined,
            { timeout: 15000 }
        );

        // Heights genuinely vary across rows (auto-height did per-row measurement of the
        // variable-length content, not a single fixed height).
        const heights = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.ag-row'))
                .filter((row) => row.querySelector('[col-id="autoA"]'))
                .map((row) => row.getBoundingClientRect().height)
        );
        expect(heights.length).toBeGreaterThan(5);
        expect(Math.max(...heights)).toBeGreaterThan(Math.min(...heights));
    });
});
