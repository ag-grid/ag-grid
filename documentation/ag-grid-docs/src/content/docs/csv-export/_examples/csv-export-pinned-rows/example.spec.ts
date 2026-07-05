import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Pinned rows are exported by default', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByText('Show CSV export content text').click();

        const csv = await page.locator('#csvResult').inputValue();
        expect(csv).toContain('"Top Make","Top Model","0"');
        expect(csv).toContain('"Toyota","Celica","35000"');
        expect(csv).toContain('"Bottom Make","Bottom Model","10101010"');
    });

    test.eachFramework('skipPinnedTop and skipPinnedBottom exclude the pinned rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#skipPinnedTop').check();
        await page.getByText('Show CSV export content text').click();
        let csv = await page.locator('#csvResult').inputValue();
        expect(csv).not.toContain('Top Make');
        expect(csv).toContain('"Bottom Make","Bottom Model","10101010"');

        await page.locator('#skipPinnedBottom').check();
        await page.getByText('Show CSV export content text').click();
        csv = await page.locator('#csvResult').inputValue();
        expect(csv).not.toContain('Top Make');
        expect(csv).not.toContain('Bottom Make');
        // Body rows are always exported.
        expect(csv).toContain('"Toyota","Celica","35000"');
    });
});
