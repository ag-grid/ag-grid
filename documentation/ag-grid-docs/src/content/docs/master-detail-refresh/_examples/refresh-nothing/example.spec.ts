import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Refresh Strategy 'nothing' performs no detail refresh: getDetailRowData is never called
    // again, so the Detail Grid keeps its old data and the title is unchanged, even though the
    // Master Grid row (calls count) still updates every two seconds.
    test.eachFramework(
        'Refresh Nothing leaves the detail grid unchanged while the master updates',
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

            // Capture the second detail row's duration (the master refresh would change odd rows).
            const durationCell = detailRow.locator('.ag-cell[col-id="duration"]').nth(1);
            const durationBefore = (await durationCell.textContent())?.trim();

            // Wait for at least one master refresh to occur (calls increments past the initial 24).
            const masterCalls = agIdFor.cell('177000', 'calls');
            await expect(masterCalls).not.toHaveText('24');

            // No detail refresh happened: title still shows the initial count and the data is untouched.
            await expect(detailRow).toContainText('Nora Thomas 24 calls');
            const durationAfter = (await durationCell.textContent())?.trim();
            expect(durationAfter).toBe(durationBefore);
        }
    );
});
