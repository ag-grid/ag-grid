import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'suppress dialog highlighting example opens the dialog without highlighting the calculated column',
        async ({ agIdFor, page }) => {
            await expect(agIdFor.headerCell('profit')).toContainText('Profit');
            await expect(agIdFor.cell('0', 'profit')).toContainText('$46,000');
            await expect(agIdFor.cell('1', 'profit')).toContainText('$26,000');

            // Open the calculated column dialog via the column header menu
            const profitHeader = agIdFor.headerCell('profit');
            await profitHeader.hover();
            await profitHeader.locator('.ag-header-cell-menu-button').click();
            await page.locator('.ag-menu-option-text', { hasText: 'Edit Calculated Column' }).click();

            await expect(page.locator('.ag-calculated-column-form')).toBeVisible();
            await expect(agIdFor.headerCell('profit')).not.toHaveClass(/ag-calculated-column-highlighted/);
            await expect(agIdFor.cell('0', 'profit')).not.toHaveClass(/ag-calculated-column-highlighted/);
        }
    );
});
