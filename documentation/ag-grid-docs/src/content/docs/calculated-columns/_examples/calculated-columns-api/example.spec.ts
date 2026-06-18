import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('add, edit and remove a calculated column through the grid API', async ({ agIdFor, page }) => {
        // Wait for the grid to render before interacting, so the handlers are attached.
        await expect(agIdFor.headerCell('profit')).toContainText('Profit');

        // The Profit Margin column is not present until added.
        await expect(agIdFor.headerCell('profitMargin')).toHaveCount(0);

        // Add: ([revenue] - [cost]) / [revenue] -> (142000 - 96000) / 142000 = 32.4%
        await page.getByRole('button', { name: 'Add Profit Margin' }).click();
        const marginHeader = agIdFor.headerCell('profitMargin');
        await expect(marginHeader).toContainText('Profit Margin');
        await expect(marginHeader).toHaveClass(/ag-calculated-column/);
        await expect(agIdFor.cell('0', 'profitMargin')).toContainText('32.4%');

        // Edit: ([revenue] - [cost]) / [cost] -> (142000 - 96000) / 96000 = 47.9%
        await page.getByRole('button', { name: 'Edit Profit Margin' }).click();
        await expect(agIdFor.cell('0', 'profitMargin')).toContainText('47.9%');

        // Remove: the column is gone again.
        await page.getByRole('button', { name: 'Remove Profit Margin' }).click();
        await expect(agIdFor.headerCell('profitMargin')).toHaveCount(0);
    });
});
