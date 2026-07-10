import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Clicking outside the grid stops editing', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'age');

        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();

        await page.keyboard.type('99');

        // stopEditingWhenCellsLoseFocus=true: clicking outside the grid commits and closes the editor
        await page.getByRole('button', { name: 'Dummy Save' }).click();

        await expect(editor).toHaveCount(0);
        await expect(cell).toContainText('99');
    });
});
