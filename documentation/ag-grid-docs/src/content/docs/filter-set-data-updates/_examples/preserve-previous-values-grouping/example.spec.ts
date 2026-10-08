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

    test.eachFramework('a value no longer in the data stays in its group, muted', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Select Paris and Madrid' }).click();
        await page.getByRole('button', { name: 'Remove Rome' }).click();
        await openFilterExpanded(page);

        await expect(filterItem(page, 'Rome')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Rome')).toHaveClass(/ag-set-filter-indent-1/);
        await expect(filterItem(page, 'Rome').locator('input')).not.toBeChecked();
        await expect(filterItem(page, 'Italy')).not.toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Spain#Madrid')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Spain#Madrid')).toHaveClass(/ag-set-filter-add-group-indent/);
        await expect(filterItem(page, 'Spain#Madrid').locator('input')).toBeChecked();
    });

    test.eachFramework('a group is muted once every value under it is gone', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Select Paris and Madrid' }).click();
        await page.getByRole('button', { name: 'Remove France' }).click();
        await openFilterExpanded(page);

        await expect(filterItem(page, 'France')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Paris')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Paris').locator('input')).toBeChecked();
        await expect(filterItem(page, 'Italy')).not.toHaveClass(/ag-set-filter-item-missing/);
    });

    test.eachFramework('clearing preserved values discards the values no longer in the data', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Select Paris and Madrid' }).click();
        await page.getByRole('button', { name: 'Remove Rome' }).click();
        await page.getByRole('button', { name: 'Clear Preserved Values' }).click();
        await openFilterExpanded(page);

        await expect(filterItem(page, 'Paris').locator('input')).toBeChecked();
        await expect(filterItem(page, 'Rome')).toHaveCount(0);
        await expect(filterItem(page, 'Spain#Madrid')).toHaveCount(0);
        await expect(page.locator('.ag-filter-menu .ag-set-filter-item-missing')).toHaveCount(0);
    });

    test.eachFramework('clearing preserved values drops the selected ones with them', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Select Paris and Madrid' }).click();
        await page.getByRole('button', { name: 'Remove Rome' }).click();
        await page.getByRole('button', { name: 'Remove France' }).click();
        await page.getByRole('button', { name: 'Clear Preserved Values' }).click();
        await expect(page.locator('.ag-grid-scrolling-container .ag-row[row-id]')).toHaveCount(0);

        // Had 'Paris' stayed in the model, its rows would pass again once they return.
        await page.getByRole('button', { name: 'Restore Data' }).click();
        await expect(page.locator('.ag-grid-scrolling-container .ag-row[row-id]')).toHaveCount(0);
        await openFilterExpanded(page);
        await expect(filterItem(page, 'Paris').locator('input')).not.toBeChecked();
        await expect(filterItem(page, 'Milan').locator('input')).not.toBeChecked();
    });
});
