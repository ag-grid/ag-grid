import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('custom errors block Apply until a valid expression is entered', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'bonus')).toContainText('10000');
        const header = agIdFor.headerCell('bonus');
        await header.hover();
        await header.locator('.ag-header-cell-menu-button').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Edit Calculated Column' }).click();
        const dialog = page.locator('.ag-calculated-column-form');
        const expression = dialog.locator('textarea');
        await expression.fill('[Salary]');
        await expect(expression).toHaveAttribute('aria-invalid', 'true');
        await expect(dialog.getByRole('button', { name: 'Apply', exact: true })).toBeDisabled();
        await expect(agIdFor.cell('0', 'bonus')).toContainText('10000');
        await expression.hover();
        const tooltip = page.locator('.ag-calculated-column-expression-tooltip');
        await expect(tooltip).toContainText('Salary cannot be used in this report.');
        await expect(tooltip).toContainText('Choose a sales-based expression.');
        await expression.fill('[Sales] * 0.2');
        await expect(expression).toHaveAttribute('aria-invalid', 'false');
        await dialog.getByRole('button', { name: 'Apply', exact: true }).click();
        await expect(dialog).toHaveCount(0);
        await expect(agIdFor.cell('0', 'bonus')).toContainText('20000');
    });
});
