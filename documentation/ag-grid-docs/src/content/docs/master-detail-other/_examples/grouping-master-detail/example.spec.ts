import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Rows are grouped by region with an auto group column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The data is grouped by region; the North group is auto-expanded on load.
        await expect(agIdFor.autoGroupCell('row-group-region-North')).toContainText('North', { useInnerText: true });
    });

    test.eachFramework('A leaf master row inside a group shows its detail grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered expands the North group and the Alice Smith master row (id '1'),
        // so its detail grid is rendered on load.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(1);
        await expect(detailRows.first()).toBeVisible();

        // The detail grid exposes the call-record columns configured for grouped master detail.
        const detailHeader = detailRows.first().locator('.ag-header-cell-text');
        await expect(detailHeader).toContainText(['Call Id', 'Number', 'Duration']);

        // Alice's two call records are rendered with duration formatted with an "s" suffix.
        await expect(detailRows.first()).toContainText('555-1234');
        await expect(detailRows.first()).toContainText('s');
    });

    test.eachFramework('Only leaf rows with call records are masters', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Alice Smith (id '1') has call records, so isRowMaster returns true and she has a
        // visible expand/collapse control (currently expanded).
        await expect(
            agIdFor.autoGroupCell('1').locator('.ag-group-expanded:visible, .ag-group-contracted:visible')
        ).toHaveCount(1);

        // Bob Johnson (id '2') has no call records, so he is not a master and has no control.
        await expect(
            agIdFor.autoGroupCell('2').locator('.ag-group-expanded:visible, .ag-group-contracted:visible')
        ).toHaveCount(0);
    });
});
