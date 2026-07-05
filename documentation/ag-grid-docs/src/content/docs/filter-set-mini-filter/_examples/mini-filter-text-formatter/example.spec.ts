import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Accent-insensitive search matches accented values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.floatingFilterButton('athlete').click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        // Searching 'bjorn' matches values containing 'björn' thanks to the textFormatter.
        const miniFilter = setFilter.locator('.ag-mini-filter input');
        await miniFilter.pressSequentially('bjorn');

        // The Filter List narrows to accented 'Björn' values; unrelated names are gone.
        const items = setFilter.locator('.ag-set-filter-item');
        await expect(items.filter({ hasText: 'Björn Ferry' })).toHaveCount(1);
        await expect(items.filter({ hasText: 'Michael Phelps' })).toHaveCount(0);

        // Applying (Enter) filters the grid to only the matched athletes.
        await miniFilter.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('.ag-row [col-id="athlete"]').filter({ hasText: 'Michael Phelps' })).toHaveCount(0);

        await page.keyboard.press('Escape');
        const athleteTexts = await page.locator('.ag-row [col-id="athlete"]').allInnerTexts();
        expect(athleteTexts.length).toBeGreaterThan(0);
        // The formatter strips accents, so both 'Björn ...' and 'Ole Einar Bjørndalen' match 'bjorn'.
        for (const text of athleteTexts) {
            const normalized = text
                .toLowerCase()
                .replace(/[àáâãäå]/g, 'a')
                .replace(/[òóôõøö]/g, 'o');
            expect(normalized).toContain('bjorn');
        }
    });
});
