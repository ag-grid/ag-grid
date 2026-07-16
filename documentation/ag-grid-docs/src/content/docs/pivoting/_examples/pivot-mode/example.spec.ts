import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Country + Year row-grouped, gold/silver/bronze summed. Three buttons switch between:
    // 1 - grouping only, 2 - grouping + pivot mode (no pivot), 3 - pivot mode + pivot active (year).
    // Values from olympic-winners.json: United States total gold = 552; gold in 2000 = 130, 2004 = 118.

    test.eachFramework('Grouping active: row groups expand to reveal nested year groups', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Aggregated (summed) total gold for the United States group.
        await expect(agIdFor.cell('row-group-country-United States', 'gold')).toContainText('552');

        // Row groups expand: expanding the country group reveals its nested year groups.
        const usRow = page.locator('[row-id="row-group-country-United States"]').first();
        await expect(usRow).toHaveAttribute('aria-expanded', 'false');
        await agIdFor.groupContracted('row-group-country-United States', 'ag-Grid-AutoColumn').first().click();
        await waitForRowAnimations(page);
        await expect(usRow).toHaveAttribute('aria-expanded', 'true');
        await expect(agIdFor.autoGroupCell('row-group-country-United States-year-2000')).toBeVisible();
    });

    test.eachFramework(
        'Pivot active: switching to mode 3 generates a gold column per year',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            // Before pivot is active there are no pivot result columns for years.
            await expect(agIdFor.headerGroupCell('pivotGroup_year_2000_0')).toHaveCount(0);

            // Mode 3: pivot mode on with Year added to column labels (pivot active).
            await page.getByRole('button', { name: '3 - Grouping Active with Pivot Mode and Pivot Active' }).click();
            await waitForRowAnimations(page);

            // Pivot result columns are grouped by the pivot field (year).
            await expect(agIdFor.headerGroupCell('pivotGroup_year_2000_0')).toBeVisible();

            // Aggregated gold per country per year.
            await expect(agIdFor.cell('row-group-country-United States', 'pivot_year_2000_gold')).toContainText('130');
            await expect(agIdFor.cell('row-group-country-United States', 'pivot_year_2004_gold')).toContainText('118');
        }
    );
});
