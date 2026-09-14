import { ensureGridReady, expect, expectRowIdAtIndex, test, waitForGridContent } from '@utils/grid/test-utils';

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

    test.eachFramework('only the edited row changes, and row ids stay stable', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Docs: 'The Row Data has IDs and getRowId is implemented. This allows the grid to only
        // refresh the desired row after new Row Data is set.'
        await expectRowIdAtIndex(page, 0, '0');
        const neighbour = agIdFor.cell('1', 'athlete');
        const neighbourBefore = await neighbour.textContent();

        const logs: string[] = [];
        page.on('console', (m) => logs.push(m.text()));

        const athleteCell = agIdFor.cell('0', 'athlete');
        await athleteCell.dblclick();
        const editor = athleteCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('Fred');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        await expect.poll(() => logs).toContain('onCellEditRequest, updating athlete to Fred');
        await expect(athleteCell).toContainText('Fred');

        // The neighbouring row and the row ids are untouched by the new Row Data.
        await expect(neighbour).toHaveText(neighbourBefore!);
        await expectRowIdAtIndex(page, 0, '0');
        await expectRowIdAtIndex(page, 1, '1');
    });
});
