import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const isInShadowRoot = (el: Element) => el.getRootNode() instanceof ShadowRoot;

// JavaScript only - the framework wrappers do not create the grid through `createGrid`, which applies `enableShadowDom`.
test.agExample(import.meta, () => {
    for (const frameworkTest of [test.typescript, test.vanilla]) {
        frameworkTest('renders the grid in the page DOM by default', async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            expect(await page.locator('#myGrid .ag-root-wrapper').evaluate(isInShadowRoot)).toBe(false);
        });

        frameworkTest('checking enableShadowDom recreates the grid in a shadow root', async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await page.locator('#enableShadowDom').check();

            await expect(page.locator('#myGrid .ag-row').first()).toBeVisible();
            expect(await page.locator('#myGrid .ag-root-wrapper').evaluate(isInShadowRoot)).toBe(true);
        });
    }
});
