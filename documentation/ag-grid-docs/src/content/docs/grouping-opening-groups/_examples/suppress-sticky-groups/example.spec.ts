import { ensureGridReady, expect, scrollGridRelative, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // groupDefaultExpanded: 1 opens the first-level country groups.
        await expect(agIdFor.autoGroupExpanded('row-group-country-Australia')).toBeVisible();

        // Pick a top-level country group row that starts inside the viewport. We will scroll it
        // above the top of the viewport while its (year) children remain on screen — this is
        // exactly the condition under which AG Grid would normally render the group row as a
        // sticky header at the top of the viewport.
        const scroller = page.locator('.ag-grid-viewport.ag-layout-normal').first();
        const groupRow = page.locator('[row-id="row-group-country-United States"]');
        await expect(groupRow).toBeVisible();
        const startY = (await groupRow.boundingBox())!.y;
        const viewportTop = (await scroller.boundingBox())!.y;
        expect(startY).toBeGreaterThan(viewportTop);

        // Scroll down far enough that the group row is dragged above the viewport's top edge.
        await scrollGridRelative('element', page, { y: 150 });

        // Control condition: the group row is now demonstrably above the viewport top, while its
        // children still fill the viewport — so without suppression it WOULD be sticky.
        const scrolledY = (await groupRow.boundingBox())!.y;
        expect(scrolledY).toBeLessThan(viewportTop);

        // suppressGroupRowsSticky: true means the group row is NOT pinned as a sticky header —
        // the sticky-top container stays empty even though the sticky condition has been reached.
        await expect(page.locator('.ag-sticky-top .ag-row')).toHaveCount(0);
    });
});
