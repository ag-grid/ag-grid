import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('blockLoadDebounceMillis delays block loads then resolves to data', async ({ page }) => {
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // The first block loads (despite the debounce) with real olympic data.
        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(dataRow(0).locator('[col-id="id"]')).toContainText('0');

        // Scroll into a fresh, not-yet-loaded block, which the debounce then fetches.
        const viewport = page.locator('.ag-grid-viewport');
        const scrollToDeepRows = () =>
            viewport.evaluate((el) => {
                el.scrollTop = el.scrollHeight;
            });

        // A scroll issued while the viewport is still sizing does not move it, and then no block is
        // ever fetched. Retry until it takes.
        await expect(async () => {
            await scrollToDeepRows();
            await expect(viewport).not.toHaveJSProperty('scrollTop', 0, { timeout: 1000 });
        }).toPass();

        // The transient `.ag-row-loading` placeholder is deliberately not asserted here: no timeout
        // value makes it reliable, since a longer one makes it likelier the state has already
        // resolved and a shorter one makes the poll likelier to miss it. The `blockLoadDebounceMillis`
        // this example sets widens the window but does not make the state observable — that would
        // need an event-based signal hooked to the block load lifecycle, or a mutation observer,
        // rather than a wall-clock window. The re-scroll block below covers what this test exists
        // for: the debounced deep block resolves to real data.

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
