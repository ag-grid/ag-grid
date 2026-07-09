import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Each built-in aggFunc computes the group value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // United States: the total column is repeated once per aggFunc, in def order:
        // sum, avg, count, min, max, first, last.
        const usRowId = 'row-group-country-United States';
        await expect(agIdFor.autoGroupCell(usRowId)).toContainText('United States', { useInnerText: true });

        await expect(agIdFor.cell(usRowId, 'total')).toContainText('1312'); // sum
        await expect(agIdFor.cell(usRowId, 'total_1')).toContainText('1.18'); // avg
        await expect(agIdFor.cell(usRowId, 'total_2')).toContainText('1109'); // count
        await expect(agIdFor.cell(usRowId, 'total_3')).toContainText('1'); // min
        await expect(agIdFor.cell(usRowId, 'total_4')).toContainText('8'); // max
        await expect(agIdFor.cell(usRowId, 'total_5')).toContainText('8'); // first
        await expect(agIdFor.cell(usRowId, 'total_6')).toContainText('1'); // last
    });

    test.eachFramework('Group rows sort by the aggregated sum', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const usGroup = agIdFor.rowNode('row-group-country-United States'); // unique max sum (1312)
        await agIdFor.headerCell('total').click(); // ascending
        await waitForRowAnimations(page);
        await expect(usGroup).not.toHaveAttribute('row-index', '0');
        await agIdFor.headerCell('total').click(); // descending
        await waitForRowAnimations(page);
        await expect(usGroup).toHaveAttribute('row-index', '0');
    });

    test.eachFramework('Expanding a country reveals its year sub-groups', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const findGroupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Year sub-groups are hidden until the country group is expanded.
        await expect(findGroupRow('2008')).not.toBeVisible();
        await agIdFor.autoGroupContracted('row-group-country-United States').click();
        await expect(findGroupRow('2008')).toBeVisible();
    });
});
