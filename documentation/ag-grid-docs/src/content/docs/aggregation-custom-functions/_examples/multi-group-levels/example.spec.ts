import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Range aggregates correctly across two group levels', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Rows are grouped by country then year. The custom `range` returns a RangeResult wrapper
        // (toString => toFixed(2)) so the country level can recompute the true leaf spread by
        // combining the min/max carried on each year sub-group — not the range of child ranges.
        // United States leaves span total 1..8 => range 7. Netherlands 1..4 => 3.
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States', {
            useInnerText: true,
        });
        await expect(agIdFor.cell('row-group-country-United States', 'total')).toContainText('7');
        await expect(agIdFor.cell('row-group-country-Netherlands', 'total')).toContainText('3');

        // Expand the United States group to reveal the year sub-groups.
        await agIdFor.autoGroupContracted('row-group-country-United States').click();

        // The 2008 sub-group's own leaves also span total 1..8 => range 7.
        const yearRow = page
            .locator('.ag-row')
            .filter({ has: page.locator('.ag-group-value', { hasText: '2008' }) })
            .first();
        await expect(yearRow.locator('[col-id="total"]')).toContainText('7');
    });
});
