import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const DEFAULT = { source: 'filter-toolpanel' as const, colLabel: 'Default' };
const WINDOWS = { source: 'filter-toolpanel' as const, colLabel: 'Excel (Windows)' };
const MAC = { source: 'filter-toolpanel' as const, colLabel: 'Excel (Mac)' };

test.agExample(import.meta, () => {
    test.eachFramework(
        'Blanks appear only in the default Set Filter, not in Excel modes',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await agIdFor.filterToolPanelGroupCollapsedIcon('Default').click();
            await agIdFor.filterToolPanelGroupCollapsedIcon('Excel (Windows)').click();
            await agIdFor.filterToolPanelGroupCollapsedIcon('Excel (Mac)').click();

            // The default Set Filter lists (Blanks) for the null animal values.
            await expect(agIdFor.setFilterInstanceItem(DEFAULT, '(Blanks)')).toBeVisible();

            // Both Excel modes omit the (Blanks) entry from the filter list.
            await expect(agIdFor.setFilterInstanceItem(WINDOWS, '(Blanks)')).toHaveCount(0);
            await expect(agIdFor.setFilterInstanceItem(MAC, '(Blanks)')).toHaveCount(0);

            // All modes still list the concrete animal values.
            await expect(agIdFor.setFilterInstanceItem(DEFAULT, 'Lion')).toBeVisible();
            await expect(agIdFor.setFilterInstanceItem(WINDOWS, 'Lion')).toBeVisible();
            await expect(agIdFor.setFilterInstanceItem(MAC, 'Lion')).toBeVisible();
        }
    );

    test.eachFramework('Excel modes add apply buttons; the default filter has none', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.filterToolPanelGroupCollapsedIcon('Default').click();
        await agIdFor.filterToolPanelGroupCollapsedIcon('Excel (Windows)').click();
        await agIdFor.filterToolPanelGroupCollapsedIcon('Excel (Mac)').click();

        // Windows Excel mode shows OK / Cancel apply buttons.
        await expect(agIdFor.setFilterApplyPanelButton(WINDOWS, 'OK')).toBeVisible();
        await expect(agIdFor.setFilterApplyPanelButton(WINDOWS, 'Cancel')).toBeVisible();

        // Mac Excel mode shows a Clear Filter button.
        await expect(agIdFor.setFilterApplyPanelButton(MAC, 'Clear Filter')).toBeVisible();

        // The default Set Filter applies immediately, so it renders no apply buttons.
        await expect(agIdFor.setFilterApplyPanelButton(DEFAULT, 'OK')).toHaveCount(0);
        await expect(agIdFor.setFilterApplyPanelButton(DEFAULT, 'Cancel')).toHaveCount(0);
        await expect(agIdFor.setFilterApplyPanelButton(DEFAULT, 'Clear Filter')).toHaveCount(0);
    });

    test.eachFramework('Toggling the default Set Filter updates the grid immediately', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.filterToolPanelGroupCollapsedIcon('Default').click();

        // Deselect everything, then select only Lion.
        await agIdFor.setFilterInstanceItem(DEFAULT, '(Select All)').click();
        await agIdFor.setFilterInstanceItem(DEFAULT, 'Lion').click();

        // With no apply button, the filter takes effect immediately: every visible
        // animal cell reads Lion and none show any other value.
        const animalCells = page.locator('[col-id="animal"][role="gridcell"]');
        await expect(animalCells.first()).toHaveText('Lion');
        await expect(animalCells.filter({ hasNotText: 'Lion' })).toHaveCount(0);
    });
});
