import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('references depend on the calculated column being edited', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'bonus')).toContainText('5000');
        await expect(agIdFor.cell('0', 'target')).toContainText('120000');

        for (const colId of ['target', 'bonus']) {
            const header = agIdFor.headerCell(colId);
            await header.hover();
            await header.locator('.ag-header-cell-menu-button').click();
            await page.locator('.ag-menu-option-text', { hasText: 'Edit Calculated Column' }).click();
            const dialog = page.locator('.ag-calculated-column-form');
            await dialog.getByRole('button', { name: 'Columns', exact: true }).click();
            const salary = page.locator('.ag-calculated-column-suggestion-label', { hasText: /^Salary$/ });
            if (colId === 'target') {
                await expect(salary).toHaveCount(0);
                await dialog.locator('textarea').fill('[Salary]');
                await expect(dialog.locator('textarea')).toHaveAttribute('aria-invalid', 'true');
                await expect(agIdFor.cell('0', colId)).toHaveClass(/formula-error/);
                await dialog.locator('textarea').fill('[Sales] * 2');
                await expect(agIdFor.cell('0', colId)).toContainText('200000');
            } else {
                await expect(salary).toBeVisible();
                await dialog.locator('textarea').fill('[Salary] * 0.2');
                await expect(agIdFor.cell('0', colId)).toContainText('10000');
            }
            await page.locator('.ag-dialog .ag-panel-title-bar-button').click();
            await expect(dialog).toHaveCount(0);
        }
    });
});
