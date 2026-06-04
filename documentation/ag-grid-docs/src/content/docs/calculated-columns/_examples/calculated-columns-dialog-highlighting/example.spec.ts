import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'dialog highlighting example opens the dialog and highlights the calculated column',
        async ({ agIdFor, page }) => {
            await expect(agIdFor.headerCell('profit')).toContainText('Profit');
            await expect(agIdFor.cell('0', 'profit')).toContainText('$46,000');
            await expect(agIdFor.cell('1', 'profit')).toContainText('$26,000');
            await expect(page.locator('.ag-calculated-column-form')).toBeVisible();
            await expect(agIdFor.headerCell('profit')).toHaveClass(/ag-calculated-column-highlighted/);
            await expect(agIdFor.cell('0', 'profit')).toHaveClass(/ag-calculated-column-highlighted/);
        }
    );
});
