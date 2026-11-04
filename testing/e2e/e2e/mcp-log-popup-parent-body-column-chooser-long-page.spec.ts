/**
 * Issue: with `popupParent` set to `document.body` on a page taller than the viewport, the Column Chooser dialog opens
 * far below the visible area.
 *
 * Setup: the grid (300px high) is followed by a 3000px tall spacer, so the page is much longer than the 720px viewport.
 * The page is not scrolled. `popupParent` is `document.body`, and `api.showColumnChooser()` is called.
 *
 * Expected: the dialog is shown within the viewport. The `showColumnChooser` API documentation says it shows the column
 * chooser, and the popupParent docs say to simply set the popup parent to the document body in most cases, so a call
 * should result in a dialog the user can see.
 *
 * Actual: the dialog is centred in the height of the whole page rather than the viewport, so its top is roughly
 * 1500px down the document, outside the viewport. The window does not scroll, so the call appears to do nothing.
 *
 * Reported on: not reported; found by an area review of popup positioning with popupParent.
 *
 * Source: found by an area review of Popup positioning with popupParent for AG-18665, prompted by the searches
 * "Column chooser dialog clipped or mispositioned with popupParent" and "Column chooser dialog is clipped or
 * mispositioned relative to popupParent".
 */
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test('column chooser opened with popupParent document.body on a long page is within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const { withApi } = await mountGrid(page, {
        enterprise: true,
        height: 300,
        options: () => ({
            popupParent: document.body,
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ a: 1, b: 1 }],
        }),
    });

    await page.evaluate(() => {
        const spacer = document.createElement('div');
        spacer.style.height = '3000px';
        document.body.append(spacer);
    });

    await withApi((api) => api.showColumnChooser());

    const dialog = page.locator('.ag-dialog');
    await expect(dialog).toBeAttached();
    const viewportHeight = page.viewportSize()!.height;
    await expect
        .poll(async () => (await dialog.boundingBox())!.y, { message: 'dialog top should be within the viewport' })
        .toBeLessThan(viewportHeight);
});
