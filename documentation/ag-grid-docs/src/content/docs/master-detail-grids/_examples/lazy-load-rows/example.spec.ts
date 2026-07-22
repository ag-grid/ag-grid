import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Detail rows are supplied asynchronously via getDetailRowData', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // No master row is auto-expanded, so no detail grid is present initially.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(0);

        // Expand the first master row (Nora Thomas).
        await agIdFor.groupContracted('0', 'name').click();

        // The detail grid appears immediately with its column headers...
        await expect(detailRows).toHaveCount(1);
        await expect(detailRows.first().locator('.ag-header-cell-text')).toContainText([
            'Call Id',
            'Direction',
            'Number',
            'Duration',
            'Switch Code',
        ]);

        // ...but the row data is supplied after a 1s setTimeout, so it eventually renders call records.
        // Nora Thomas's first call record has callId 555, and durations are formatted with an 's' suffix.
        await expect(detailRows.first()).toContainText('555');
        await expect(detailRows.first()).toContainText('s');
    });
});
