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

    test.eachFramework('the Filters Tool Panel shows the City filter, and its list scrolls', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(itemAt(page, 2)).toHaveText('Australia');
        await expect(itemAt(page, 5)).toHaveText('France');
        await expect(listSize(page)).toHaveAttribute('aria-setsize', '15');
        await expect
            .poll(() => listViewport(page).evaluate((el: HTMLElement) => el.scrollHeight - el.clientHeight))
            .toBeGreaterThan(0);
    });

    test.eachFramework('a value no longer in the data stays in its group, marked', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select Paris and Madrid');
        await click(page, 'Remove Rome');

        await scrollList(page, 'end');
        await expect(listSize(page)).toHaveAttribute('aria-setsize', '16');
        await expect(itemAt(page, 16)).toHaveText('Spain#Madrid');
        await expect(filterItem(page, 'Spain#Madrid')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Spain#Madrid')).toHaveClass(/ag-set-filter-add-group-indent/);
        await expect(filterItem(page, 'Spain#Madrid').locator('input')).toBeChecked();

        await scrollList(page, 'top');
        await expandGroup(page, 'Italy');
        await expect(itemAt(page, 10)).toHaveText('Rome');
        await expect(filterItem(page, 'Rome')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Rome')).toHaveClass(/ag-set-filter-indent-1/);
        await expect(filterItem(page, 'Rome').locator('input')).not.toBeChecked();
        await expect(filterItem(page, 'Italy')).not.toHaveClass(/ag-set-filter-item-missing/);
    });

    test.eachFramework('a group is marked once every value under it is gone', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select Paris and Madrid');
        await click(page, 'Remove France');

        await expect(filterItem(page, 'France')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Italy')).not.toHaveClass(/ag-set-filter-item-missing/);
        await expandGroup(page, 'France');
        await expect(filterItem(page, 'Paris')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItem(page, 'Paris').locator('input')).toBeChecked();
    });

    test.eachFramework('clearing preserved values discards the values no longer in the data', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select Paris and Madrid');
        await click(page, 'Remove Rome');
        await click(page, 'Clear Preserved Values');

        // (Select All) and the 14 countries, without 'Spain#Madrid'.
        await expect(listSize(page)).toHaveAttribute('aria-setsize', '15');
        await expandGroup(page, 'Italy');
        await expect(itemAt(page, 8)).toHaveText('Milan');
        await expect(itemAt(page, 9)).toHaveText('Naples');
        await expect(itemAt(page, 10)).toHaveText('Japan');
        await expandGroup(page, 'France');
        await expect(filterItem(page, 'Paris').locator('input')).toBeChecked();
        await expect(filterItem(page, 'Paris')).not.toHaveClass(/ag-set-filter-item-missing/);
    });

    test.eachFramework('clearing preserved values drops the selected ones with them', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await click(page, 'Select Paris and Madrid');
        await click(page, 'Remove Rome');
        await click(page, 'Remove France');
        await click(page, 'Clear Preserved Values');
        await expect(page.locator('.ag-grid-scrolling-container .ag-row[row-id]')).toHaveCount(0);
        await expect(filterItem(page, 'France')).toHaveCount(0);
        await expect(itemAt(page, 5)).toHaveText('Germany');

        // Had 'Paris' stayed in the model, its rows would pass again once they return.
        await click(page, 'Restore Data');
        await expect(page.locator('.ag-grid-scrolling-container .ag-row[row-id]')).toHaveCount(0);
        await expandGroup(page, 'Italy');
        await expect(filterItem(page, 'Milan').locator('input')).not.toBeChecked();
        await expandGroup(page, 'France');
        await expect(filterItem(page, 'Paris').locator('input')).not.toBeChecked();
    });
});
