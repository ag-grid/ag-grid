import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const GRID_ID = 'savedViews';

// Each button applies a complete pre-defined GridState via api.setState(), so switching between
// them replaces the previous view rather than layering on top of it.
test.agExample(import.meta, () => {
    test.eachFramework('Medals by Country groups, aggregates and hides columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Medals by Country', exact: true }).click();

        await expect(page.locator('.ag-header-cell[col-id="ag-Grid-AutoColumn"]')).toBeVisible();
        await expect(
            page.locator('.ag-column-drop-horizontal .ag-column-drop-cell', { hasText: 'Country' })
        ).toBeVisible();
        await expect(agIdFor.headerCell('athlete')).toHaveCount(0);
        await expect(agIdFor.headerCell('total')).toHaveAttribute('aria-sort', 'descending');
        // Aggregated total on the first group row: United States has the most medals.
        await expect(page.locator('.ag-row-group').first()).toContainText('United States');
        await expect(page.locator('.ag-row-group').first().locator('[col-id="total"]')).not.toBeEmpty();
    });

    test.eachFramework('Swimming Leaders filters, pins and sorts', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Swimming Leaders', exact: true }).click();

        await expect(agIdFor.headerCell('athlete')).toHaveClass(/ag-header-cell-last-left-pinned/);
        await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'descending');
        await expect(agIdFor.headerCell('sport')).toHaveCount(0);
        // Only swimmers remain, so Michael Phelps (row id 0, 8 golds) leads.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(page.locator('.ag-row').filter({ hasText: 'Athletics' })).toHaveCount(0);
    });

    test.eachFramework('Switching back to Default View replaces the previous view', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Medals by Country', exact: true }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveCount(0);

        await page.getByRole('button', { name: 'Default View', exact: true }).click();

        // Grouping, sort and hidden columns from the previous view are all gone.
        await expect(page.locator('.ag-header-cell[col-id="ag-Grid-AutoColumn"]')).toHaveCount(0);
        await expect(agIdFor.headerCell('athlete')).toBeVisible();
        await expect(agIdFor.headerCell('total')).toHaveAttribute('aria-sort', 'none');
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });
});
