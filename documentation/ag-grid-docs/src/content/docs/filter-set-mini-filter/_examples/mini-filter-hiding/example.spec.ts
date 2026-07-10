import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders the Olympic winners data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of olympic-winners.json is Michael Phelps, United States.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
    });

    test.eachFramework('Athlete Set Filter shows a Mini Filter', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.floatingFilterButton('athlete').click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();
        // Default behaviour: the Mini Filter search box is shown.
        await expect(setFilter.locator('.ag-mini-filter')).toBeVisible();

        await page.keyboard.press('Escape');
    });

    test.eachFramework('Country Set Filter hides the Mini Filter', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.floatingFilterButton('country').click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();
        // suppressMiniFilter: true hides the Mini Filter search box.
        await expect(setFilter.locator('.ag-mini-filter')).not.toBeVisible();

        await page.keyboard.press('Escape');
    });
});
