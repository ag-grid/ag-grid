import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const NO_FORMATTER = 'No Value Formatter';
const WITH_FORMATTER = 'With Value Formatter';

async function waitForFilterItems(page: any, colLabel: string) {
    await page
        .locator(`[data-testid^="ag-filter-toolpanel-set-filter-item:colLabel=${colLabel};itemLabel="]`)
        .first()
        .waitFor();
}

test.agExample(import.meta, () => {
    test.eachFramework('Without a filter value formatter the raw country name is shown', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, NO_FORMATTER);

        const spec = { source: 'filter-toolpanel' as const, colLabel: NO_FORMATTER };
        await agIdFor.setFilterInstanceMiniFilterInput(spec).fill('Ireland');

        const values = (
            await agIdFor.filterToolPanelGroup(NO_FORMATTER).locator('.ag-set-filter-item').allInnerTexts()
        ).map((v) => v.trim());
        expect(values).toContain('Ireland');
        expect(values).not.toContain('Ireland (IE)');
    });

    test.eachFramework('With a filter value formatter the country code is appended', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, WITH_FORMATTER);

        const spec = { source: 'filter-toolpanel' as const, colLabel: WITH_FORMATTER };
        await agIdFor.setFilterInstanceMiniFilterInput(spec).fill('Ireland');

        const values = (
            await agIdFor.filterToolPanelGroup(WITH_FORMATTER).locator('.ag-set-filter-item').allInnerTexts()
        ).map((v) => v.trim());
        expect(values).toContain('Ireland (IE)');
    });
});
