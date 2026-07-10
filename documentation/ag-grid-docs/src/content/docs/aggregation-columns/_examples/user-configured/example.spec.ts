import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Adding a column to Values via the tool panel aggregates the group',
        async ({ agIdFor, page }) => {
            const valuesToolbar = agIdFor.columnDropArea('toolbar', 'Values');

            await expect(agIdFor.columnToolPanel()).toBeVisible();

            // Initially no aggFunc is set, so the Values area is empty.
            await expect(valuesToolbar.locator('.ag-column-drop-cell-text')).toHaveCount(0);

            // Add 'total' to values — the default aggFunc is 'sum'.
            await agIdFor.columnToolPanel().getByText('Total').click({ button: 'right' });
            await page.getByText('Add Total to values').click();
            await expect(valuesToolbar.getByText('sum(Total)')).toBeVisible();

            // Add 'gold' to values — also aggregated with 'sum'.
            await agIdFor.columnToolPanel().getByText('Gold', { exact: true }).click({ button: 'right' });
            await page.getByText('Add Gold to values').click();
            await expect(valuesToolbar.getByText('sum(Gold)')).toBeVisible();

            // Verify aggregated sums for the United States group row.
            const usRowId = 'row-group-country-United States';
            await expect(agIdFor.cell(usRowId, 'total')).toContainText('1312');
            await expect(agIdFor.cell(usRowId, 'gold')).toContainText('552');
        }
    );
});
