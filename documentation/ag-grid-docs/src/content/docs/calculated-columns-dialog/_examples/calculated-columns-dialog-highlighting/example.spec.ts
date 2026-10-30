import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'the dialog shows only the Columns picker and does not highlight the column',
        async ({ agIdFor, page }) => {
            await expect(agIdFor.headerCell('profit')).toContainText('Profit');
            await expect(agIdFor.cell('0', 'profit')).toContainText('$46,000');

            const profitHeader = agIdFor.headerCell('profit');
            await profitHeader.hover();
            await profitHeader.locator('.ag-header-cell-menu-button').click();
            await page.locator('.ag-menu-option-text', { hasText: 'Edit Calculated Column' }).click();

            const dialog = page.locator('.ag-calculated-column-form');
            await expect(dialog.getByRole('button', { name: 'Columns', exact: true })).toBeVisible();
            await expect(dialog.getByRole('button', { name: 'Functions', exact: true })).toHaveCount(0);
            await expect(dialog.getByRole('button', { name: 'Operators', exact: true })).toHaveCount(0);

            await expect(agIdFor.headerCell('profit')).not.toHaveClass(/ag-calculated-column-highlighted/);
            await expect(agIdFor.cell('0', 'profit')).not.toHaveClass(/ag-calculated-column-highlighted/);
        }
    );
});
