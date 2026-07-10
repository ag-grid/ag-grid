import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Three columns all bound to 'mood'; duplicate fields get colIds mood, mood_1, mood_2.
    // Row 0 mood is 'Happy'.
    test.eachFramework('renders the mood value across the three columns', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'mood').locator('img')).toBeVisible();
        await expect(agIdFor.cell('0', 'mood_1').locator('img')).toBeVisible();
        await expect(agIdFor.cell('0', 'mood_2').locator('img')).toBeVisible();
    });

    test.eachFramework('inline editor opens inside the cell', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'mood');
        await cell.dblclick();
        // Inline: the editor lives inside the cell, not in a popup.
        await expect(cell.locator('.mood')).toBeVisible();
    });

    test.eachFramework('popup editor opens over the cell', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'mood_1');
        await cell.dblclick();
        await expect(page.locator('.ag-popup .mood').first()).toBeVisible();

        // close the popup editor before the test ends so it is torn down cleanly
        await page.keyboard.press('Escape');
        await expect(page.locator('.ag-popup .mood')).toHaveCount(0);
    });

    test.eachFramework('selecting a mood in the popup updates the cell', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'mood_1');
        // Initial render is the happy smiley.
        await expect(cell.locator('img')).toHaveAttribute('src', /happy\.png/);

        await cell.dblclick();
        const popupEditor = page.locator('.ag-popup .mood').first();
        await expect(popupEditor).toBeVisible();
        // Click the sad smiley (second image) which commits the value.
        await popupEditor.locator('img').nth(1).click();

        await expect(cell.locator('img')).toHaveAttribute('src', /sad\.png/);
    });
});
