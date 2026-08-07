import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('cache blocks load on demand as the grid is scrolled', async ({ page }) => {
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // First block is fetched from the server on demand.
        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(dataRow(0).locator('[col-id="id"]')).toContainText('0');

        // Scrolling down forces a later block to be fetched (its cache block enters the
        // loading state, showing a placeholder) which then resolves to real data.
        const viewport = page.locator('.ag-grid-viewport');
        const scrollToDeepRows = () =>
            viewport.evaluate((el) => {
                el.scrollTop = 6000;
            });

        // A scroll issued while the viewport is still sizing does not move it, and then no block is
        // ever fetched. Retry until it takes - the loading state itself cannot be retried around,
        // since it is transient and re-scrolling to the same offset fetches nothing new.
        await expect(async () => {
            await scrollToDeepRows();
            await expect(viewport).not.toHaveJSProperty('scrollTop', 0, { timeout: 1000 });
        }).toPass();

        await expect(page.locator('.ag-row-loading').first()).toBeVisible({ timeout: 3000 });
        await expect(page.locator('.ag-row-loading')).toHaveCount(0, { timeout: 10000 });

        const readDeepRowIndex = () =>
            page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('.ag-row')) as HTMLElement[];
                const deep = rows
                    .map((r) => Number(r.getAttribute('row-index')))
                    .filter((i) => Number.isFinite(i) && i >= 100)
                    .sort((a, b) => a - b);
                return deep[0];
            });

        // The scrolled-to block resolves asynchronously, so re-scroll on each attempt: a load that
        // lands after the rows were read leaves nothing deep rendered for a single read to find.
        let renderedIndex = -1;
        await expect(async () => {
            await scrollToDeepRows();
            renderedIndex = (await readDeepRowIndex()) ?? -1;
            expect(renderedIndex).toBeGreaterThanOrEqual(100);
        }).toPass();
        await expect(dataRow(renderedIndex).locator('[col-id="id"]')).toContainText(String(renderedIndex));
        await expect(dataRow(renderedIndex).locator('[col-id="athlete"]')).not.toBeEmpty();
    });
});
