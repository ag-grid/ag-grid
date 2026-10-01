import { ensureGridReady, expect, expectRowIdAtIndex, test, waitForGridContent } from '@utils/grid/test-utils';

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

    test.eachFramework('only the edited row changes, and row ids stay stable', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Docs: this example 'uses Transactions to update the data after the edit rather than
        // updating the whole Row Data'. getRowId keeps the transaction targeted at one row.
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

        // The update transaction touches only the edited row; the neighbour and row ids are unchanged.
        await expect(neighbour).toHaveText(neighbourBefore!);
        await expectRowIdAtIndex(page, 0, '0');
        await expectRowIdAtIndex(page, 1, '1');
    });
});
