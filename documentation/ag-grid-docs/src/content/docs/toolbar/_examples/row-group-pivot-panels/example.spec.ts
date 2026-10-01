import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

// Country is row-grouped, year is the pivot, and gold/silver/total are summed value columns.
// Both panels are embedded in the Quick Access Toolbar (agRowGroupPanelToolbarItem and
// agPivotPanelToolbarItem) alongside a right-aligned Reset action button that turns pivot mode
// back on and calls resetColumnState().
// Values from olympic-winners.json (United States): gold in 2000 = 130, gold across all years = 552.
//
// NOTE: TestIdService only tags drop areas found inside the columns tool panel (source 'toolbar')
// and the row group panel wrapper above the grid (source 'panel') — see
// TestIdService.setupColumnDropArea. The toolbar-hosted panels live in `.ag-toolbar`, so they get
// no test ids and have to be addressed by class.

test.agExample(import.meta, () => {
    const rowGroupPanel = (page: Page) => page.locator('.ag-toolbar .ag-column-drop-rowgroup');
    const pivotPanel = (page: Page) => page.locator('.ag-toolbar .ag-column-drop-pivot');
    const chips = (panel: Locator) => panel.locator('.ag-column-drop-cell');
    const removeChip = (page: Page, panel: Locator, label: string) =>
        chips(panel)
            .filter({ has: page.locator('.ag-column-drop-cell-text', { hasText: label }) })
            .locator('.ag-column-drop-cell-button');

    test.eachFramework('Row group and pivot panels render in toolbar', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        await expect(toolbar.locator('.ag-column-drop-horizontal')).toHaveCount(2);
        await expect(toolbar.locator('.ag-toolbar-button-wrapper')).toHaveCount(1);
    });

    test.eachFramework('Both toolbar panels show their initial chip', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // country has rowGroup: true, year has pivot: true.
        await expect(chips(rowGroupPanel(page))).toHaveCount(1);
        await expect(rowGroupPanel(page)).toContainText('Country');

        await expect(chips(pivotPanel(page))).toHaveCount(1);
        await expect(pivotPanel(page)).toContainText('Year');
    });

    test.eachFramework('Pivot mode is active on load', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Pivot result columns are grouped by the pivot key (year).
        await expect(agIdFor.headerGroupCell('pivotGroup_year_2000_0')).toBeVisible();

        // Rows are grouped by country and the values are summed per year.
        await expect(agIdFor.cell('row-group-country-United States', 'pivot_year_2000_gold')).toContainText('130');
    });

    test.eachFramework('Removing the pivot chip unpivots the grid', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await removeChip(page, pivotPanel(page), 'Year').click();
        await waitForRowAnimations(page);

        // The pivot panel is empty and the pivot result columns are gone.
        await expect(chips(pivotPanel(page))).toHaveCount(0);
        await expect(agIdFor.headerGroupCell('pivotGroup_year_2000_0')).toHaveCount(0);

        // Still in pivot mode, so the value columns show the aggregate across every year.
        await expect(agIdFor.cell('row-group-country-United States', 'gold')).toContainText('552');
    });

    test.eachFramework('Removing the row group chip ungroups the grid', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toBeVisible();

        await removeChip(page, rowGroupPanel(page), 'Country').click();
        await waitForRowAnimations(page);

        await expect(chips(rowGroupPanel(page))).toHaveCount(0);
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toHaveCount(0);
    });

    test.eachFramework('Reset restores the initial pivot and row group state', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await removeChip(page, pivotPanel(page), 'Year').click();
        await waitForRowAnimations(page);
        await removeChip(page, rowGroupPanel(page), 'Country').click();
        await waitForRowAnimations(page);
        await expect(chips(pivotPanel(page))).toHaveCount(0);
        await expect(chips(rowGroupPanel(page))).toHaveCount(0);

        // Reset re-applies pivotMode: true and resetColumnState().
        await page.getByRole('button', { name: 'Reset' }).click();
        await waitForRowAnimations(page);

        await expect(rowGroupPanel(page)).toContainText('Country');
        await expect(pivotPanel(page)).toContainText('Year');

        // Pivot mode is on again, so the per-year pivot columns are back.
        await expect(agIdFor.headerGroupCell('pivotGroup_year_2000_0')).toBeVisible();
        await expect(agIdFor.cell('row-group-country-United States', 'pivot_year_2000_gold')).toContainText('130');
    });
});
