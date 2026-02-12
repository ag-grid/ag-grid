import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const bronzeHeader = agIdFor.headerCell('bronze');
        const silverHeader = agIdFor.headerCell('silver');
        const goldHeader = agIdFor.headerCell('gold');
        const totalHeader = agIdFor.headerCell('total');

        // By default, agg func names are shown in headers
        await expect(bronzeHeader).toContainText('max(Bronze)');
        await expect(silverHeader).toContainText('max(Silver)');
        await expect(goldHeader).toContainText('max(Gold)');
        await expect(totalHeader).toContainText('avg(Total)');

        // Enable suppressAggFuncInHeader (hide agg func names)
        await page.locator('#suppressAggFuncInHeader').click();
        await expect(bronzeHeader).toContainText('Bronze');
        await expect(bronzeHeader).not.toContainText('max');
        await expect(silverHeader).toContainText('Silver');
        await expect(silverHeader).not.toContainText('max');
        await expect(goldHeader).toContainText('Gold');
        await expect(goldHeader).not.toContainText('max');
        await expect(totalHeader).toContainText('Total');
        await expect(totalHeader).not.toContainText('avg');

        // Disable suppressAggFuncInHeader (show agg func names again)
        await page.locator('#suppressAggFuncInHeader').click();
        await expect(bronzeHeader).toContainText('max(Bronze)');
        await expect(silverHeader).toContainText('max(Silver)');
        await expect(goldHeader).toContainText('max(Gold)');
        await expect(totalHeader).toContainText('avg(Total)');
    });
});
