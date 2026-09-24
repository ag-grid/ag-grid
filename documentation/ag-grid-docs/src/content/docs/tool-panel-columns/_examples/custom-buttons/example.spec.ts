import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('custom buttons stage a preset and a reset to the saved state', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const toolPanel = page.locator('.ag-column-select');
        await expect(toolPanel).toBeVisible();

        const headerFor = (colId: string) => agIdFor.headerCell(colId);
        const checkboxFor = (label: string) =>
            toolPanel.locator('.ag-column-select-column').filter({ hasText: label }).locator('.ag-checkbox-input');
        const button = (name: string) => page.getByRole('button', { name, exact: true });

        await expect(headerFor('athlete')).toBeVisible();
        await expect(headerFor('gold')).toBeHidden();
        await expect(button('Apply')).toBeDisabled();

        // The preset is staged in the panel, and only reaches the grid on Apply.
        await button('Medals by Country').click();
        await expect(checkboxFor('Gold')).toBeChecked();
        await expect(checkboxFor('Athlete')).not.toBeChecked();
        await expect(headerFor('gold')).toBeHidden();
        await expect(headerFor('athlete')).toBeVisible();
        await expect(button('Apply')).toBeEnabled();

        await button('Apply').click();
        await expect(headerFor('ag-Grid-AutoColumn')).toBeVisible();
        await expect(headerFor('gold')).toContainText('sum(Gold)');
        await expect(headerFor('total')).toHaveAttribute('aria-sort', 'descending');
        for (const colId of ['athlete', 'age', 'country', 'year']) {
            await expect(headerFor(colId)).toBeHidden();
        }

        // Reset stages the state saved when the grid was created.
        await button('Reset').click();
        await expect(checkboxFor('Athlete')).toBeChecked();
        await expect(headerFor('athlete')).toBeHidden();

        await button('Apply').click();
        await expect(headerFor('ag-Grid-AutoColumn')).toBeHidden();
        await expect(headerFor('athlete')).toBeVisible();
        await expect(headerFor('gold')).toBeHidden();
        await expect(headerFor('total')).not.toHaveAttribute('aria-sort', 'descending');

        // Cancel discards a staged preset.
        await button('Medals by Country').click();
        await button('Cancel').click();
        await expect(checkboxFor('Gold')).not.toBeChecked();
        await expect(button('Apply')).toBeDisabled();
        await expect(headerFor('gold')).toBeHidden();
    });
});
