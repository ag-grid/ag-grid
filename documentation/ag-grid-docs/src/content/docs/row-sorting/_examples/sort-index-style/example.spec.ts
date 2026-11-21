import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const SORTED_COLUMNS = ['country', 'athlete', 'gold'];

test.agExample(import.meta, () => {
    test.eachFramework('Shows each sort index after the sort icon', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        for (let i = 0; i < SORTED_COLUMNS.length; ++i) {
            const sortOrder = agIdFor.headerCell(SORTED_COLUMNS[i]).locator('.ag-sort-order');
            await expect(sortOrder).toHaveText(String(i + 1));
            await expect(sortOrder).toHaveClass(/ag-sort-order-inline/);
            await expect(
                agIdFor.headerCell(SORTED_COLUMNS[i]).locator('.ag-sort-indicator-container > :last-child')
            ).toHaveClass(/ag-sort-order/);
        }
    });

    test.eachFramework('Buttons switch the sort index style', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        for (const style of ['superscript', 'subscript', 'inline']) {
            await page.getByRole('button', { name: style }).click();
            for (const colId of SORTED_COLUMNS) {
                await expect(agIdFor.headerCell(colId).locator('.ag-sort-order')).toHaveClass(
                    new RegExp(`ag-sort-order-${style}`)
                );
            }
        }
    });
});
