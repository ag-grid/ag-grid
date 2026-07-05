import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const rows = (page: any) => page.locator('.ag-row');

test.agExample(import.meta, () => {
    // Data holds 7 colours in 3 casings each (21 rows). The mangled model values are
    // ['ReD','OrAnGe','WhItE','YeLlOw'] — Red, Orange, White, Yellow => 4 colours x 3 casings = 12 rows.
    test.eachFramework('Case-insensitive setModel matches values regardless of case', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'API: setModel() - mismatching case' }).first().click();
        await expect(rows(page)).toHaveCount(12);
    });

    test.eachFramework('Case-sensitive setModel drops values whose case does not match', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The mangled-case values match no actual data value case-sensitively => no rows.
        await page.getByRole('button', { name: 'API: setModel() - mismatching case' }).nth(1).click();
        await expect(rows(page)).toHaveCount(0);
    });
});
