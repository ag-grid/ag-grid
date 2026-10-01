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

    test.eachFramework('scrolling to the bottom reveals the last generated rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // rowCount is a known 100 and no `cacheBlockSize` is set, so rows 0-99 are a single
        // default-size block: there is no later block to wait for. What needs retrying is the scroll
        // itself - one issued while the viewport is still sizing does not move it - so re-issue it on
        // each attempt until the final rows have rendered.
        //
        // The viewport selector is qualified with the layout class the shared scroll helper uses: an
        // unqualified `.ag-grid-viewport` can match more than one element, and `evaluate` then scrolls
        // whichever came first rather than the grid's own viewport.
        const viewport = page.locator('.ag-grid-viewport.ag-layout-normal');
        const lastCell = page.locator('.ag-row[row-index="99"]').locator('[col-id="a"]');

        await expect(async () => {
            await viewport.evaluate((el) => {
                el.scrollTop = el.scrollHeight;
            });
            // Row 99 (the last row): column A => 'A100 = 116' (17 + 99 + 0).
            // Short timeout so a scroll that lands mid-load costs one retry rather than the whole
            // budget - at the default this assertion only ever gets a single attempt.
            await expect(lastCell).toContainText('A100 = 116', { timeout: 2000 });
        }).toPass();
    });
});
