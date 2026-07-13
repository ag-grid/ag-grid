import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Set Filter supplies country values asynchronously and filters rows to the selection',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            const countryCells = page.locator('.ag-row [col-id="country"]');
            const item = (label: string) => agIdFor.setFilterInstanceItem({ source: 'column-filter' }, label);

            // Open the Country Set Filter. Values are supplied asynchronously (500ms server delay).
            await agIdFor.headerFilterButton('country').click();
            await expect(item('Australia')).toBeVisible({ timeout: 8000 });
            await expect(item('Austria')).toBeVisible();

            // Deselect everything, then select only Australia, and apply.
            await item('(Select All)').uncheck();
            await item('Australia').check();
            await agIdFor.setFilterApplyPanelButton({ source: 'column-filter' }, 'Apply').click();

            // The server reloads with only Australian rows.
            await expect(countryCells.filter({ hasText: 'Australia' }).first()).toBeVisible();
            await expect(countryCells.filter({ hasNotText: 'Australia' })).toHaveCount(0);
        }
    );
});
