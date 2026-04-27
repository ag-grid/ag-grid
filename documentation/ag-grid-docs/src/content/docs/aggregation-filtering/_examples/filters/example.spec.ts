import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const usRowId = 'row-group-country-United States';
        const goldCell = agIdFor.cell(usRowId, 'gold');

        await expect(agIdFor.autoGroupCell(usRowId)).toContainText('United States', { useInnerText: true });
        await expect(goldCell).toContainText('139');

        // Enable suppressAggFilteredOnly to include unfiltered rows in aggregations
        await page.locator('#suppressAggFilteredOnly').click();
        await expect(goldCell).toContainText('552');
    });
});
