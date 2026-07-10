import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('The two grids are seeded with distinct athletes', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // 20 unique athletes are loaded, split in half. getRowId uses the athlete name.
        // Left grid holds the first 10 (Michael Phelps first), right grid the last 10 (Nastia Liukin first).
        await expect(agIdFor.cell('Michael Phelps', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('Nastia Liukin', 'athlete')).toContainText('Nastia Liukin');

        // Michael Phelps lives only in the left grid, Nastia Liukin only in the right.
        await expect(page.locator('#eLeftGrid').getByText('Michael Phelps')).toBeVisible();
        await expect(page.locator('#eRightGrid').getByText('Nastia Liukin')).toBeVisible();
    });

    test.eachFramework('Sorting the left grid by athlete reorders its rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const phelps = agIdFor.rowNode('Michael Phelps'); // initially first in the left grid
        await expect(phelps).toHaveAttribute('row-index', '0');

        // Header id appears in both grids, so scope to the left grid.
        const leftAthleteHeader = page.locator('#eLeftGrid').getByTestId('ag-header-cell:colId=athlete');
        await leftAthleteHeader.click(); // ascending: Aleksey Nemov floats to the top
        await expect(agIdFor.rowNode('Aleksey Nemov')).toHaveAttribute('row-index', '0');
        await expect(phelps).not.toHaveAttribute('row-index', '0');
    });
});
