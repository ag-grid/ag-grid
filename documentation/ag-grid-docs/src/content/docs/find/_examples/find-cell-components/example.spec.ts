import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// The Year column uses a custom cell component that renders "Year is {value}" and highlights
// Find matches itself (reusing ag-find-match / ag-find-active-match). getFindText makes Find
// search within that "Year is ..." text even though it is not the raw cell value.
// The example starts with findSearchValue 'e' and calls findNext() on first render.

test.agExample(import.meta, () => {
    const findInput = (page: any) => page.locator('.ag-toolbar-find input');

    test.eachFramework('Initial search highlights matches with an active match', async ({ page }) => {
        await ensureGridReady(page);

        // findSearchValue 'e' plus findNext() on first render => matches present and one active.
        await expect(page.locator('mark.ag-find-match').first()).toBeVisible();
        await expect(page.locator('mark.ag-find-active-match')).toHaveCount(1);
    });

    test.eachFramework('getFindText lets Find match the custom Year text', async ({ page }) => {
        await ensureGridReady(page);

        // "Year is ..." only exists via getFindText on the Year column's custom component.
        await findInput(page).fill('Year is 20');

        // Matches appear in the Year column's custom cells.
        await expect(page.locator('[col-id="year"] mark.ag-find-match').first()).toBeVisible();
        // The Athlete column has no such text, so it shows no matches.
        await expect(page.locator('[col-id="athlete"] mark.ag-find-match')).toHaveCount(0);
    });
});
