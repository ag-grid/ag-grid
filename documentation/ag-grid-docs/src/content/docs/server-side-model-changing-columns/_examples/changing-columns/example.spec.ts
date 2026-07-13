import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Toggling a column checkbox and clicking Apply adds/removes that column',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            // All columns start checked, so the Gold column is displayed in the grouped grid.
            await expect(agIdFor.headerCell('gold')).toBeVisible();

            // Unchecking Gold and applying rebuilds the columnDefs without it, so its header disappears.
            await page.locator('#gold').uncheck();
            await page.getByRole('button', { name: 'Apply' }).click();
            await expect(agIdFor.headerCell('gold')).toHaveCount(0);

            // Re-checking Gold and applying brings the column header back.
            await page.locator('#gold').check();
            await page.getByRole('button', { name: 'Apply' }).click();
            await expect(agIdFor.headerCell('gold')).toBeVisible();
        }
    );
});
