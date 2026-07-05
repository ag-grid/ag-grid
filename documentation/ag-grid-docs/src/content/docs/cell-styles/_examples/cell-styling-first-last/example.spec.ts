import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('First and last columns receive ag-column-first / ag-column-last', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0 is Michael Phelps: athlete first column, bronze last column.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-column-first/);
        await expect(agIdFor.cell('0', 'bronze')).toHaveClass(/ag-column-last/);

        // .ag-column-first is #2244cc44, .ag-column-last is #cc333344.
        await expect(agIdFor.cell('0', 'athlete')).toHaveCSS('background-color', 'rgba(34, 68, 204, 0.267)');
        await expect(agIdFor.cell('0', 'bronze')).toHaveCSS('background-color', 'rgba(204, 51, 51, 0.267)');
    });

    test.eachFramework(
        'First/last styling persists on the reordered top row after sorting',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Sort gold descending: Michael Phelps (gold 8) floats to the top.
            await agIdFor.headerCell('gold').click();
            await page.waitForTimeout(300); // avoid a double-click
            await agIdFor.headerCell('gold').click();

            const topRow = page.locator('.ag-row[row-index="0"]').first();
            await expect(topRow.locator('[col-id="gold"]')).toContainText('8');

            // The first/last cell styling still applies to whichever data row is at the top.
            await expect(topRow.locator('[col-id="athlete"]')).toHaveClass(/ag-column-first/);
            await expect(topRow.locator('[col-id="bronze"]')).toHaveClass(/ag-column-last/);
        }
    );
});
