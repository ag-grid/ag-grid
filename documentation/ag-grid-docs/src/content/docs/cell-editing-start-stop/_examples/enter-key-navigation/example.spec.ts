import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Enter moves focus down when not editing', async ({ page, agIdFor }) => {
        const cell0 = agIdFor.cell('0', 'athlete');
        const cell1 = agIdFor.cell('1', 'athlete');

        await cell0.click();
        await expect(cell0).toHaveClass(/ag-cell-focus/);

        // enterNavigatesVertically=true: Enter moves focus to the cell below rather than starting an edit
        await page.keyboard.press('Enter');

        await expect(cell0.locator('input')).toHaveCount(0); // did not enter edit mode
        await expect(cell1).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Enter after edit commits and moves focus down', async ({ page, agIdFor }) => {
        const cell0 = agIdFor.cell('0', 'athlete');
        const cell1 = agIdFor.cell('1', 'athlete');

        await cell0.dblclick();
        const editor = cell0.locator('input');
        await expect(editor).toBeVisible();

        await page.keyboard.type('Fred');
        // enterNavigatesVerticallyAfterEdit=true: Enter commits and moves focus down
        await page.keyboard.press('Enter');

        await expect(editor).toHaveCount(0);
        await expect(cell0).toContainText('Fred');
        await expect(cell1).toHaveClass(/ag-cell-focus/);
    });
});
