import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders the olympic data with text-selectable cells', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First data row from olympic-winners.json.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');

        // enableCellTextSelection means cell text is selectable (user-select not disabled).
        const userSelect = await agIdFor
            .cell('0', 'athlete')
            .evaluate((el) => getComputedStyle(el).userSelect || (getComputedStyle(el) as any).webkitUserSelect);
        expect(userSelect).not.toBe('none');
    });

    test.eachFramework('Sorting by age reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Unsorted, the first rendered row is the first data row (Michael Phelps, age 23).
        const firstRowAge = page.locator('.ag-row[row-index="0"] [col-id="age"]');
        await expect(firstRowAge).toContainText('23');

        // Sort age ascending: a younger athlete floats to the top of the grid.
        await agIdFor.headerCell('age').click();
        await expect(firstRowAge).not.toContainText('23');
        const topAge = Number((await firstRowAge.innerText()).trim());
        expect(topAge).toBeLessThan(23);
    });
});
