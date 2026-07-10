import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const TUVALU = 'row-group-country-Tuvalu';

test.agExample(import.meta, () => {
    test.eachFramework('Aggregations reflect the actual/budget split from context', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Isolate a single-row country group so its aggregate equals the raw datum.
        await page.locator('#filter-text-box').fill('Tuvalu');
        await waitForGridContent(page);

        // Default period is month 0 (Year to Jan): Jan shows actual, later months show budget.
        // Tuvalu jan_act = 272,175 (rendered by the accounting renderer with thousands separators).
        await expect(agIdFor.cell(TUVALU, 'jan')).toContainText('272,175');

        // Feb is still in the future at month 0, so it shows budget: feb_bud = -48,268 => (48,268)
        await expect(agIdFor.cell(TUVALU, 'feb')).toContainText('(48,268)');

        // YTD is the last cell in the group row: sum of actuals up to the period = jan_act = 272,175.
        await expect(agIdFor.rowNode(TUVALU).locator('.ag-cell').last()).toContainText('272,175');
    });

    test.eachFramework('Advancing the period recomputes budget cells and YTD', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#filter-text-box').fill('Tuvalu');
        await waitForGridContent(page);

        // Advance the period to Year to Feb (month 1) via the next button.
        await page
            .getByRole('button')
            .filter({ has: page.locator('.fa-chevron-right') })
            .click();
        await expect(page.locator('#monthName')).toContainText('Year to Feb');

        // Feb now shows actual: feb_act = 98,381
        await expect(agIdFor.cell(TUVALU, 'feb')).toContainText('98,381');

        // YTD now sums jan_act + feb_act = 272,175 + 98,381 = 370,556
        await expect(agIdFor.rowNode(TUVALU).locator('.ag-cell').last()).toContainText('370,556');
    });
});
