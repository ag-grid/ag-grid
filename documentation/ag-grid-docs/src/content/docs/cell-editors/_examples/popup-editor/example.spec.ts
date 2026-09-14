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

    // An inline editor replaces the cell contents while it is active.
    test.eachFramework('the inline editor replaces the cell contents', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'mood');
        await expect(cell.locator('.mood-renderer')).toBeVisible();

        await cell.dblclick();
        await expect(cell.locator('.mood')).toBeVisible();
        await expect(cell.locator('.mood-renderer')).toHaveCount(0);
    });

    // The inline editor commits the same way as the popup one.
    test.eachFramework('selecting a mood inline updates the cell', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'mood');
        await expect(cell.locator('img')).toHaveAttribute('src', /happy\.png/);

        await cell.dblclick();
        await cell.locator('.mood img').nth(1).click();

        await expect(cell.locator('img')).toHaveAttribute('src', /sad\.png/);
    });

    // MoodEditor handles the left/right arrow keys itself instead of letting the grid navigate.
    test.eachFramework('arrow keys move the selection inside the editor', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'mood_1');
        await cell.dblclick();

        const popupEditor = page.locator('.ag-popup .mood').first();
        await expect(popupEditor).toBeVisible();
        // Row 0 is Happy, so the happy smiley starts selected.
        await expect(popupEditor.locator('img.selected')).toHaveAttribute('src', /happy\.png/);

        await page.keyboard.press('ArrowRight');
        await expect(popupEditor.locator('img.selected')).toHaveAttribute('src', /sad\.png/);

        await page.keyboard.press('ArrowLeft');
        await expect(popupEditor.locator('img.selected')).toHaveAttribute('src', /happy\.png/);

        await page.keyboard.press('Escape');
    });

    // The default popup position places the editor over the cell.
    test.eachFramework('the popup editor overlays the cell', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'mood_1');
        const cellBox = await cell.boundingBox();

        await cell.dblclick();
        const popupEditor = page.locator('.ag-popup .mood').first();
        await expect(popupEditor).toBeVisible();

        const popupBox = await popupEditor.boundingBox();
        expect(popupBox!.y).toBeLessThan(cellBox!.y + cellBox!.height);

        await page.keyboard.press('Escape');
    });

    // cellEditorPopupPosition: 'under' places the editor below the cell instead.
    test.eachFramework('the third column opens its popup under the cell', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'mood_2');
        const cellBox = await cell.boundingBox();

        await cell.dblclick();
        const popupEditor = page.locator('.ag-popup .mood').first();
        await expect(popupEditor).toBeVisible();

        const popupBox = await popupEditor.boundingBox();
        expect(popupBox!.y).toBeGreaterThan(cellBox!.y + cellBox!.height - 5);

        await page.keyboard.press('Escape');
        await expect(page.locator('.ag-popup .mood')).toHaveCount(0);
    });
});
