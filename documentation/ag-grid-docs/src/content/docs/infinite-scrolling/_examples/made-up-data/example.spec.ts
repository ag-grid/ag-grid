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

    test.eachFramework('scrolling reveals later generated rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('.ag-body-viewport').evaluate((el) => {
            el.scrollTop = el.scrollHeight;
        });

        // Row 50: column A => 'A51 = 67' (17 + 50 + 0).
        await expect(page.locator('.ag-row[row-index="50"]').locator('[col-id="a"]')).toContainText('A51 = 67');
    });
});
