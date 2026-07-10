import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Update Selected Rows bumps the version only on selected rows', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // getRowId is `${athlete}-${date}`, so rows have stable, content-derived ids.
        const selectedRowVersion = agIdFor.cell('Michael Phelps-24/08/2008', 'version');
        const otherRowVersion = agIdFor.cell('Natalie Coughlin-24/08/2008', 'version');

        // Every row starts on the initial server version.
        await expect(selectedRowVersion).toContainText('0 - 0 - 0');
        await expect(otherRowVersion).toContainText('0 - 0 - 0');

        // Select the first row via its selection checkbox.
        const row = page.locator('.ag-row[row-id="Michael Phelps-24/08/2008"]').first();
        await row.locator('input.ag-checkbox-input').first().click();
        await expect(row).toHaveClass(/ag-row-selected/);

        // Updating selected rows bumps the version on the selected row only.
        await page.getByRole('button', { name: 'Update Selected Rows' }).click();
        await expect(selectedRowVersion).toContainText('1 - 1 - 1');
        await expect(otherRowVersion).toContainText('0 - 0 - 0');
    });
});
