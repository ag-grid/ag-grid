import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'users choose an aggregation for a calculated column created in the dialog',
        async ({ agIdFor, page }) => {
            const costHeader = agIdFor.headerCell('cost');
            await costHeader.hover();
            await costHeader.locator('.ag-header-cell-menu-button').click();
            await page.locator('.ag-menu-option-text', { hasText: 'Add Calculated Column' }).click();

            const dialog = page.locator('.ag-calculated-column-form');
            await dialog.locator('input').fill('Profit');
            await dialog.locator('.ag-select .ag-picker-field-wrapper').click();
            await page.locator('.ag-select-list-item', { hasText: 'Number' }).click();
            await dialog.locator('textarea').fill('[Revenue] - [Cost]');
            await page.locator('.ag-dialog .ag-panel-title-bar-button').click();
            await expect(dialog).toHaveCount(0);

            const profitHeader = page.locator('.ag-header-cell', { hasText: 'Profit' });
            const colId = (await profitHeader.getAttribute('col-id'))!;
            const solarGroupId = 'row-group-productType-Solar';
            await expect(agIdFor.cell('0', colId)).toContainText('46000');
            // Without an aggregation the group row stays blank.
            await expect(agIdFor.cell(solarGroupId, colId)).toHaveText('');

            await profitHeader.hover();
            await profitHeader.locator('.ag-header-cell-menu-button').click();
            await page.locator('.ag-menu-option-text', { hasText: 'Value Aggregation' }).hover();
            // allowedAggFuncs in defaultColDef limits the choices offered.
            const aggOptions = page.locator('.ag-menu-list').nth(1).locator('.ag-menu-option-text');
            await expect(aggOptions).toHaveText(['None', 'Sum', 'Average', 'Min', 'Max']);
            await aggOptions.filter({ hasText: 'Sum' }).click();

            await expect(agIdFor.cell(solarGroupId, colId)).toContainText('72000');
        }
    );
});
