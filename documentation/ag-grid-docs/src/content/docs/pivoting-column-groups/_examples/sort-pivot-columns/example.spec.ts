import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// Header group cells are absolutely positioned, so visual order is determined by their `left` offset
// rather than DOM order. Return the pivot year group col-ids ordered left-to-right.
const yearGroupOrder = (page: import('@playwright/test').Page) =>
    page.locator('.ag-header-group-cell[col-id^="pivotGroup_year_"]').evaluateAll((els) =>
        els
            .map((e) => ({ id: e.getAttribute('col-id')!, left: e.getBoundingClientRect().left }))
            .sort((a, b) => a.left - b.left)
            .map((e) => e.id)
    );

test.agExample(import.meta, () => {
    test.eachFramework(
        'Activating the Year pivot pill sorts the pivot column groups descending',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Pivot on `year`; pivot columns sort ascending by default, so 2000 is the leftmost group.
            await expect(agIdFor.headerGroupCell('pivotGroup_year_2012_0')).toBeVisible();
            expect(await yearGroupOrder(page)).toEqual([
                'pivotGroup_year_2000_0',
                'pivotGroup_year_2002_0',
                'pivotGroup_year_2004_0',
                'pivotGroup_year_2006_0',
                'pivotGroup_year_2008_0',
                'pivotGroup_year_2010_0',
                'pivotGroup_year_2012_0',
            ]);

            // The Year pill in the pivot (Column Labels) panel starts ascending; activating it cycles to descending.
            const yearPill = page.locator('.ag-column-drop-horizontal-cell', { hasText: 'Year' });
            await expect(yearPill).toBeVisible();
            await expect(yearPill.locator('.ag-sort-ascending-icon')).toBeVisible();
            await yearPill.click();
            await expect(yearPill.locator('.ag-sort-descending-icon')).toBeVisible();

            // Descending pivotSort reverses the pivot column groups: 2012 is now leftmost, 2000
            // rightmost. Polled rather than read once: the groups move to their new offsets over
            // several frames, so a single read can land on a part-way arrangement.
            await expect(async () => {
                expect(await yearGroupOrder(page)).toEqual([
                    'pivotGroup_year_2012_0',
                    'pivotGroup_year_2010_0',
                    'pivotGroup_year_2008_0',
                    'pivotGroup_year_2006_0',
                    'pivotGroup_year_2004_0',
                    'pivotGroup_year_2002_0',
                    'pivotGroup_year_2000_0',
                ]);
            }).toPass();
        }
    );
});
