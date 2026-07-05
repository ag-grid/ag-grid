import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Mini Filter text can be saved and restored via the filter instance',
        async ({ agIdFor, page }) => {
            // Set Filter is expanded in the Filters tool panel on grid ready
            const miniFilter = agIdFor.setFilterInstanceMiniFilterInput({
                source: 'filter-toolpanel',
                colLabel: 'Athlete',
            });
            await expect(miniFilter).toBeVisible();

            await miniFilter.fill('phelps');
            await expect(miniFilter).toHaveValue('phelps');

            // save the current text, then clear the input
            await page.getByRole('button', { name: 'Save Mini Filter Text' }).click();
            await miniFilter.fill('');
            await expect(miniFilter).toHaveValue('');

            // restore replays the saved text through athleteFilter.setMiniFilter()
            await page.getByRole('button', { name: 'Restore Mini Filter Text' }).click();
            await expect(miniFilter).toHaveValue('phelps');
        }
    );
});
