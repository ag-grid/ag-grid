import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const COUNTRY = 'Country';

async function waitForFilterItems(page: any, colLabel: string) {
    await page
        .locator(`[data-testid^="ag-filter-toolpanel-set-filter-item:colLabel=${colLabel};itemLabel="]`)
        .first()
        .waitFor();
}

test.agExample(import.meta, () => {
    test.eachFramework('Value formatter renders the object name in cells', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row is Michael Phelps whose country object is { name: 'United States', code: 'UN' }.
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
    });

    test.eachFramework('Filter list shows the object name via the value formatter', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, COUNTRY);

        const spec = { source: 'filter-toolpanel' as const, colLabel: COUNTRY };
        await agIdFor.setFilterInstanceMiniFilterInput(spec).fill('United States');

        const values = (await agIdFor.filterToolPanelGroup(COUNTRY).locator('.ag-set-filter-item').allInnerTexts()).map(
            (v) => v.trim()
        );
        expect(values).toContain('United States');
    });
});
