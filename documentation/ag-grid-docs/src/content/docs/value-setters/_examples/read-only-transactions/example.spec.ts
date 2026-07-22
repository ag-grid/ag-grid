import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // readOnlyEdit: true; the app listens for cellEditRequest and applies an update transaction
    // (applyTransaction with getRowId), so the edit is applied. Row 0: athlete 'Michael Phelps'.

    test.eachFramework('editing a cell persists via an update transaction', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const athleteCell = agIdFor.cell('0', 'athlete');
        await expect(athleteCell).toContainText('Michael Phelps');

        await athleteCell.dblclick();
        const editor = athleteCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('Fred');
        await page.keyboard.press('Enter');

        // cellEditRequest handler builds a new row object and calls api.applyTransaction({ update }).
        await expect(editor).toHaveCount(0);
        await expect(athleteCell).toContainText('Fred');
    });
});
