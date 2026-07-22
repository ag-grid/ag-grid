import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('spanned lorem column uses auto height for wrapped text', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The lorem column spans equal contiguous values (every non-third row shares the
        // same long lorem string) and is configured with wrapText + autoHeight.
        const loremSpans = page.locator('.ag-spanned-cell[col-id="lorem"]');
        await expect(loremSpans.first()).toBeVisible();

        const firstLorem = loremSpans.first();
        await expect(firstLorem).toContainText('Lorem ipsum');
        // Adjacent equal lorem values are merged, so the span covers at least 2 rows.
        expect(Number(await firstLorem.getAttribute('aria-rowspan'))).toBeGreaterThanOrEqual(2);

        // Auto height: the wrapped text makes the spanned cell much taller than a normal
        // single-row cell in a non-spanning column (athlete).
        const normalCell = page.locator('.ag-cell[col-id="athlete"]').first();
        const normalBox = await normalCell.boundingBox();
        const loremBox = await firstLorem.boundingBox();
        expect(normalBox).not.toBeNull();
        expect(loremBox).not.toBeNull();
        expect(loremBox!.height).toBeGreaterThan(normalBox!.height * 2);

        // A non-spanning column (athlete) never produces spanned cells.
        await expect(page.locator('.ag-spanned-cell[col-id="athlete"]')).toHaveCount(0);
    });
});
