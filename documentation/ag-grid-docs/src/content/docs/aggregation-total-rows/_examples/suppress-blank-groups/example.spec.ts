import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        const usGroupId = 'row-group-country-United States';
        const usFooterId = 'rowGroupFooter_row-group-country-United States';

        // Country groups are expanded by default (groupDefaultExpanded: 1)
        // With groupSuppressBlankHeader disabled (default), expanded group rows show blank agg values
        await expect(agIdFor.cell(usGroupId, 'gold')).toHaveText('');
        await expect(agIdFor.cell(usGroupId, 'silver')).toHaveText('');
        await expect(agIdFor.cell(usGroupId, 'bronze')).toHaveText('');

        // Year sub-groups (collapsed) still show their aggregation values
        const usYear2000Id = 'row-group-country-United States-year-2000';
        await expect(agIdFor.cell(usYear2000Id, 'gold')).toContainText('130');
        await expect(agIdFor.cell(usYear2000Id, 'silver')).toContainText('61');
        await expect(agIdFor.cell(usYear2000Id, 'bronze')).toContainText('52');

        // Group footer row shows totals
        await expect(agIdFor.autoGroupCell(usFooterId)).toContainText('Total United States', {
            useInnerText: true,
        });
        await expect(agIdFor.cell(usFooterId, 'gold')).toContainText('552');
        await expect(agIdFor.cell(usFooterId, 'silver')).toContainText('440');
        await expect(agIdFor.cell(usFooterId, 'bronze')).toContainText('320');

        // Enable groupSuppressBlankHeader — expanded group rows now show agg values
        await page.locator('#groupSuppressBlankHeader').click();

        await expect(agIdFor.cell(usGroupId, 'gold')).toContainText('552');
        await expect(agIdFor.cell(usGroupId, 'silver')).toContainText('440');
        await expect(agIdFor.cell(usGroupId, 'bronze')).toContainText('320');

        // Disable groupSuppressBlankHeader — expanded group rows go blank again
        await page.locator('#groupSuppressBlankHeader').click();

        await expect(agIdFor.cell(usGroupId, 'gold')).toHaveText('');
        await expect(agIdFor.cell(usGroupId, 'silver')).toHaveText('');
        await expect(agIdFor.cell(usGroupId, 'bronze')).toHaveText('');
    });
});
