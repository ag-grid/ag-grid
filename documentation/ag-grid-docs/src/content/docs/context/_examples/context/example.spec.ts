import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Report price uses the reporting currency from context', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Product 3 is priced in GBP 429. Price Local shows the raw local price.
        await expect(agIdFor.cell('2', 'price')).toContainText('£429.00');

        // Report Price converts to the context reporting currency (default EUR):
        // 429 * exchangeRates.EUR.GBP (0.72) = 308.88 => €308.88
        await expect(agIdFor.cell('2', 'price_1')).toContainText('€308.88');

        // Header of the report column reflects ctx.reportingCurrency via headerValueGetter.
        await expect(agIdFor.headerCell('price_1')).toContainText('EUR');
    });

    test.eachFramework('Changing the reporting currency updates cells and header', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.selectOption('#currency', 'USD');

        // Header value getter now shows the new reporting currency.
        await expect(agIdFor.headerCell('price_1')).toContainText('USD');

        // Product 3 GBP 429 * exchangeRates.USD.GBP (0.67) = 287.43 => $287.43
        await expect(agIdFor.cell('2', 'price_1')).toContainText('$287.43');

        // Local price column is unaffected by the reporting currency.
        await expect(agIdFor.cell('2', 'price')).toContainText('£429.00');
    });
});
