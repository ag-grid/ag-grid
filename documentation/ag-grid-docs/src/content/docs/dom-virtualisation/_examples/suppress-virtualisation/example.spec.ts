import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders the first row values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of olympic-winners.json is Michael Phelps, United States, 2008.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Row virtualisation suppressed: off-screen rows are in the DOM', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // With suppressRowVirtualisation the grid renders all 100 rows up front,
        // so a far-down row is present in the DOM without any scrolling.
        await expect(agIdFor.cell('90', 'athlete')).toBeVisible();

        // All 100 rows are rendered up front (no virtual windowing), far beyond
        // the ~20 rows a virtualised viewport would keep in the DOM.
        const rowIndexes = await page.locator('.ag-row[row-index]').evaluateAll((els) => {
            const set = new Set<string>();
            for (const el of els) {
                set.add(el.getAttribute('row-index')!);
            }
            return set.size;
        });
        expect(rowIndexes).toBe(100);
    });
});
