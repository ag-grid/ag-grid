import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const filterItem = (page: any, label: string) => {
        const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return page
            .locator('.ag-filter-toolpanel .ag-set-filter-item')
            .filter({ has: page.locator('.ag-checkbox-label', { hasText: new RegExp(`^${escaped}$`) }) });
    };
    const itemAt = (page: any, position: number) =>
        page.locator(`.ag-filter-toolpanel .ag-virtual-list-item[aria-posinset="${position}"] .ag-checkbox-label`);
    const listSize = (page: any) => page.locator('.ag-filter-toolpanel .ag-virtual-list-item').first();
    const listViewport = (page: any) => page.locator('.ag-filter-toolpanel .ag-virtual-list-viewport');
    const scrollList = (page: any, to: 'top' | 'end') =>
        listViewport(page).evaluate((el: HTMLElement, top: number) => (el.scrollTop = top), to === 'top' ? 0 : 1e6);
    // The Tree List collapses its groups whenever the data or the model changes.
    const expandGroup = (page: any, label: string) =>
        filterItem(page, label).locator('.ag-set-filter-group-closed-icon:not(.ag-hidden)').click();
    const click = (page: any, name: string) => page.getByRole('button', { name }).click();

    test.eachFramework('the Filters Tool Panel shows the File filter, and its list scrolls', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(itemAt(page, 2)).toHaveText('Applications');
        await expect(itemAt(page, 4)).toHaveText('Documents');
        await expect(listSize(page)).toHaveAttribute('aria-setsize', '13');
        await expect
            .poll(() => listViewport(page).evaluate((el: HTMLElement) => el.scrollHeight - el.clientHeight))
            .toBeGreaterThan(0);
    });

    test.eachFramework('a file no longer in the data stays in its folder, marked', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select report.pdf and old.zip');
        await click(page, 'Remove beach.jpg');

        await scrollList(page, 'end');
        await expect(listSize(page)).toHaveAttribute('aria-setsize', '14');
        await expect(itemAt(page, 14)).toHaveText('Archive/old.zip');
        await expect(filterItem(page, 'Archive/old.zip')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Archive/old.zip')).toHaveClass(/ag-set-filter-add-group-indent/);
        await expect(filterItem(page, 'Archive/old.zip').locator('input')).toBeChecked();

        await scrollList(page, 'top');
        await expandGroup(page, 'Pictures');
        await expect(itemAt(page, 8)).toHaveText('beach.jpg');
        await expect(filterItem(page, 'beach.jpg')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'beach.jpg')).toHaveClass(/ag-set-filter-indent-1/);
        await expect(filterItem(page, 'beach.jpg').locator('input')).not.toBeChecked();
        await expect(filterItem(page, 'Pictures')).not.toHaveClass(/ag-set-filter-item-missing/);
    });

    test.eachFramework('a folder is marked once every file under it is gone', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select report.pdf and old.zip');
        await click(page, 'Remove Documents');

        await expect(filterItem(page, 'Documents')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Pictures')).not.toHaveClass(/ag-set-filter-item-missing/);
        await expandGroup(page, 'Documents');
        await expect(filterItem(page, 'report.pdf')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'report.pdf').locator('input')).toBeChecked();
    });

    test.eachFramework('clearing preserved values discards the values no longer in the data', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select report.pdf and old.zip');
        await click(page, 'Remove beach.jpg');
        await click(page, 'Clear Preserved Values');

        // (Select All) and the 12 folders, without 'Archive/old.zip'.
        await expect(listSize(page)).toHaveAttribute('aria-setsize', '13');
        await expandGroup(page, 'Pictures');
        await expect(itemAt(page, 8)).toHaveText('city.jpg');
        await expect(itemAt(page, 9)).toHaveText('sunset.jpg');
        await expect(itemAt(page, 10)).toHaveText('Projects');
        await expandGroup(page, 'Documents');
        await expect(filterItem(page, 'report.pdf').locator('input')).toBeChecked();
        await expect(filterItem(page, 'report.pdf')).not.toHaveClass(/ag-set-filter-item-missing/);
    });

    test.eachFramework('clearing preserved values drops the selected ones with them', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select report.pdf and old.zip');
        await click(page, 'Remove beach.jpg');
        await click(page, 'Remove Documents');
        await click(page, 'Clear Preserved Values');
        await expect(page.locator('.ag-grid-scrolling-container .ag-row[row-id]')).toHaveCount(0);
        await expect(filterItem(page, 'Documents')).toHaveCount(0);
        await expect(itemAt(page, 4)).toHaveText('Downloads');

        // Had 'report.pdf' stayed in the model, its rows would pass again once they return.
        await click(page, 'Restore Data');
        await expect(page.locator('.ag-grid-scrolling-container .ag-row[row-id]')).toHaveCount(0);
        await expandGroup(page, 'Pictures');
        await expect(filterItem(page, 'city.jpg').locator('input')).not.toBeChecked();
        await expandGroup(page, 'Documents');
        await expect(filterItem(page, 'report.pdf').locator('input')).not.toBeChecked();
    });
});
