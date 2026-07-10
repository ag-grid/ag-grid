import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The container ids (#eLeftGrid/#eRightGrid) are only present in the vanilla example, so
    // scope to the grids by DOM order instead: the left grid is first, the right grid second.
    const leftGrid = (page: any) => page.locator('.ag-root-wrapper').first();
    const rightGrid = (page: any) => page.locator('.ag-root-wrapper').nth(1);

    test.eachFramework('Left grid is seeded and right grid starts empty', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // getRowId uses the data id, so left rows have ids 100 (Red), 101 (Green), 102 (Blue).
        await expect(agIdFor.cell('100', 'color')).toContainText('Red');
        await expect(agIdFor.cell('101', 'color')).toContainText('Green');
        await expect(agIdFor.cell('102', 'color')).toContainText('Blue');

        // The right grid is initialised with no rows.
        await expect(rightGrid(page).locator('.ag-row')).toHaveCount(0);
    });

    test.eachFramework('Sorting the left grid by colour reorders its rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const redRow = agIdFor.rowNode('100'); // Red row, initially first
        await expect(redRow).toHaveAttribute('row-index', '0');

        // The colour header appears in both grids, so scope to the left grid.
        const leftColourHeader = leftGrid(page).getByTestId('ag-header-cell:colId=color');
        await leftColourHeader.click(); // ascending: Blue, Green, Red -> Red sinks to the bottom
        await expect(redRow).toHaveAttribute('row-index', '2');
    });
});
