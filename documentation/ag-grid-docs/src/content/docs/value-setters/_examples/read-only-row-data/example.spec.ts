import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // readOnlyEdit: true, but the app listens for cellEditRequest and sets new rowData
    // (immutable store + getRowId), so the edit is applied. Row 0: athlete 'Michael Phelps'.

    test.eachFramework('editing a cell persists once the app updates rowData', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const athleteCell = agIdFor.cell('0', 'athlete');
        await expect(athleteCell).toContainText('Michael Phelps');

        await athleteCell.dblclick();
        const editor = athleteCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('Fred');
        await page.keyboard.press('Enter');

        // cellEditRequest handler rebuilds the immutable store and calls setGridOption('rowData').
        await expect(editor).toHaveCount(0);
        await expect(athleteCell).toContainText('Fred');
    });
});
