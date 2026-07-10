import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders the fetched space-mission data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First record from space-mission-data.json.
        await expect(agIdFor.cell('0', 'mission')).toContainText('CRS SpX-25');
        await expect(agIdFor.cell('0', 'company')).toContainText('SpaceX');
        await expect(agIdFor.cell('0', 'rocket')).toContainText('Falcon 9 Block 5');
    });

    test.eachFramework('sorting a column updates the header sort state', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const priceHeader = agIdFor.headerCell('price');
        await priceHeader.click();
        await expect(priceHeader).toHaveAttribute('aria-sort', 'ascending');

        await page.waitForTimeout(300); // avoid the successive clicks registering as a double-click
        await priceHeader.click();
        await expect(priceHeader).toHaveAttribute('aria-sort', 'descending');
    });
});
