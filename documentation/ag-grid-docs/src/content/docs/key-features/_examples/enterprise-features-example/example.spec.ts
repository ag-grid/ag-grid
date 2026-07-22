import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Shows row grouping, a side bar and an integrated chart', async ({ agIdFor, page }) => {
        // rowGroup on make produces group rows in the auto (single) group column
        const groupRows = page.locator('.ag-row-group');
        await expect(groupRows.first()).toBeVisible();
        // group cells are expandable
        await expect(page.locator('.ag-row-group .ag-cell-expandable').first()).toBeVisible();

        // side bar (columns + filters tool panels) is present
        await expect(page.locator('.ag-side-bar')).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Columns' })).toBeVisible();

        // integrated chart created onFirstDataRendered renders a chart canvas
        await expect(page.locator('.ag-charts-canvas canvas').first()).toBeVisible();
    });
});
