import { ensureGridReady, expect, scrollGridRelative, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const blanks = () => page.locator('.ag-row-group').filter({ hasText: '(Blanks)' });

        // Scroll to the bottom: the (Blanks) group is rendered as the final group.
        await scrollGridRelative('element', page, { y: 100000 });

        // Rows with null/undefined/"" country values are grouped together under "(Blanks)".
        await expect(blanks().first()).toBeVisible();

        // Enabling groupAllowUnbalanced removes the (Blanks) group, showing those rows ungrouped.
        await page.locator('#groupAllowUnbalanced').check();
        await scrollGridRelative('element', page, { y: 100000 });
        await expect(blanks()).toHaveCount(0);

        // Disabling it again restores the (Blanks) group.
        await page.locator('#groupAllowUnbalanced').uncheck();
        await scrollGridRelative('element', page, { y: 100000 });
        await expect(blanks().first()).toBeVisible();
    });
});
