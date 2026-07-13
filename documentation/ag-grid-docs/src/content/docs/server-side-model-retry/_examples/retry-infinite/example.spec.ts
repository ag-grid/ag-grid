import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('failed SSRM loads recover via Retry Failed Loads', async ({ page }) => {
        await waitForGridContent(page);

        // Locate a group row by its displayed group value — robust to the positional
        // row-ids the SSRM assigns to group rows.
        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Top-level country groups load successfully to begin with.
        const usRow = groupRow('United States');
        await expect(usRow).toBeVisible();

        // Turn on simulated load failures, then expand a country. The child (Sport)
        // block request will fail.
        await page.locator('#failLoad').check();
        await usRow.locator('.ag-group-contracted').first().click();

        // A failed load renders a full-width error placeholder row (text "ERR") and no
        // real child rows — the Swimming subgroup never appears.
        const failedRow = page.locator('.ag-row-loading', { hasText: 'ERR' });
        await expect(failedRow).toBeVisible();
        await expect(groupRow('Swimming')).toHaveCount(0);

        // Turn failures off and retry — the previously failed load now succeeds,
        // the error placeholder clears and the child rows populate.
        await page.locator('#failLoad').uncheck();
        await page.getByRole('button', { name: 'Retry Failed Loads' }).click();

        await expect(groupRow('Swimming')).toBeVisible();
        await expect(failedRow).toHaveCount(0);
    });
});
