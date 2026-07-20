import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// Nested master/detail grids (3 levels) with findOptions.searchDetail: true. The first master
// row (level 1 - 1) is expanded on first render. getFindMatches reports how many matches live
// inside detail rows so Find can count and auto-expand them when navigating.

test.agExample(import.meta, () => {
    const findInput = (page: any) => page.locator('.ag-toolbar-find input');
    const matchCount = (page: any) => page.locator('.ag-toolbar-find-match-count');

    test.eachFramework('Matches values in the master grid', async ({ page }) => {
        await ensureGridReady(page);

        await findInput(page).fill('level 1 - 2');
        await expect(page.locator('mark.ag-find-match').filter({ hasText: 'level 1 - 2' }).first()).toBeVisible();
    });

    test.eachFramework('Matches values in an expanded detail grid', async ({ page }) => {
        await ensureGridReady(page);

        // The first master row is expanded on load, exposing its "level 2 - 1" detail rows.
        await findInput(page).fill('level 2 - 1');
        await expect(page.locator('mark.ag-find-match').filter({ hasText: 'level 2 - 1' }).first()).toBeVisible();
    });

    test.eachFramework('Navigating to a match inside a collapsed detail expands it', async ({ page }) => {
        await ensureGridReady(page);

        // "level 3 - 1" lives in a nested detail that is not expanded on load; getFindMatches
        // still counts it, and navigating to the active match auto-expands to reveal it.
        await findInput(page).fill('level 3 - 1');
        await expect(matchCount(page)).not.toHaveText('0/0');

        await findInput(page).press('Enter');
        await expect(matchCount(page)).toHaveText(/^\s*1\/\d+\s*$/);
        await expect(page.locator('mark.ag-find-active-match').filter({ hasText: 'level 3 - 1' }).first()).toBeVisible();
    });
});
