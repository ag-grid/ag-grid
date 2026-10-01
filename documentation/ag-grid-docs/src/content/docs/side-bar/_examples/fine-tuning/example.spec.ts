import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom labels render on the tool panel buttons', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // toolPanels: ['columns', { labelDefault: 'Filters' }, { labelDefault: 'Filters XXXXXXXX' }]
        await expect(page.locator('.ag-side-button')).toHaveCount(3);
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Columns' })).toBeVisible();
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Filters XXXXXXXX' })).toBeVisible();

        // defaultToolPanel: 'filters' => the first (non-XXX) Filters panel is open.
        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Filters');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();
    });

    test.eachFramework('Clicking the customised Filters button opens its panel', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const customButton = page.locator('.ag-side-button').filter({ hasText: 'Filters XXXXXXXX' });
        await customButton.click();

        await expect(customButton).toHaveClass(/ag-selected/);
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();
    });

    test.eachFramework('The plain Filters button is distinct from the customised one', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Both tool panels use agFiltersToolPanel but carry different labels, so both
        // side buttons are present and neither label is a stand-in for the other.
        await expect(agIdFor.sideBarButton('Filters')).toBeVisible();
        await expect(agIdFor.sideBarButton('Filters')).toHaveText('Filters');
        await expect(agIdFor.sideBarButton('Filters XXXXXXXX')).toBeVisible();
        await expect(agIdFor.sideBarButton('Filters XXXXXXXX')).toHaveText('Filters XXXXXXXX');
    });

    test.eachFramework('The two filters panels are selected independently', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The parent .ag-side-button element carries the ag-selected class.
        const sideButtonFor = (label: string) => agIdFor.sideBarButton(label).locator('..');

        // defaultToolPanel: 'filters' => only the plain Filters button starts selected.
        await expect(page.locator('.ag-side-button.ag-selected')).toHaveCount(1);
        await expect(sideButtonFor('Filters')).toHaveClass(/ag-selected/);

        await agIdFor.sideBarButton('Filters XXXXXXXX').click();
        await expect(page.locator('.ag-side-button.ag-selected')).toHaveCount(1);
        await expect(sideButtonFor('Filters XXXXXXXX')).toHaveClass(/ag-selected/);
        await expect(sideButtonFor('Filters')).not.toHaveClass(/ag-selected/);
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();

        await agIdFor.sideBarButton('Filters').click();
        await expect(page.locator('.ag-side-button.ag-selected')).toHaveCount(1);
        await expect(sideButtonFor('Filters')).toHaveClass(/ag-selected/);
        await expect(sideButtonFor('Filters XXXXXXXX')).not.toHaveClass(/ag-selected/);
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();
    });
});
