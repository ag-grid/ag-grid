import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Detail row state is retained when the master row is re-opened', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered expands the row at index 1, so one detail grid renders on load.
        const detailRow = page.locator('.ag-details-row').first();
        await expect(detailRow).toBeVisible();

        const ascendingIcon = () =>
            detailRow
                .locator('.ag-header-cell', { has: page.locator('.ag-header-cell-text', { hasText: 'Call Id' }) })
                .locator('.ag-sort-indicator-icon.ag-sort-ascending-icon');

        // Sort the detail grid by the 'Call Id' column by clicking its header.
        await detailRow
            .locator('.ag-header-cell', { has: page.locator('.ag-header-cell-text', { hasText: 'Call Id' }) })
            .click();
        await expect(ascendingIcon()).toBeVisible();

        // Collapse the master row. With keepDetailRows=true the detail grid is cached (kept in the DOM
        // but hidden) rather than destroyed, so its sort state survives.
        await agIdFor.groupExpanded('1', 'name').click();
        await expect(detailRow).not.toBeVisible();

        // Re-open the master row: the cached detail grid returns with its ascending sort still applied.
        await agIdFor.groupContracted('1', 'name').click();
        await expect(detailRow).toBeVisible();
        await expect(ascendingIcon()).toBeVisible();
    });
});
