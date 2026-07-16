import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom detail panel renders once per pinned section', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered expands the row with id '1'. Because embedFullWidthRows is combined
        // with a custom Detail Panel, the panel is rendered three times, once for each scrollable
        // section: pinned left, centre and pinned right.
        const customDetails = page.locator('.custom-detail');
        await expect(customDetails).toHaveCount(3);

        // The custom renderer prints its params.pinned value ('left'/'right') or 'center'.
        const texts = await customDetails.allInnerTexts();
        expect(texts.map((t) => t.trim()).sort()).toEqual(['center', 'left', 'right']);
    });
});
