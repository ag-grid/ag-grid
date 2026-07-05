import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const NO_RENDERER = 'No Cell Renderer';
const WITH_RENDERER = 'With Cell Renderers';

async function waitForFilterItems(page: any, colLabel: string) {
    await page
        .locator(`[data-testid^="ag-filter-toolpanel-set-filter-item:colLabel=${colLabel};itemLabel="]`)
        .first()
        .waitFor();
}

test.agExample(import.meta, () => {
    test.eachFramework('Both columns list a (Blanks) entry for the empty country', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, NO_RENDERER);

        // The first row's country was blanked out, so a (Blanks) value appears in both lists.
        await expect(
            agIdFor.setFilterInstanceItem({ source: 'filter-toolpanel', colLabel: NO_RENDERER }, '(Blanks)')
        ).toBeVisible();
        await expect(
            agIdFor.setFilterInstanceItem({ source: 'filter-toolpanel', colLabel: WITH_RENDERER }, '(Blanks)')
        ).toBeVisible();
    });

    test.eachFramework('Selecting (Blanks) filters to the single empty-country row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, NO_RENDERER);

        const spec = { source: 'filter-toolpanel' as const, colLabel: NO_RENDERER };
        await agIdFor.setFilterInstanceItem(spec, '(Select All)').uncheck();
        await agIdFor.setFilterInstanceItem(spec, '(Blanks)').check();

        // Only the first row had its country blanked, so exactly one row remains.
        await expect(page.locator('.ag-row')).toHaveCount(1);
    });
});
