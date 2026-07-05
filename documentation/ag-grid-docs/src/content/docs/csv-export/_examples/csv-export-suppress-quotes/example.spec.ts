import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Values are quoted by default', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByText('Show CSV export content text').click();

        const csv = await page.locator('#csvResult').inputValue();
        expect(csv).toContain('"Make","Model","Price"');
        expect(csv).toContain('"Toyota","Celica","35000"');
    });

    test.eachFramework('suppressQuotes writes unquoted values', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#suppressQuotes').check();
        await page.getByText('Show CSV export content text').click();

        const csv = await page.locator('#csvResult').inputValue();
        expect(csv).toContain('Make,Model,Price');
        expect(csv).toContain('Toyota,Celica,35000');
        expect(csv).not.toContain('"Toyota"');
    });
});
