import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Athlete Mini Filter narrows the list but applies only on Enter', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.floatingFilterButton('athlete').click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        // 'Phelps' is unique to Michael Phelps in the dataset.
        const miniFilter = setFilter.locator('.ag-mini-filter input');
        await miniFilter.pressSequentially('Phelps');

        // Typing narrows the Filter List to matching values...
        const items = setFilter.locator('.ag-set-filter-item');
        await expect(items.filter({ hasText: 'Michael Phelps' })).toHaveCount(1);
        await expect(items.filter({ hasText: 'Michael Johnson' })).toHaveCount(0);

        // ...but the grid itself is not filtered until Enter is pressed.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        expect(await page.locator('.ag-row [col-id="athlete"]').count()).toBeGreaterThan(1);

        // Pressing Enter applies the filter to the displayed (matching) values.
        await miniFilter.focus();
        await page.keyboard.press('Enter');

        // Only Michael Phelps rows remain (non-matching athletes are removed).
        await expect(page.locator('.ag-row [col-id="athlete"]').filter({ hasText: 'Natalie Coughlin' })).toHaveCount(0);

        await page.keyboard.press('Escape');
        const athleteTexts = await page.locator('.ag-row [col-id="athlete"]').allInnerTexts();
        expect(athleteTexts.length).toBeGreaterThan(0);
        for (const text of athleteTexts) {
            expect(text).toContain('Michael Phelps');
        }
    });

    test.eachFramework('Country Mini Filter applies while typing', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.floatingFilterButton('country').click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter).toBeVisible();

        // applyMiniFilterWhileTyping: true means the grid filters as you type, no Enter needed.
        const miniFilter = setFilter.locator('.ag-mini-filter input');
        await miniFilter.pressSequentially('United States');

        // The grid is filtered while typing: non-matching countries (e.g. Russia) are removed.
        await expect(page.locator('.ag-row [col-id="country"]').filter({ hasText: 'Russia' })).toHaveCount(0);

        await page.keyboard.press('Escape');

        const countryTexts = await page.locator('.ag-row [col-id="country"]').allInnerTexts();
        expect(countryTexts.length).toBeGreaterThan(0);
        for (const text of countryTexts) {
            expect(text).toContain('United States');
        }
    });
});
