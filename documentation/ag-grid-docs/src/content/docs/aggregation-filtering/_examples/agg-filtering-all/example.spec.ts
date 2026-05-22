import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-grid-scrolling-container .ag-row[row-id]')).toHaveCount(24);

        const totalFilterInput = agIdFor.numberFilterInstanceInput({ source: 'floating-filter', colId: 'total' });
        await totalFilterInput.fill('609');
        await totalFilterInput.press('Enter');

        const australiaRowId = 'row-group-country-Australia';
        await expect(agIdFor.autoGroupCell(australiaRowId)).toContainText('Australia', { useInnerText: true });
        await expect(agIdFor.rowNode(australiaRowId)).toHaveCount(1);
        await expect(agIdFor.rowNode('row-group-country-United States')).toHaveCount(0);

        // Disable groupAggFiltering
        await page.locator('#groupAggFiltering').click();

        await expect(page.locator('.ag-grid-scrolling-container .ag-row[row-id]')).toHaveCount(0);
    });
});
