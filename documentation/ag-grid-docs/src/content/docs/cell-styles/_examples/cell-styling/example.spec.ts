import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('cellClass, cellClassRules and cellStyle style cells by value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0 is Michael Phelps: age 23, year 2008, Swimming, gold 8, silver 0, bronze 0.

        // age uses expression cellClassRules: 23 -> 'x >= 20 && x < 25' -> rag-blue.
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        await expect(agIdFor.cell('0', 'age')).toHaveClass(/rag-blue/);

        // year uses function cellClassRules: 2008 -> rag-green-outer, rendered via ragRenderer span.
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');
        await expect(agIdFor.cell('0', 'year')).toHaveClass(/rag-green-outer/);
        await expect(agIdFor.cell('0', 'year').locator('.rag-element')).toBeVisible();

        // date uses static cellClass rag-blue; sport uses a function returning rag-green for Swimming.
        await expect(agIdFor.cell('0', 'date')).toHaveClass(/rag-blue/);
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'sport')).toHaveClass(/rag-green/);

        // gold uses a static cellStyle backgroundColor #aaffaa (rgb(170, 255, 170)).
        await expect(agIdFor.cell('0', 'gold')).toHaveCSS('background-color', 'rgb(170, 255, 170)');

        // silver 0 -> numberToColor(0) -> #ffaaaa (rgb(255, 170, 170)).
        await expect(agIdFor.cell('0', 'silver')).toContainText('0');
        await expect(agIdFor.cell('0', 'silver')).toHaveCSS('background-color', 'rgb(255, 170, 170)');
    });

    test.eachFramework('cellClassRules re-evaluate as rows are reordered by sort', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Sort age ascending: youngest athlete (min age 15) floats to the top,
        // so the top age cell now matches 'x < 20' -> rag-green.
        await agIdFor.headerCell('age').click();

        const topAgeCell = page.locator('.ag-row[row-index="0"] [col-id="age"]').first();
        await expect(topAgeCell).toHaveClass(/rag-green/);

        await page.waitForTimeout(300); // avoid a double-click

        // Sort age descending: oldest athlete (max age 61) floats to the top -> 'x >= 25' -> rag-red.
        await agIdFor.headerCell('age').click();
        await expect(topAgeCell).toHaveClass(/rag-red/);
    });
});
