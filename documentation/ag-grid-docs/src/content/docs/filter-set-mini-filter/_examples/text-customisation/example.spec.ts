import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Mini Filter uses the customised search placeholder', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.floatingFilterButton('athlete').click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        // localeText.searchOoo customises the placeholder text.
        const miniFilter = setFilter.locator('.ag-mini-filter input');
        await expect(miniFilter).toHaveAttribute('placeholder', 'Search values...');

        await page.keyboard.press('Escape');
    });

    test.eachFramework('Customised no-matches message is shown', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.floatingFilterButton('athlete').click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        // A search that matches nothing shows the customised localeText.noMatches message.
        const miniFilter = setFilter.locator('.ag-mini-filter input');
        await miniFilter.fill('zzzzzzzzzz');

        await expect(setFilter.locator('.ag-filter-no-matches')).toContainText('No matches could be found.');

        await page.keyboard.press('Escape');
    });
});
