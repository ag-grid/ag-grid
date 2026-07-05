import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const NOT_PROVIDED = 'Days (Values Not Provided)';
const PROVIDED = 'Days (Values Provided)';

async function waitForFilterItems(page: any, colLabel: string) {
    await page
        .locator(`[data-testid^="ag-filter-toolpanel-set-filter-item:colLabel=${colLabel};itemLabel="]`)
        .first()
        .waitFor();
}

async function itemLabels(page: any, colLabel: string): Promise<string[]> {
    const loc = page.locator(`[data-testid^="ag-filter-toolpanel-set-filter-item:colLabel=${colLabel};itemLabel="]`);
    const count = await loc.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
        const tid = await loc.nth(i).getAttribute('data-testid');
        labels.push(tid!.split('itemLabel=')[1]);
    }
    return labels;
}

test.agExample(import.meta, () => {
    test.eachFramework('Values from data omit days absent from the rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, NOT_PROVIDED);

        // Row data only contains Monday..Friday, sorted by the weekday comparator.
        const labels = await itemLabels(page, NOT_PROVIDED);
        expect(labels).toEqual(['(Select All)', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    });

    test.eachFramework('Supplied values include all days in the provided order', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, PROVIDED);

        // Values are supplied for every weekday with suppressSorting => provided order kept.
        // (The last item, Sunday, is virtualised out of the DOM, so assert the rendered prefix.)
        const labels = await itemLabels(page, PROVIDED);
        expect(labels.slice(0, 7)).toEqual([
            '(Select All)',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ]);
    });

    test.eachFramework('Selecting a supplied value not present in data yields no rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, PROVIDED);

        const spec = { source: 'filter-toolpanel' as const, colLabel: PROVIDED };
        await agIdFor.setFilterInstanceItem(spec, '(Select All)').uncheck();
        await agIdFor.setFilterInstanceItem(spec, 'Saturday').check();

        // No row has 'Saturday', so filtering to it hides every row.
        await expect(page.locator('.ag-row')).toHaveCount(0);
    });
});
