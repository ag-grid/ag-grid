import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// styles.css sets --ag-background-color: IndianRed on the body, and on .ag-details-grid explicitly sets the
// lower-level variables (--ag-data-background-color / --ag-odd-row-background-color to MediumSeaGreen).
// The docs explain that, unlike the custom-properties example, this DOES turn the detail rows green because
// the low-level variables are set directly rather than relying on the (already-inherited) high-level default.
const INDIAN_RED = 'rgb(205, 92, 92)';
const MEDIUM_SEA_GREEN = 'rgb(60, 179, 113)';

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

    test.eachFramework('Detail grid rows turn MediumSeaGreen when low-level variables are set', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Setting the low-level variables explicitly overrides the inherited red, so the detail rows are green.
        const detailRowBg = await page
            .locator('.ag-details-grid .ag-row')
            .first()
            .evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(detailRowBg).toBe(MEDIUM_SEA_GREEN);
    });
});
