import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // Validate United States group row: first(total)=8, min(total)=1
        const usRowId = 'row-group-country-United States';
        await expect(agIdFor.autoGroupCell(usRowId)).toContainText('United States', {
            useInnerText: true,
        });
        await expect(agIdFor.cell(usRowId, 'total')).toContainText('8');
        await expect(agIdFor.cell(usRowId, 'total_1')).toContainText('1');

        // Validate Russia group row: first(total)=6, min(total)=1
        const russiaRowId = 'row-group-country-Russia';
        await expect(agIdFor.cell(russiaRowId, 'total')).toContainText('6');
        await expect(agIdFor.cell(russiaRowId, 'total_1')).toContainText('1');

        const valuesDropArea = page.getByTestId('ag-column-drop-area:source=toolbar;name=Values');

        // Click the "first(First or Last)" pill and verify allowed agg funcs: first, last
        await valuesDropArea.getByText('first(First or Last)').click();
        const firstPopup = page.locator('.ag-select-agg-func-popup');
        await expect(firstPopup).toBeVisible();
        const firstOptions = firstPopup.locator('.ag-select-agg-func-item');
        await expect(firstOptions).toHaveCount(2);
        await expect(firstOptions.nth(0)).toHaveText('first');
        await expect(firstOptions.nth(1)).toHaveText('last');
        // Close popup by pressing Escape
        await page.keyboard.press('Escape');
        await expect(firstPopup).not.toBeVisible();

        // Click the "min(Min or Max)" pill and verify allowed agg funcs: min, max
        await valuesDropArea.getByText('min(Min or Max)').click();
        const minPopup = page.locator('.ag-select-agg-func-popup');
        await expect(minPopup).toBeVisible();
        const minOptions = minPopup.locator('.ag-select-agg-func-item');
        await expect(minOptions).toHaveCount(2);
        await expect(minOptions.nth(0)).toHaveText('min');
        await expect(minOptions.nth(1)).toHaveText('max');
    });
});
