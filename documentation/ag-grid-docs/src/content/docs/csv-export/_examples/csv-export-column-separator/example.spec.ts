import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Default separator is a comma', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByText('Show CSV export content text').click();

        const csv = await page.locator('#csvResult').inputValue();
        expect(csv).toContain('"Make","Model","Price"');
        expect(csv).toContain('"Toyota","Celica","35000"');
    });

    test.eachFramework('columnSeparator switches the delimiter', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#columnSeparator').selectOption('|');
        await page.getByText('Show CSV export content text').click();
        let csv = await page.locator('#csvResult').inputValue();
        expect(csv).toContain('"Make"|"Model"|"Price"');
        expect(csv).toContain('"Toyota"|"Celica"|"35000"');

        await page.locator('#columnSeparator').selectOption('tab');
        await page.getByText('Show CSV export content text').click();
        csv = await page.locator('#csvResult').inputValue();
        expect(csv).toContain('"Make"\t"Model"\t"Price"');
        expect(csv).toContain('"Toyota"\t"Celica"\t"35000"');
    });
});
