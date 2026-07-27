import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('loads the first block from the datasource', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(dataRow(0).locator('[col-id="country"]')).toContainText('United States');
    });

    test.eachFramework('sorting a column re-fetches sorted data from the server', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');

        // Clicking the header sorts on the server; the datasource returns a re-ordered first block.
        await agIdFor.headerCell('athlete').click();
        await waitForRowAnimations(page);

        // The sort purges the cache and re-fetches; row 0 is briefly a loading placeholder
        // (a spinner image in the ID column). This demo dataset has blank-athlete records
        // that sort to the top ascending, so assert the block has finished loading (no
        // spinner) and that the re-order moved 'Michael Phelps' off the first row — rather
        // than assuming row 0's athlete is non-empty.
        await expect(async () => {
            await expect(dataRow(0).locator('img')).toHaveCount(0);
            await expect(dataRow(0).locator('[col-id="athlete"]')).not.toContainText('Michael Phelps');
        }).toPass();
    });

    test.eachFramework('selecting a row applies the selected state', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await dataRow(0).locator('.ag-selection-checkbox').first().click();
        await expect(dataRow(0)).toHaveClass(/ag-row-selected/);
    });
});
