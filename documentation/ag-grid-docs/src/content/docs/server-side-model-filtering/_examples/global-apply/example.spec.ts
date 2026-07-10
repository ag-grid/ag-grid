import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'New Filters Tool Panel batches edits until the global Apply is clicked',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            const athleteCells = page.locator('.ag-row [col-id="athlete"]');
            const nonPhelps = athleteCells.filter({ hasText: 'Natalie Coughlin' });

            // Unfiltered: non-Phelps athletes (e.g. Natalie Coughlin) are present.
            await expect(nonPhelps.first()).toBeVisible();

            // Add an Athlete filter in the tool panel and edit it to contain "phelps".
            await agIdFor.filterToolPanelAddFilterButton().click();
            await page.getByRole('option', { name: 'Athlete' }).locator('div').click();

            const athleteFilterInput = agIdFor.textFilterInstanceInput({
                source: 'filter-toolpanel',
                colLabel: 'Athlete',
            });
            await athleteFilterInput.fill('phelps');
            await athleteFilterInput.press('Enter');

            // The edit is batched: no server request yet, so the rows are unchanged.
            await expect(nonPhelps.first()).toBeVisible();

            // Clicking the global Apply sends a single request and the rows update.
            await agIdFor.filterToolPanel().getByRole('button', { name: 'Apply' }).click();

            await expect(athleteCells.first()).toBeVisible();
            await expect(athleteCells.filter({ hasNotText: 'Phelps' })).toHaveCount(0);
        }
    );
});
