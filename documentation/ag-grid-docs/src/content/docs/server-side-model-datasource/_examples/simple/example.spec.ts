import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('server-side datasource loads the first block and more on scroll', async ({ page }) => {
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // The first block is fetched on demand from the datasource with real olympic data.
        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(dataRow(0).locator('[col-id="country"]')).toContainText('United States');
        await expect(dataRow(0).locator('[col-id="gold"]')).toContainText('8');
        await expect(dataRow(3).locator('[col-id="athlete"]')).toContainText('Natalie Coughlin');

        // The last row is not known up-front, so scroll to the bottom repeatedly to force
        // further blocks to be fetched on demand.
        const deepestRenderedIndex = async () =>
            page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('.ag-row')) as HTMLElement[];
                const indices = rows.map((r) => Number(r.getAttribute('row-index'))).filter((i) => Number.isFinite(i));
                return indices.length ? Math.max(...indices) : -1;
            });

        for (let i = 0; i < 6; i++) {
            await page.locator('.ag-grid-viewport').evaluate((el) => {
                el.scrollTop = el.scrollHeight;
            });
            await expect(page.locator('.ag-row-loading')).toHaveCount(0, { timeout: 10000 });
            if ((await deepestRenderedIndex()) >= 100) {
                break;
            }
        }

        const renderedIndex = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.ag-row')) as HTMLElement[];
            const deep = rows
                .map((r) => Number(r.getAttribute('row-index')))
                .filter((i) => Number.isFinite(i) && i >= 100)
                .sort((a, b) => a - b);
            return deep[0];
        });
        expect(renderedIndex).toBeGreaterThanOrEqual(100);
        await expect(dataRow(renderedIndex).locator('[col-id="athlete"]')).not.toBeEmpty();
        await expect(dataRow(renderedIndex).locator('[col-id="country"]')).not.toBeEmpty();
    });
});
