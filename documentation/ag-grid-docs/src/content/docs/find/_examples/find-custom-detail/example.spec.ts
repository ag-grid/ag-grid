import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// Master/detail with a Custom Detail component that renders "My Custom Detail" and highlights
// matches itself. findOptions.searchDetail is true and getFindMatches reports the detail's match
// count. The first master row (Nora Thomas) is expanded on first render.

test.agExample(import.meta, () => {
    const findInput = (page: any) => page.locator('.ag-toolbar-find input');
    const matchCount = (page: any) => page.locator('.ag-toolbar-find-match-count');
    const findButtons = (page: any) => page.locator('.ag-toolbar-find-button');

    test.eachFramework('Matches values in the master grid', async ({ page }) => {
        await ensureGridReady(page);

        await findInput(page).fill('Nora');
        await expect(page.locator('mark.ag-find-match').filter({ hasText: 'Nora' }).first()).toBeVisible();
    });

    test.eachFramework('Matches text inside the expanded custom detail', async ({ page }) => {
        await ensureGridReady(page);

        // "My Custom Detail" only exists in the custom detail component of the expanded first row.
        await findInput(page).fill('Custom Detail');
        await expect(page.locator('mark.ag-find-match').filter({ hasText: 'Custom Detail' }).first()).toBeVisible();
    });

    test.eachFramework('Navigating moves the active match across detail rows', async ({ page }) => {
        await ensureGridReady(page);

        // Each master row's custom detail contributes a match via getFindMatches.
        await findInput(page).fill('Custom');
        await expect(matchCount(page)).not.toHaveText('0/0');

        await findInput(page).press('Enter');
        await expect(matchCount(page)).toContainText('1/');
        await expect(page.locator('mark.ag-find-active-match')).toHaveCount(1);

        await findButtons(page).nth(1).click();
        await expect(matchCount(page)).toContainText('2/');
        await expect(page.locator('mark.ag-find-active-match')).toHaveCount(1);
    });
});
