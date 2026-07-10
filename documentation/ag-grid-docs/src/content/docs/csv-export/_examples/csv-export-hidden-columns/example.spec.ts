import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Hidden columns are excluded by default', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByText('Show CSV export content text').click();

        const csv = await page.locator('#csvResult').inputValue();
        // Only the visible columns are exported.
        expect(csv).toContain('"Athlete","Country","Sport","Total"');
        expect(csv).toContain('"Eamon Sullivan","Australia","Swimming","3"');
        expect(csv).not.toContain('"Gold"');
        expect(csv).not.toContain('"Bronze"');
    });

    test.eachFramework('allColumns includes the hidden columns', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#allColumns').check();
        await page.getByText('Show CSV export content text').click();

        const csv = await page.locator('#csvResult').inputValue();
        // The hidden gold, silver and bronze columns are now part of the export.
        expect(csv).toContain('"Athlete","Country","Sport","Gold","Silver","Bronze","Total"');
        expect(csv).toContain('"Eamon Sullivan","Australia","Swimming","0","","1","3"');
    });
});
