import type { Page } from 'playwright/test';

/** Dismisses the developer validation overlay, failing if the example did not show it. */
export const dismissValidationOverlay = async (page: Page) => {
    await page.locator('.ag-overlay-error-dismiss').click();
};
