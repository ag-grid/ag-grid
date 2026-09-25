import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const filterItem = (page: any, label: string) =>
        page.locator('.ag-filter-menu .ag-set-filter-item').filter({
            has: page.locator('.ag-checkbox-label', { hasText: new RegExp(`^${label.replace('.', '\\.')}$`) }),
        });
    const openFilterExpanded = async (page: any) => {
        await page.locator('[col-id="ag-Grid-AutoColumn"] .ag-floating-filter-button button').click();
        await expect(page.locator('.ag-filter-menu .ag-set-filter-item').first()).toBeVisible();
        const closed = page.locator('.ag-filter-menu .ag-set-filter-group-closed-icon:not(.ag-hidden)');
        while ((await closed.count()) > 0) {
            await closed.first().click();
        }
    };

    test.eachFramework('a file no longer in the data stays in its folder, muted', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Select report.pdf and old.zip' }).click();
        await page.getByRole('button', { name: 'Remove beach.jpg' }).click();
        await openFilterExpanded(page);

        await expect(filterItem(page, 'beach.jpg')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'beach.jpg').locator('input')).not.toBeChecked();
        await expect(filterItem(page, 'Pictures')).not.toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Archive/old.zip')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Archive/old.zip').locator('input')).toBeChecked();
    });

    test.eachFramework('a folder is muted once every file under it is gone', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Select report.pdf and old.zip' }).click();
        await page.getByRole('button', { name: 'Remove Documents' }).click();
        await openFilterExpanded(page);

        await expect(filterItem(page, 'Documents')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'report.pdf')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'report.pdf').locator('input')).toBeChecked();
        await expect(filterItem(page, 'Pictures')).not.toHaveClass(/ag-set-filter-item-missing/);
    });

    test.eachFramework('clearing preserved values discards the values no longer in the data', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Select report.pdf and old.zip' }).click();
        await page.getByRole('button', { name: 'Remove beach.jpg' }).click();
        await page.getByRole('button', { name: 'Restore Data' }).click();
        await page.getByRole('button', { name: 'Clear Preserved Values' }).click();
        await openFilterExpanded(page);

        await expect(filterItem(page, 'report.pdf').locator('input')).toBeChecked();
        await expect(filterItem(page, 'Archive/old.zip')).toHaveCount(0);
        await expect(page.locator('.ag-filter-menu .ag-set-filter-item-missing')).toHaveCount(0);
    });
});
