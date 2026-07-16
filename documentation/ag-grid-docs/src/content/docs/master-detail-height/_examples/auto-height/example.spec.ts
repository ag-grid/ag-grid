import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('detailRowAutoHeight sizes the detail row to fit all its call records', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered auto-expands the master row at index 1 (Mila Smith, 24 call records).
        const detail = page.locator('.ag-details-row').first();
        await expect(detail).toBeVisible();

        // The detail grid exposes the call-record columns defined in detailGridOptions.
        await expect(detail.locator('.ag-header-cell-text')).toContainText([
            'Call Id',
            'Direction',
            'Number',
            'Duration',
            'Switch Code',
        ]);

        // With detailRowAutoHeight all 24 records render (no row virtualisation) and the
        // detail row auto-sizes to fit them, so it grows well beyond the default 300px.
        await expect(detail.locator('.ag-row')).toHaveCount(24);

        const box = await detail.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThan(400);
    });
});
