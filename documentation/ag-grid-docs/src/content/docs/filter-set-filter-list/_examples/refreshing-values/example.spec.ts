import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const ARRAY_COL = 'Values Array';

async function waitForFilterItems(page: any, colLabel: string) {
    await page
        .locator(`[data-testid^="ag-filter-toolpanel-set-filter-item:colLabel=${colLabel};itemLabel="]`)
        .first()
        .waitFor();
}

test.agExample(import.meta, () => {
    test.eachFramework('Filter list reflects the initial provided values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, ARRAY_COL);

        // Initial array values are ['Elephant', 'Lion', 'Monkey'].
        const spec = { source: 'filter-toolpanel' as const, colLabel: ARRAY_COL };
        await expect(agIdFor.setFilterInstanceItem(spec, 'Elephant')).toBeVisible();
        await expect(agIdFor.setFilterInstanceItem(spec, 'Lion')).toBeVisible();
        await expect(agIdFor.setFilterInstanceItem(spec, 'Monkey')).toBeVisible();
        await expect(agIdFor.setFilterInstanceItem(spec, 'Giraffe')).toHaveCount(0);
    });

    test.eachFramework('refreshFilterValues updates the list when the array changes', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, ARRAY_COL);

        // The item test ids are only stamped on the initial render, so match the refreshed
        // list by its rendered text — scoped to the Values Array group so items from other
        // filter lists in the tool panel can't satisfy the assertions.
        const item = (name: string) =>
            agIdFor.filterToolPanelGroup(ARRAY_COL).locator('.ag-set-filter-item').filter({ hasText: name });
        await expect(item('Lion').first()).toBeVisible();
        await expect(item('Giraffe')).toHaveCount(0);

        // Switch to ['Elephant', 'Giraffe', 'Tiger']; refreshFilterValues() applies it immediately.
        await page.getByRole('button', { name: "Use ['Elephant', 'Giraffe', 'Tiger']" }).click();

        await expect(item('Giraffe').first()).toBeVisible();
        await expect(item('Tiger').first()).toBeVisible();
        await expect(item('Lion')).toHaveCount(0);
        await expect(item('Monkey')).toHaveCount(0);
    });
});
