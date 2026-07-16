import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Refresh Strategy 'everything' destroys and recreates the Detail Panel on each master
    // refresh, so getDetailRowData runs again and the detail grid data updates. The non-React
    // variants also wrap the detail grid in a custom template whose title shows the call count,
    // which is rebuilt on recreation.
    test.eachFramework(
        'Refresh Everything recreates the detail panel and updates the data',
        async ({ agIdFor, agFramework, page }) => {
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

            // Only the non-React variants use the custom string template that renders a title.
            const usesTemplate = !agFramework.includes('react');
            if (usesTemplate) {
                // Title is 'Nora Thomas 24 calls' on load.
                await expect(detailRow).toContainText('Nora Thomas 24 calls');
            }

            // Capture an odd detail row's duration; the master refresh increments odd rows' duration.
            const durationCell = detailRow.locator('.ag-cell[col-id="duration"]').nth(1);
            const durationBefore = (await durationCell.textContent())?.trim();

            // Wait for at least one master refresh to occur (calls increments past the initial 24).
            const masterCalls = agIdFor.cell('177000', 'calls');
            await expect(masterCalls).not.toHaveText('24');

            // The panel is recreated and getDetailRowData re-runs, so the detail data reflects the update.
            await expect(
                page.locator('.ag-details-row').first().locator('.ag-cell[col-id="duration"]').nth(1)
            ).not.toHaveText(durationBefore ?? '');

            if (usesTemplate) {
                // The template is rebuilt on recreation, so the title no longer shows the initial count.
                await expect(page.locator('.ag-details-row').first()).not.toContainText('Nora Thomas 24 calls');
                await expect(page.locator('.ag-details-row').first()).toContainText('calls');
            }
        }
    );
});
