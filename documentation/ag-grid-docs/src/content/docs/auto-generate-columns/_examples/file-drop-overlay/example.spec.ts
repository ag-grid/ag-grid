import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('loads sample data via select', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await page.locator('#sampleData').selectOption('small-row-data.json');

        await expect(agIdFor.headerCell('make')).toBeVisible();
        await expect(agIdFor.headerCell('model')).toBeVisible();
        await expect(agIdFor.headerCell('price')).toBeVisible();

        await expect(agIdFor.cell('0', 'make')).toContainText('Toyota');
    });

    test.eachFramework('switches to different dataset', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await page.locator('#sampleData').selectOption('small-row-data.json');
        await expect(agIdFor.headerCell('make')).toBeVisible();

        await page.locator('#sampleData').selectOption('small-olympic-winners.json');
        await expect(agIdFor.headerCell('athlete')).toBeVisible({ timeout: 10000 });
        await expect(agIdFor.headerCell('sport')).toBeVisible();
    });

    test.eachFramework('upload file toolbar button shows file input overlay', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await page.locator('#sampleData').selectOption('small-row-data.json');
        await expect(agIdFor.headerCell('make')).toBeVisible();

        await page.locator('.ag-toolbar-button-wrapper').getByText('Upload File').click();

        await expect(page.locator('.ag-overlay-file-input-center')).toBeVisible();
        await expect(page.locator('.ag-file-input-drop-zone')).toBeVisible();
    });
});
