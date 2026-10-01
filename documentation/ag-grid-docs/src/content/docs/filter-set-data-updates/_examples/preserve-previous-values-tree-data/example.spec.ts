import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const filterItem = (page: any, label: string) => {
        const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return page
            .locator('.ag-filter-menu .ag-set-filter-item')
            .filter({ has: page.locator('.ag-checkbox-label', { hasText: new RegExp(`^${escaped}$`) }) });
    };
    const openFilterExpanded = async (page: any) => {
        await page.locator('[col-id="ag-Grid-AutoColumn"] .ag-floating-filter-button button').click();
        await expect(page.locator('.ag-filter-menu .ag-set-filter-item').first()).toBeVisible();
        const closed = page.locator('.ag-filter-menu .ag-set-filter-group-closed-icon:not(.ag-hidden)');
        for (let i = 0; i < 20 && (await closed.count()) > 0; ++i) {
            await closed.first().click();
        }
        await expect(closed).toHaveCount(0);
    };

    test.eachFramework('a file no longer in the data stays in its folder, muted', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Select report.pdf and old.zip' }).click();
        await page.getByRole('button', { name: 'Remove beach.jpg' }).click();
        await openFilterExpanded(page);

        await expect(filterItem(page, 'beach.jpg')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'beach.jpg')).toHaveClass(/ag-set-filter-indent-1/);
        await expect(filterItem(page, 'beach.jpg').locator('input')).not.toBeChecked();
        await expect(filterItem(page, 'Pictures')).not.toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Archive/old.zip')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Archive/old.zip')).toHaveClass(/ag-set-filter-indent-0/);
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
        await page.getByRole('button', { name: 'Clear Preserved Values' }).click();
        await openFilterExpanded(page);

        await expect(filterItem(page, 'report.pdf').locator('input')).toBeChecked();
        await expect(filterItem(page, 'beach.jpg')).toHaveCount(0);
        await expect(filterItem(page, 'Archive/old.zip')).toHaveCount(0);
        await expect(page.locator('.ag-filter-menu .ag-set-filter-item-missing')).toHaveCount(0);
    });

    test.eachFramework('clearing preserved values drops the selected ones with them', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Select report.pdf and old.zip' }).click();
        await page.getByRole('button', { name: 'Remove beach.jpg' }).click();
        await page.getByRole('button', { name: 'Remove Documents' }).click();
        await page.getByRole('button', { name: 'Clear Preserved Values' }).click();
        await expect(page.locator('.ag-grid-scrolling-container .ag-row[row-id]')).toHaveCount(0);

        // Had 'report.pdf' stayed in the model, its rows would pass again once they return.
        await page.getByRole('button', { name: 'Restore Data' }).click();
        await expect(page.locator('.ag-grid-scrolling-container .ag-row[row-id]')).toHaveCount(0);
        await openFilterExpanded(page);
        await expect(filterItem(page, 'report.pdf').locator('input')).not.toBeChecked();
        await expect(filterItem(page, 'city.jpg').locator('input')).not.toBeChecked();
    });
});
