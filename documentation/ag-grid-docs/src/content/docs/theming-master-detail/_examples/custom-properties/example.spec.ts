import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// styles.css sets --ag-background-color: IndianRed on the body and MediumSeaGreen on .ag-details-grid.
// The docs explain that setting the high-level --ag-background-color on the detail grid has NO effect,
// because the lower-level row-background variables have already inherited the red value from the master.
const INDIAN_RED = 'rgb(205, 92, 92)';

test.agExample(import.meta, () => {
    test.eachFramework('Auto-expanded detail grid renders call-record columns', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(1);
        await expect(detailRows.first()).toBeVisible();

        const detailHeader = detailRows.first().locator('.ag-header-cell-text');
        await expect(detailHeader).toContainText(['Call Id', 'Direction', 'Number', 'Duration', 'Switch Code']);
    });

    test.eachFramework(
        'Master rows use the IndianRed background from --ag-background-color',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const masterRowBg = await agIdFor
                .cell('0', 'name')
                .evaluate((el) => getComputedStyle(el.closest('.ag-row') as HTMLElement).backgroundColor);
            expect(masterRowBg).toBe(INDIAN_RED);
        }
    );

    test.eachFramework('Detail grid rows stay IndianRed - the green override has no effect', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Demonstrates the documented limitation: --ag-background-color: MediumSeaGreen on the detail grid
        // cannot override the already-defined red row background inherited from the master grid.
        const detailRowBg = await page
            .locator('.ag-details-grid .ag-row')
            .first()
            .evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(detailRowBg).toBe(INDIAN_RED);
    });
});
