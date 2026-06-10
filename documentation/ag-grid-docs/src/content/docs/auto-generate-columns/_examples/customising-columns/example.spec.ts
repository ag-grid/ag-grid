import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // Auto-generated headers
        await expect(agIdFor.headerCell('product')).toBeVisible();
        await expect(agIdFor.headerCell('region')).toBeVisible();
        await expect(agIdFor.headerCell('profit')).toBeVisible();
        await expect(agIdFor.headerCell('profitMargin')).toBeVisible();

        // Profit columns display with £ currency formatting via currencyColumn type
        await expect(agIdFor.cell('0', 'profit')).toContainText('£12,500');
        await expect(agIdFor.cell('0', 'profitMargin')).toContainText('£0.15');

        // Non-profit columns display without formatting
        await expect(agIdFor.cell('0', 'product')).toContainText('Widget A');
        await expect(agIdFor.cell('0', 'region')).toContainText('North');
    });
});
