import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('detailRowHeight fixes the detail row height at 200px', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered auto-expands the master row at index 1, so exactly one detail grid renders on load.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(1);
        await expect(detailRows.first()).toBeVisible();

        // The detail grid exposes the call-record columns defined in detailGridOptions.
        await expect(detailRows.first().locator('.ag-header-cell-text')).toContainText([
            'Call Id',
            'Direction',
            'Number',
            'Duration',
            'Switch Code',
        ]);

        // detailRowHeight: 200 fixes the detail row height at 200px regardless of how many
        // call records exist, so it is shorter than the default 300px fixed height.
        const box = await detailRows.first().boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThan(180);
        expect(box!.height).toBeLessThan(220);
    });
});
