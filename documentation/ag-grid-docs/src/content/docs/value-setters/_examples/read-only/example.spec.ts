import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // readOnlyEdit: true. Editing fires cellEditRequest but the grid never updates the data,
    // so the cell keeps its original value. Row 0: athlete 'Michael Phelps'.

    test.eachFramework('editing a cell does not change the value (read only edit)', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const athleteCell = agIdFor.cell('0', 'athlete');
        await expect(athleteCell).toContainText('Michael Phelps');

        await athleteCell.dblclick();
        const editor = athleteCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('Fred');
        await page.keyboard.press('Enter');

        // The grid discards the edit because readOnlyEdit stops it updating the data.
        await expect(editor).toHaveCount(0);
        await expect(athleteCell).toContainText('Michael Phelps');
        await expect(athleteCell).not.toContainText('Fred');
    });

    test.eachFramework('editing fires a cellEditRequest that the app logs', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Docs: 'The application listens for cellEditRequest event and prints to the console.'
        // Without this the test would also pass if editing were simply disabled.
        const logs: string[] = [];
        page.on('console', (m) => logs.push(m.text()));

        const athleteCell = agIdFor.cell('0', 'athlete');
        await athleteCell.dblclick();
        const editor = athleteCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('Fred');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        await expect.poll(() => logs).toContain('onCellEditRequest, new value = Fred');

        // The banner states the example only logs the request, so the data is never updated.
        await expect(page.getByText('Example only logs cellEditRequests to the console')).toBeVisible();
        await expect(athleteCell).toContainText('Michael Phelps');
    });
});
