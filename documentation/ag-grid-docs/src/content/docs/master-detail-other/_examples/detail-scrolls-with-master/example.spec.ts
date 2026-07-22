import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Second master row is auto-expanded showing its detail grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered expands the row at index 1. Because embedFullWidthRows=true, the
        // detail panel is embedded once per scrollable section (pinned left, centre, pinned right),
        // so three detail-row copies are rendered for the single expanded master row.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(3);

        // The populated detail grid lives in the centre (scrolling) section and exposes the
        // call-record columns defined in detailGridOptions.
        const scrollingDetail = page.locator('.ag-grid-scrolling-cells > .ag-details-row').first();
        const detailHeader = scrollingDetail.locator('.ag-header-cell-text');
        await expect(detailHeader).toContainText(['Call Id', 'Direction', 'Number', 'Duration', 'Switch Code']);

        // Duration values are formatted with an "s" suffix by the detail grid's valueFormatter.
        await expect(scrollingDetail).toContainText('s');
    });

    test.eachFramework('Detail grid is embedded within the scrolling cells section', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // embedFullWidthRows=true lays the detail panel out with the other rows: exactly one copy
        // sits inside the horizontally-scrollable centre section (.ag-grid-scrolling-cells), which
        // is the mechanism that makes it move with the master grid's horizontal scroll (rather than
        // the default overlay full-width container that ignores horizontal scrolling).
        const scrollingDetail = page.locator('.ag-grid-scrolling-cells > .ag-details-row');
        await expect(scrollingDetail).toHaveCount(1);
        await expect(scrollingDetail.first()).toBeVisible();
    });

    test.eachFramework('Expanding another master row reveals a second detail grid', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(3);

        // Expanding the first master row adds another embedded detail panel per section (3 -> 6).
        await agIdFor.groupContracted('0', 'name').click();
        await expect(detailRows).toHaveCount(6);
    });
});
