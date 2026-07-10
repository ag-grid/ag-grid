import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Clicking a cell does not start editing', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'athlete');
        await expect(cell).toContainText('Michael Phelps');

        // suppressClickEdit=true: clicking the cell must not open the editor
        await cell.click();
        await expect(cell.locator('input')).toHaveCount(0);
    });

    test.eachFramework('Renderer button starts editing via the API', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'athlete');

        // the cell renderer's button calls api.startEditingCell
        await cell.locator('#theButton').click();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();

        await page.keyboard.type('Fred');
        await page.keyboard.press('Enter');

        await expect(editor).toHaveCount(0);
        await expect(cell).toContainText('Fred');
    });
});
