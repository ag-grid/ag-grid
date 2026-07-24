import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('loads the initial viewport range from the datasource', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // setViewportRange(0, n) asks the mock server for the first block of stocks.
        await expect(dataRow(0).locator('[col-id="code"]')).toContainText('ECV.L');
        await expect(dataRow(0).locator('[col-id="name"]')).toContainText('Eco City Vehicles plc');
        await expect(dataRow(1).locator('[col-id="code"]')).toContainText('MHN.L');
    });

    test.eachFramework('selecting a row applies the selected state', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        await expect(dataRow(0).locator('[col-id="code"]')).toContainText('ECV.L');
        await dataRow(0).locator('.ag-selection-checkbox').first().click();
        await expect(dataRow(0)).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('scrolling requests a later viewport range', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 400 });
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('.ag-grid-viewport').evaluate((el) => {
            el.scrollTop = 800;
        });

        // A row well below the initial range only renders once its viewport block is fetched.
        await expect(page.locator('.ag-row[row-index="25"]').locator('[col-id="code"]')).not.toBeEmpty({
            timeout: 10000,
        });
        await expect(page.locator('.ag-row[row-index="25"]').locator('[col-id="name"]')).not.toBeEmpty();
    });
});
