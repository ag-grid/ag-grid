import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Supports pagination, sorting and row selection', async ({ agIdFor, page }) => {
        // pagination is enabled with a page size of 10
        const pagingPanel = page.locator('.ag-paging-panel');
        await expect(pagingPanel).toBeVisible();
        await expect(
            page.locator('.ag-center-cols-container .ag-row, .ag-grid-scrolling-container .ag-row')
        ).toHaveCount(10);

        // sort by price ascending — the cheapest car (Fiat Panda, 13724) moves to the top
        await agIdFor.headerCell('price').click();
        await expect(agIdFor.cell('10', 'price')).toContainText('13724');
        await expect(agIdFor.cell('10', 'make')).toContainText('Fiat');

        // multiRow selection — clicking a row checkbox selects the row
        await agIdFor.rowNode('10').locator('.ag-selection-checkbox').click();
        await expect(agIdFor.rowNode('10')).toHaveClass(/ag-row-selected/);
    });
});
