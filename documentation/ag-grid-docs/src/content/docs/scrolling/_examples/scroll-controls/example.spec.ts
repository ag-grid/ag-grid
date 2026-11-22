import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('scrolls to a row with ensureIndexVisible', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('150', 'c0')).toHaveCount(0);
        await page.getByRole('button', { name: 'Scroll to row' }).click();
        await expect(agIdFor.cell('150', 'c0')).toBeVisible();
        await expect(agIdFor.cell('0', 'c0')).toHaveCount(0);
    });

    test.eachFramework('scrolls to a column with ensureColumnVisible', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'c14')).toHaveCount(0);
        await page.getByRole('button', { name: 'Scroll to column' }).click();
        await expect(agIdFor.cell('0', 'c14')).toBeVisible();
        await expect(agIdFor.cell('0', 'c0')).toHaveCount(0);
    });
});
