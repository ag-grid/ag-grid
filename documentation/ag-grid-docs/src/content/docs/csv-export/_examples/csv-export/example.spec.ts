import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Standard export writes quoted grid data to the preview', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByText('Show CSV export content text').click();

        const csv = await page.locator('#csvResult').inputValue();
        // Default export capitalises headers and wraps every value in double quotes.
        expect(csv).toContain('"Make","Model","Price"');
        expect(csv).toContain('"Toyota","Celica","35000"');
        expect(csv).toContain('"Ford","Mondeo","32000"');
        expect(csv).toContain('"Porsche","Boxster","72000"');
    });
});
