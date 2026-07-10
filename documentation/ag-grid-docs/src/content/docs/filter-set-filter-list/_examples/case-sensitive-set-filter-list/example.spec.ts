import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const INSENSITIVE = 'Case Insensitive (default)';
const SENSITIVE = 'Case Sensitive';

async function waitForFilterItems(page: any, colLabel: string) {
    await page
        .locator(`[data-testid^="ag-filter-toolpanel-set-filter-item:colLabel=${colLabel};itemLabel="]`)
        .first()
        .waitFor();
}

test.agExample(import.meta, () => {
    test.eachFramework('Case-insensitive collapses casings to a single value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, INSENSITIVE);

        const spec = { source: 'filter-toolpanel' as const, colLabel: INSENSITIVE };
        // Data has Black, BLACK and black; case-insensitive keeps only the first-seen 'Black'.
        await agIdFor.setFilterInstanceMiniFilterInput(spec).fill('black');

        const values = await agIdFor.filterToolPanelGroup(INSENSITIVE).locator('.ag-set-filter-item').allInnerTexts();
        const trimmed = values.map((v) => v.trim());
        expect(trimmed).toContain('Black');
        expect(trimmed).not.toContain('BLACK');
        expect(trimmed).not.toContain('black');
    });

    test.eachFramework('Case-sensitive keeps each casing as a distinct value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await waitForFilterItems(page, SENSITIVE);

        const spec = { source: 'filter-toolpanel' as const, colLabel: SENSITIVE };
        const items = () => agIdFor.filterToolPanelGroup(SENSITIVE).locator('.ag-set-filter-item');

        // 'black' matches only the lower-case value, not 'Black' or 'BLACK'.
        await agIdFor.setFilterInstanceMiniFilterInput(spec).fill('black');
        let trimmed = (await items().allInnerTexts()).map((v) => v.trim());
        expect(trimmed).toContain('black');
        expect(trimmed).not.toContain('Black');
        expect(trimmed).not.toContain('BLACK');

        // The upper-case value exists as its own separate entry.
        await agIdFor.setFilterInstanceMiniFilterInput(spec).fill('BLACK');
        trimmed = (await items().allInnerTexts()).map((v) => v.trim());
        expect(trimmed).toContain('BLACK');
    });
});
