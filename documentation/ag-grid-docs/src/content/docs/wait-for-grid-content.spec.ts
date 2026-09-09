import { expect, test } from '@playwright/test';
import { waitForGridContent } from '@utils/grid/test/remoteGridapi';

/** A hidden `.ag-cell` that precedes the visible no-rows overlay in DOM order. */
const HIDDEN_CELL_BEFORE_NO_ROWS_OVERLAY = `
    <div class="ag-cell" style="display: none">stale cell</div>
    <div class="ag-overlay-no-rows-center">No Rows To Show</div>
`;

test.describe('waitForGridContent', () => {
    test('resolves on a visible overlay preceded by a hidden cell', async ({ page }) => {
        page.setDefaultTimeout(5_000);
        await page.setContent(HIDDEN_CELL_BEFORE_NO_ROWS_OVERLAY);
        await waitForGridContent(page);
    });

    test('waits until an accepted element becomes visible', async ({ page }) => {
        page.setDefaultTimeout(5_000);
        await page.setContent(`<div class="ag-cell" style="display: none">pending</div>`);
        await page.evaluate(() => {
            setTimeout(() => {
                document.querySelector<HTMLElement>('.ag-cell')!.style.display = '';
            }, 500);
        });
        await waitForGridContent(page);
        await expect(page.locator('.ag-cell')).toBeVisible();
    });
});
