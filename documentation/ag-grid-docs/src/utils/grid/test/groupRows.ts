import type { Page } from '@playwright/test';
import { expect } from 'playwright/test';

/** The row whose group cell contains `name`. */
export const groupRow = (page: Page, name: string) =>
    page
        .locator('.ag-row')
        .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
        .first();

/** Clicks a group cell's text - the span rather than the row, so the click cannot land on the chevron. */
export const clickGroupValue = (page: Page, name: string) =>
    page.locator('.ag-group-value').filter({ hasText: name }).first().click();

/** Expands each named group that is still collapsed, leaving already-open ones alone. */
export async function expandGroups(page: Page, names: string[]) {
    for (const name of names) {
        const row = groupRow(page, name);
        await expect(row).toBeVisible();
        const contracted = row.locator('.ag-group-contracted');
        if (await contracted.isVisible()) {
            await contracted.click();
        }
    }
}
