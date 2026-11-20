import type { Page } from 'playwright/test';
import { test } from 'playwright/test';

export const ensureGridReady = async (page: Page, gridId: string = '1') => {
    return await test.step(`Ensure grid ${gridId} is ready`, async () => {
        let gridReadyPromise: Promise<void> | null = null;
        if (!gridReadyPromise) {
            // Wait for grid to be visible
            const selector = `[grid-id="${gridId}"]`;
            gridReadyPromise = page.locator(selector).waitFor({ state: 'visible' });
        }
        await gridReadyPromise;

        return true;
    });
};

export async function waitForGridContent(page: Page) {
    await page.locator('.ag-overlay-loading-center').first().waitFor({ state: 'hidden' });
    // `:visible` on each member: `.or(...).first()` takes the first match in DOM order, which could be a hidden leftover cell.
    // Normal cells
    const cellLocator = page.locator('.ag-cell:visible');
    // Grouped cells
    const cellWrapperLocator = page.locator('.ag-cell-wrapper:visible');
    // Full width only cells
    const fullWidthRow = page.locator('.ag-full-width-row:visible');
    // No rows to show
    const noRowsToShowLocator = page.locator('.ag-overlay-no-rows-center:visible');
    await cellLocator
        .or(cellWrapperLocator)
        .or(noRowsToShowLocator)
        .or(fullWidthRow)
        .first()
        .waitFor({ state: 'visible' });
}
