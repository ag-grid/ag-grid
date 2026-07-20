import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// Peru, France and Italy render as Full Width rows via a custom component; the other countries
// are normal rows with name/continent/language columns. The full-width component highlights
// matches itself and getFindMatches reports how many matches its text contains (e.g. the
// "Sample Text in a Paragraph" and latin paragraphs). Find is provided via the toolbar.

test.agExample(import.meta, () => {
    const findInput = (page: any) => page.locator('.ag-toolbar-find input');
    const matchCount = (page: any) => page.locator('.ag-toolbar-find-match-count');
    const findButtons = (page: any) => page.locator('.ag-toolbar-find-button');

    test.eachFramework('Matches a value in a normal (non full-width) row', async ({ page }) => {
        await ensureGridReady(page);

        // Spain is a normal row rendered through the standard columns.
        await findInput(page).fill('Spain');
        await expect(page.locator('[col-id="name"] mark.ag-find-match').first()).toBeVisible();
    });

    test.eachFramework('Matches text inside the full-width component', async ({ page }) => {
        await ensureGridReady(page);

        // "Sample Text in a Paragraph" only exists inside the full-width component's markup,
        // reached via getFindMatches / findGetParts.
        await findInput(page).fill('Sample');
        await expect(page.locator('mark.ag-find-match').filter({ hasText: 'Sample' }).first()).toBeVisible();
    });

    test.eachFramework('Next and Previous move the active match', async ({ page }) => {
        await ensureGridReady(page);

        await findInput(page).fill('Sample');
        await expect(page.locator('mark.ag-find-match').first()).toBeVisible();

        await findInput(page).press('Enter');
        await expect(matchCount(page)).toContainText('1/');
        await expect(page.locator('mark.ag-find-active-match')).toHaveCount(1);

        await findButtons(page).nth(1).click();
        await expect(matchCount(page)).toContainText('2/');

        await findButtons(page).nth(0).click();
        await expect(matchCount(page)).toContainText('1/');
    });
});
