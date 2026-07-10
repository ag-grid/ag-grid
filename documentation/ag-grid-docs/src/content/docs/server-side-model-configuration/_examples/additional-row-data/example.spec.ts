import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('applyServerSideRowData injects the first rows without an initial getRows', async ({ page }) => {
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // The first 100 rows are supplied up-front via applyServerSideRowData, so real
        // olympic data (not loading placeholders) is present immediately.
        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(dataRow(0).locator('[col-id="country"]')).toContainText('United States');
        await expect(dataRow(0).locator('[col-id="gold"]')).toContainText('8');

        await expect(dataRow(1).locator('[col-id="gold"]')).toContainText('6');
        await expect(dataRow(2).locator('[col-id="gold"]')).toContainText('4');
        await expect(dataRow(3).locator('[col-id="athlete"]')).toContainText('Natalie Coughlin');

        // No loading placeholder rows are shown for the injected block.
        await expect(page.locator('.ag-row-loading')).toHaveCount(0);
    });
});
