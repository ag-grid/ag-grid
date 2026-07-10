import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const rows = (page: any) => page.locator('.ag-row');

test.agExample(import.meta, () => {
    test.eachFramework('setColumnFilterModel restricts the athlete rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Only John Joe Nevin and Kenny Egan appear once each in olympic-winners.json => 2 rows.
        await page.getByRole('button', { name: 'API: Filter only John Joe Nevin and Kenny Egan' }).click();
        await expect(rows(page)).toHaveCount(2);
        await expect(rows(page).filter({ hasText: 'John Joe Nevin' })).toHaveCount(1);
        await expect(rows(page).filter({ hasText: 'Kenny Egan' })).toHaveCount(1);
    });

    test.eachFramework('An empty filter model hides all rows and removing it restores them', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'API: Filter empty set' }).click();
        await expect(rows(page)).toHaveCount(0);

        await page.getByRole('button', { name: 'API: Remove filter' }).click();
        // Restoring the full data set brings back many rows (8618 total, virtualised).
        expect(await rows(page).count()).toBeGreaterThan(2);
    });
});
