import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        const valuesToolbar = agIdFor.columnDropArea('toolbar', 'Values');

        // await agIdFor.sideBarButton('Columns').click();
        await expect(agIdFor.columnToolPanel()).toBeVisible();

        // Initially no columns are in the Values area (no aggFunc set)
        await expect(valuesToolbar.locator('.ag-column-drop-cell-text')).toHaveCount(0);

        // Add 'total' to values — should use defaultAggFunc 'avg'
        await agIdFor.columnToolPanel().getByText('Total').click({ button: 'right' });
        // await expect(agIdFor.menu()).toBeVisible();
        await page.getByText('Add Total to values').click();
        await expect(valuesToolbar.getByText('avg(Total)')).toBeVisible();

        // Add 'athlete' to values — should use defaultAggFunc 'count'
        await agIdFor.columnToolPanel().getByText('Athlete').click({ button: 'right' });
        await page.getByText('Add Athlete to values').click();
        await expect(valuesToolbar.getByText('count(Athlete)')).toBeVisible();

        // Verify aggregated values for United States group row
        const usRowId = 'row-group-country-United States';
        await expect(agIdFor.cell(usRowId, 'total')).toContainText('1.18');
        await expect(agIdFor.cell(usRowId, 'athlete')).toContainText('1109');
    });
});
