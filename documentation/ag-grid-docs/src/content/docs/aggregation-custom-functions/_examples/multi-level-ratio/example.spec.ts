import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Ratio of sums aggregates correctly across group levels', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Grouped by country then year. The `ratio` aggFunc carries running gold/silver totals on a
        // RatioResult wrapper so any level can divide gold/silver (toString => toFixed(2)).
        // United States: gold 552 / silver 440 => 1.25. Netherlands: 101 / 135 => 0.75.
        // The built-in `sum` on `total` is shown alongside: United States total sums to 1312.
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States', {
            useInnerText: true,
        });
        await expect(agIdFor.cell('row-group-country-United States', 'goldSilverRatio')).toContainText('1.25');
        await expect(agIdFor.cell('row-group-country-United States', 'total')).toContainText('1312');
        await expect(agIdFor.cell('row-group-country-Netherlands', 'goldSilverRatio')).toContainText('0.75');
    });

    test.eachFramework('Year sub-groups recompute the ratio from their own leaves', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Expand United States to reveal its year sub-groups. Each year recomputes the ratio from
        // its own leaves: 2008 => gold 127 / silver 109 => 1.17, total sum 317.
        await agIdFor.autoGroupContracted('row-group-country-United States').click();

        const yearRow = page
            .locator('.ag-row')
            .filter({ has: page.locator('.ag-group-value', { hasText: '2008' }) })
            .first();
        await expect(yearRow.locator('[col-id="goldSilverRatio"]')).toContainText('1.17');
        await expect(yearRow.locator('[col-id="total"]')).toContainText('317');
    });
});
