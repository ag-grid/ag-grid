import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const NO_COMPARATOR = 'Age (No Comparator)';
const WITH_COMPARATOR = 'Age (With Comparator)';

// The filters tool panel renders its set filter lists asynchronously after grid ready.
async function waitForFilterItems(page: any, colLabel: string) {
    await page
        .locator(`[data-testid^="ag-filter-toolpanel-set-filter-item:colLabel=${colLabel};itemLabel="]`)
        .first()
        .waitFor();
}

// Reads the set filter item labels (in render order) for a tool-panel column.
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
    test.eachFramework('Default string sort orders ages lexically', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, NO_COMPARATOR);

        // No comparator => values compared as strings: 1, 10, 100, ...
        const labels = await itemLabels(page, NO_COMPARATOR);
        expect(labels[0]).toBe('(Select All)');
        expect(labels[1]).toBe('1');
        expect(labels[2]).toBe('10');
    });

    test.eachFramework('Numeric comparator orders ages numerically', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, WITH_COMPARATOR);

        // With comparator => values compared numerically: 1, 2, 3, ...
        const labels = await itemLabels(page, WITH_COMPARATOR);
        expect(labels[0]).toBe('(Select All)');
        expect(labels[1]).toBe('1');
        expect(labels[2]).toBe('2');
    });

    test.eachFramework('Selecting a single value filters the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, WITH_COMPARATOR);

        const spec = { source: 'filter-toolpanel' as const, colLabel: WITH_COMPARATOR };
        await agIdFor.setFilterInstanceItem(spec, '(Select All)').uncheck();
        await agIdFor.setFilterInstanceItem(spec, '5').check();

        // Ages 1..116 are unique, so a single value leaves exactly one row.
        await expect(page.locator('.ag-row')).toHaveCount(1);
        await expect(agIdFor.cell('4', 'age').first()).toContainText('5');
    });
});
