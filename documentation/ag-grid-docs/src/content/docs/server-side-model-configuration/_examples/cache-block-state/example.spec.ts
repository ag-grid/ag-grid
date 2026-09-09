import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('cache blocks load on demand as the grid is scrolled', async ({ page }) => {
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // First block is fetched from the server on demand.
        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(dataRow(0).locator('[col-id="id"]')).toContainText('0');

        // Scrolling down forces a later block to be fetched from the server, which then resolves to
        // real data.
        // Qualified with the layout class the shared scroll helper uses: an unqualified
        // `.ag-grid-viewport` can match more than one element, and the scroll then goes to the wrong one.
        const viewport = page.locator('.ag-grid-viewport.ag-layout-normal');
        const scrollToDeepRows = () =>
            viewport.evaluate((el) => {
                el.scrollTop = 6000;
            });

        // A scroll issued while the viewport is still sizing does not move it, and then no block is
        // ever fetched. Retry until it takes.
        await expect(async () => {
            await scrollToDeepRows();
            await expect(viewport).not.toHaveJSProperty('scrollTop', 0, { timeout: 1000 });
        }).toPass();

        // The transient `.ag-row-loading` placeholder is deliberately not asserted here: no timeout
        // value makes it reliable, since a longer one makes it likelier the state has already
        // resolved and a shorter one makes the poll likelier to miss it. Asserting it would need an
        // event-based signal (for example `blockLoadDebounceMillis` on the example) or a mutation
        // observer, not a wall-clock window. The re-scroll block below covers what this test exists
        // for: the deep cache block arrives with real data.

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
        //
        // The index and every assertion about it must come from the *same* attempt. The row count keeps
        // growing while blocks arrive (`lastRow` is unknown until the final block), so the clamped
        // `scrollTop = 6000` lands deeper on each attempt, and at `maxBlocksInCache: 2` a block read on
        // an earlier attempt can have been purged by the time it is asserted. Reading the index inside
        // the retry and asserting outside it therefore asserts against a grid that has moved on - which
        // is the failure this spec had (webkit merely lost the race most often). The inner per-attempt
        // timeouts are well below the 20s `expect.timeout`, so a stale attempt costs one retry.
        await expect(async () => {
            await scrollToDeepRows();
            const renderedIndex = (await readDeepRowIndex()) ?? -1;
            expect(renderedIndex).toBeGreaterThanOrEqual(100);
            const deepRow = dataRow(renderedIndex);
            await expect(deepRow.locator('[col-id="id"]')).toContainText(String(renderedIndex), {
                timeout: 2000,
            });
            await expect(deepRow.locator('[col-id="athlete"]')).not.toBeEmpty({ timeout: 2000 });
        }).toPass();
    });
});
