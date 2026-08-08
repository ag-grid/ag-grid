import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('the class datasource generates the first block of rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // record[letter] = `${LETTER}${rowIndex + 1} = ${17 + rowIndex + colIndex}`.
        // Row 0: column A (colIndex 0) => 'A1 = 17', column B (colIndex 1) => 'B1 = 18'.
        await expect(dataRow(0).locator('[col-id="a"]')).toContainText('A1 = 17');
        await expect(dataRow(0).locator('[col-id="b"]')).toContainText('B1 = 18');
    });

    test.eachFramework('scrolling to the bottom reveals the last generated rows', async ({ page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // rowCount is a known 100, so scrolling to the bottom renders the final rows (index 99).
        // Under the infinite row model the last block loads asynchronously, so re-issue the
        // scroll on each retry until the last block has loaded and its rows have rendered.
        const api = remoteGrid(page);
        const lastCell = page.locator('.ag-row[row-index="99"]').locator('[col-id="a"]');

        await expect(async () => {
            // Scroll through the API rather than by assigning scrollTop: where the browser renders
            // overlay scrollbars the grid drives the viewport from its own scroll element and the
            // assignment is synced back away, so the next block is never requested. Only the loaded
            // blocks are displayed, so ask for the last row the grid currently knows about -
            // `ensureIndexVisible(99)` warns until the final block has arrived - and let the retry
            // walk down to row 99 block by block.
            const displayed = (await api.getDisplayedRowCount()) ?? 0;
            if (displayed > 0) {
                await api.ensureIndexVisible(displayed - 1, 'bottom');
            }
            // Row 99 (the last row): column A => 'A100 = 116' (17 + 99 + 0).
            // Short timeout so a scroll that lands mid-load costs one retry rather than the whole
            // budget - at the default this assertion only ever gets a single attempt.
            await expect(lastCell).toContainText('A100 = 116', { timeout: 2000 });
        }).toPass();
    });
});
