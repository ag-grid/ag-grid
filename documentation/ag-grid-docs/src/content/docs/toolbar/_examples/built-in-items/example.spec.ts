import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Built-in toolbar items render', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        await expect(toolbar.locator(':scope > .ag-toolbar-input')).toHaveCount(2);
        await expect(toolbar.locator(':scope > .ag-toolbar-button-wrapper')).toHaveCount(2);
    });

    test.eachFramework('Typing into quick filter reduces displayed rows', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await page.locator('.ag-toolbar-input-field').first().fill('Michael Phelps');

        // The first 3 rows in the dataset are all Michael Phelps entries
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Michael Phelps');

        // No other rows should be visible
        await expect(agIdFor.rowNode('3')).not.toBeVisible();
    });
});
