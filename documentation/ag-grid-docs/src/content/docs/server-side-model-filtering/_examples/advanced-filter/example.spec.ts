import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Advanced Filter expression reloads only matching rows from the server', async ({ page }) => {
        await waitForGridContent(page);

        const athleteCells = page.locator('.ag-row [col-id="athlete"]');

        // Unfiltered data includes many different athletes.
        await expect(athleteCells.filter({ hasNotText: 'Phelps' }).first()).toBeVisible();

        // Enter an Advanced Filter expression and apply it. With the SSRM the expression
        // is sent to the server as an Advanced Filter Model.
        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Athlete] contains "phelps"');
        await page.keyboard.press('Escape');
        await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();

        // Only Michael Phelps rows remain.
        await expect(athleteCells.first()).toBeVisible();
        await expect(athleteCells.filter({ hasNotText: 'Phelps' })).toHaveCount(0);
    });
});
