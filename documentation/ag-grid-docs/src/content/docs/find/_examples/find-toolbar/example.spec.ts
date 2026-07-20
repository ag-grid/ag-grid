import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// Find is provided via the Quick Access Toolbar (agFindToolbarItem). The toolbar renders a
// search input, a "current/total" match count label, and previous/next navigation buttons.
// Matched cell text is wrapped in <mark class="ag-find-match">; the active match additionally
// gets the ag-find-active-match class.

test.agExample(import.meta, () => {
    const findInput = (page: any) => page.locator('.ag-toolbar-find input');
    const matchCount = (page: any) => page.locator('.ag-toolbar-find-match-count');
    const findButtons = (page: any) => page.locator('.ag-toolbar-find-button');

    test.eachFramework('Typing in the toolbar highlights matching cells', async ({ page }) => {
        await ensureGridReady(page);

        await findInput(page).fill('Michael');

        // Matched text is wrapped in mark.ag-find-match; before navigating the active index is 0.
        await expect(page.locator('mark.ag-find-match').first()).toBeVisible();
        await expect(matchCount(page)).toHaveText(/^\s*0\/\d+\s*$/);
        // No match is active until the user navigates.
        await expect(page.locator('mark.ag-find-active-match')).toHaveCount(0);
    });

    test.eachFramework('Next and Previous move the active match', async ({ page }) => {
        await ensureGridReady(page);

        await findInput(page).fill('Michael');
        await expect(page.locator('mark.ag-find-match').first()).toBeVisible();

        // First navigation activates match 1 (anchored so "11/", "21/" etc. cannot pass).
        await findInput(page).press('Enter');
        await expect(matchCount(page)).toHaveText(/^\s*1\/\d+\s*$/);
        await expect(page.locator('mark.ag-find-active-match')).toHaveCount(1);

        // Next advances to match 2.
        await findButtons(page).nth(1).click();
        await expect(matchCount(page)).toHaveText(/^\s*2\/\d+\s*$/);
        await expect(page.locator('mark.ag-find-active-match')).toHaveCount(1);

        // Previous returns to match 1.
        await findButtons(page).nth(0).click();
        await expect(matchCount(page)).toHaveText(/^\s*1\/\d+\s*$/);
    });
});
