import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const ARRAY_COL = 'Animals (array)';

async function waitForFilterItems(page: any, colLabel: string) {
    await page
        .locator(`[data-testid^="ag-filter-toolpanel-set-filter-item:colLabel=${colLabel};itemLabel="]`)
        .first()
        .waitFor();
}

test.agExample(import.meta, () => {
    test.eachFramework('Filter list contains each individual value from the cells', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The filters tool panel groups start collapsed; expand the array column.
        await agIdFor.filterToolPanelGroupCollapsedIcon(ARRAY_COL).click();
        await waitForFilterItems(page, ARRAY_COL);

        // Data uses arrays of animals; each distinct animal becomes its own filter value,
        // and the first row's empty array surfaces as (Blanks).
        const values = (
            await agIdFor.filterToolPanelGroup(ARRAY_COL).locator('.ag-set-filter-item').allInnerTexts()
        ).map((v) => v.trim());
        expect(values).toContain('Elephant');
        expect(values).toContain('Lion');
        expect(values).toContain('(Blanks)');
    });

    test.eachFramework('Selecting (Blanks) shows the single empty-array row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.filterToolPanelGroupCollapsedIcon(ARRAY_COL).click();
        await waitForFilterItems(page, ARRAY_COL);

        const spec = { source: 'filter-toolpanel' as const, colLabel: ARRAY_COL };
        await agIdFor.setFilterInstanceItem(spec, '(Select All)').uncheck();
        await agIdFor.setFilterInstanceItem(spec, '(Blanks)').check();

        // Only the first row holds an empty array, so filtering to (Blanks) leaves one row.
        await expect(page.locator('.ag-row')).toHaveCount(1);
    });
});
