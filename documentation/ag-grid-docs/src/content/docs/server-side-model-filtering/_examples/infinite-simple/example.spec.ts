import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'applying a simple text column filter reloads only matching rows from the server',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            const athleteCells = page.locator('.ag-row [col-id="athlete"]');

            // Unfiltered data starts with Michael Phelps.
            await expect(athleteCells.filter({ hasText: 'Michael Phelps' }).first()).toBeVisible();

            // Open the Athlete column's Text Filter and filter to names containing "Fred".
            // With the SSRM this sends a new request; the server returns only matching rows.
            await agIdFor.headerFilterButton('athlete').click();
            await agIdFor.textFilterInstanceInput({ source: 'column-filter' }).fill('Fred');
            await page.keyboard.press('Escape');

            // Only matching rows remain: a "Fred" athlete is present, Michael Phelps is gone.
            await expect(athleteCells.filter({ hasText: 'Fred' }).first()).toBeVisible();
            await expect(athleteCells.filter({ hasText: 'Michael Phelps' })).toHaveCount(0);
        }
    );
});
