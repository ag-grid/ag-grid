import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// findOptions here start with caseSensitive: true and currentPageOnly: true. The data is grouped
// by sport (so the auto-group column shows sport names) and paginated 5 rows per page. Checkboxes
// toggle each option live. The first group is Swimming (Michael Phelps is the first data row).

test.agExample(import.meta, () => {
    const findInput = (page: any) => page.locator('.ag-toolbar-find input');
    const matchCount = (page: any) => page.locator('.ag-toolbar-find-match-count');

    // The Vue example transform drops the `id` from the control checkboxes, so target them by their
    // label text instead — this resolves consistently across every framework.
    const optionCheckbox = (page: any, label: string) =>
        page.locator('label', { hasText: label }).locator('input[type="checkbox"]');

    test.eachFramework('caseSensitive controls whether casing must match', async ({ page }) => {
        await ensureGridReady(page);

        // Exact casing matches the "Swimming" group.
        await findInput(page).fill('Swimming');
        await expect(page.locator('mark.ag-find-match').first()).toBeVisible();

        // While case sensitive, the lower-case term finds nothing.
        await findInput(page).fill('swimming');
        await expect(matchCount(page)).toHaveText('0/0');
        await expect(page.locator('mark.ag-find-match')).toHaveCount(0);

        // Turning off case sensitivity makes the same term match again.
        await optionCheckbox(page, 'caseSensitive').uncheck();
        await expect(page.locator('mark.ag-find-match').first()).toBeVisible();
    });

    test.eachFramework('currentPageOnly limits matches to the visible page', async ({ page }) => {
        await ensureGridReady(page);

        await findInput(page).fill('i');

        // With currentPageOnly on, only matches on the first page are counted.
        let pageOnlyTotal = 0;
        await expect(async () => {
            const [, total] = (await matchCount(page).innerText()).split('/');
            pageOnlyTotal = Number(total);
            expect(pageOnlyTotal).toBeGreaterThan(0);
        }).toPass();

        // Turning it off searches every page, yielding strictly more matches.
        await optionCheckbox(page, 'currentPageOnly').uncheck();
        await expect(async () => {
            const [, total] = (await matchCount(page).innerText()).split('/');
            expect(Number(total)).toBeGreaterThan(pageOnlyTotal);
        }).toPass();
    });
});
