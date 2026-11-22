import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const INSENSITIVE = 'Case Insensitive (default)';
const SENSITIVE = 'Case Sensitive';
const SENSITIVE_SEARCH = 'Case Sensitive Search';

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

        // The filter list repopulates asynchronously after typing, so retry until it settles.
        await expect(async () => {
            const values = await agIdFor
                .filterToolPanelGroup(INSENSITIVE)
                .locator('.ag-set-filter-item')
                .allInnerTexts();
            const trimmed = values.map((v) => v.trim());
            expect(trimmed).toContain('Black');
            expect(trimmed).not.toContain('BLACK');
            expect(trimmed).not.toContain('black');
        }).toPass();
    });

    test.eachFramework(
        'Case-sensitive keeps each casing as a distinct value and the Mini Filter ignores case',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);
            await waitForFilterItems(page, SENSITIVE);

            const spec = { source: 'filter-toolpanel' as const, colLabel: SENSITIVE };
            const items = () => agIdFor.filterToolPanelGroup(SENSITIVE).locator('.ag-set-filter-item');

            await agIdFor.setFilterInstanceMiniFilterInput(spec).fill('black');
            await expect(async () => {
                const trimmed = (await items().allInnerTexts()).map((v) => v.trim());
                expect(trimmed).toContain('Black');
                expect(trimmed).toContain('black');
                expect(trimmed).toContain('BLACK');
                expect(trimmed).not.toContain('Red');
            }).toPass();
        }
    );

    test.eachFramework(
        'miniFilterCaseSensitive restricts the Mini Filter to the typed casing',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);
            await waitForFilterItems(page, SENSITIVE_SEARCH);

            const spec = { source: 'filter-toolpanel' as const, colLabel: SENSITIVE_SEARCH };
            const items = () => agIdFor.filterToolPanelGroup(SENSITIVE_SEARCH).locator('.ag-set-filter-item');

            await agIdFor.setFilterInstanceMiniFilterInput(spec).fill('black');
            await expect(async () => {
                const trimmed = (await items().allInnerTexts()).map((v) => v.trim());
                expect(trimmed).toContain('black');
                expect(trimmed).not.toContain('Black');
                expect(trimmed).not.toContain('BLACK');
            }).toPass();

            await agIdFor.setFilterInstanceMiniFilterInput(spec).fill('BLACK');
            await expect(async () => {
                const trimmed = (await items().allInnerTexts()).map((v) => v.trim());
                expect(trimmed).toContain('BLACK');
                expect(trimmed).not.toContain('black');
            }).toPass();
        }
    );
});
