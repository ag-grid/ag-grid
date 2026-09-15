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

    test.eachFramework('Clicking the dummy text field also stops editing', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'age');

        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();

        await page.keyboard.type('42');

        // Focus leaving the grid for any element is enough, not just the button.
        await page.getByPlaceholder('click here, editing stops').click();

        await expect(editor).toHaveCount(0);
        await expect(cell).toContainText('42');
    });

    test.eachFramework('The popup year editor stays open while clicked inside', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'year');
        await cell.dblclick();

        const popup = page.locator('.yearSelect');
        await expect(popup).toBeVisible();

        // Clicking within the popup — its label, then its own text field — leaves it open.
        await popup.getByText('Clicking here does not close the popup!').click();
        await expect(popup).toBeVisible();

        await popup.getByPlaceholder('clicking on this text field does not close').click();
        await expect(popup).toBeVisible();
    });

    test.eachFramework('The popup year editor closes when clicked outside', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'year');
        await cell.dblclick();

        const popup = page.locator('.yearSelect');
        await expect(popup).toBeVisible();

        // stopEditingWhenCellsLoseFocus closes the popup once focus leaves it.
        await page.getByRole('button', { name: 'Dummy Save' }).click();

        await expect(popup).toHaveCount(0);
    });

    test.eachFramework('A year button commits its value through stopEditing', async ({ page, agIdFor }) => {
        const cell = agIdFor.cell('0', 'year');
        await cell.dblclick();

        const popup = page.locator('.yearSelect');
        await expect(popup).toBeVisible();

        // Each year button sets the editor value then calls params.stopEditing().
        await popup.getByRole('button', { name: '2010' }).click();

        await expect(popup).toHaveCount(0);
        await expect(cell).toContainText('2010');
    });
});
