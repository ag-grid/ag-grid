import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Refresh Strategy 'everything' destroys and recreates the Detail Panel on each master
    // refresh, so getDetailRowData runs again, the row data updates, and the custom template
    // (title) is rebuilt with the new call count.
    test.eachFramework(
        'Refresh Everything recreates the detail panel and updates the title',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const detailRow = page.locator('.ag-details-row').first();
            await expect(detailRow).toBeVisible();

            // Detail Grid renders the call-record columns from detailGridOptions.
            await expect(detailRow.locator('.ag-header-cell-text')).toContainText([
                'Call Id',
                'Direction',
                'Number',
                'Duration',
                'Switch Code',
            ]);

            // Title is 'Nora Thomas 24 calls' on load.
            await expect(detailRow).toContainText('Nora Thomas 24 calls');

            // Wait for at least one master refresh to occur (calls increments past the initial 24).
            const masterCalls = agIdFor.cell('177000', 'calls');
            await expect(masterCalls).not.toHaveText('24');

            // The template is rebuilt on recreation, so the title no longer shows the initial count.
            await expect(page.locator('.ag-details-row').first()).not.toContainText('Nora Thomas 24 calls');
            await expect(page.locator('.ag-details-row').first()).toContainText('calls');
        }
    );
});
