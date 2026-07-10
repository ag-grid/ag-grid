import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Total value getter sums columns A to F', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0 (i=1): a=63, b=11, c=43, d=77, e=19, f=71 => Total 284.
        await expect(agIdFor.cell('0', 'a')).toContainText('63');
        await expect(agIdFor.cell('0', 'b')).toContainText('11');
        await expect(agIdFor.cell('0', 'f')).toContainText('71');
        await expect(agIdFor.rowNode('0').locator('.total-col')).toContainText('284');
    });

    test.eachFramework('Editing a cell recalculates the Total via change detection', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const totalCell = agIdFor.rowNode('0').locator('.total-col');
        await expect(totalCell).toContainText('284');

        // Edit column A from 63 to 100 => Total becomes 284 - 63 + 100 = 321.
        await agIdFor.cell('0', 'a').dblclick();
        const editor = page.locator('.ag-cell-inline-editing input');
        await editor.fill('100');
        await page.keyboard.press('Enter');

        await expect(agIdFor.cell('0', 'a')).toContainText('100');
        await expect(totalCell).toContainText('321');
    });
});
