import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('skipColumnGroupHeaders toggles the group header row', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The example starts with "Skip Column Group Headers" checked, so no group header row.
        await page.getByText('Show CSV export content text').click();
        let csv = await page.locator('#csvResult').inputValue();
        expect(csv).toContain('"Make","Model","Price"');
        expect(csv).not.toContain('"Brand"');

        // Unchecking it exports the group header row above the column headers.
        await page.locator('#columnGroups').uncheck();
        await page.getByText('Show CSV export content text').click();
        csv = await page.locator('#csvResult').inputValue();
        expect(csv).toContain('"Brand","","Value"');
        expect(csv).toContain('"Make","Model","Price"');
    });

    test.eachFramework('skipColumnHeaders removes the column header row', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#skipHeader').check();
        await page.getByText('Show CSV export content text').click();

        const csv = await page.locator('#csvResult').inputValue();
        expect(csv).not.toContain('"Make","Model","Price"');
        // Data rows remain.
        expect(csv).toContain('"Toyota","Celica","35000"');
    });
});
