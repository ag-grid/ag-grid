import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The first master row (Nora Thomas, account 177000) is auto-expanded and its master
    // data is refreshed every two seconds: calls++ and half of the detail durations change.
    // Refresh Strategy 'rows' keeps the same Detail Grid instance: getDetailRowData is called
    // again and setRowData updates the rows, but the custom template (title) is set only once.
    // Only the non-React variants use the custom string template that renders the title.
    test.eachFramework(
        'Refresh Rows updates detail row data while keeping the title',
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

            const usesTemplate = !agFramework.includes('react');
            if (usesTemplate) {
                // Title is 'Nora Thomas 24 calls' on load.
                await expect(detailRow).toContainText('Nora Thomas 24 calls');
            }

            // The second detail row (odd index) has its duration incremented on every refresh.
            const durationCell = detailRow.locator('.ag-cell[col-id="duration"]').nth(1);
            const durationBefore = (await durationCell.textContent())?.trim();

            // Wait for at least one master refresh to occur (calls increments past the initial 24).
            const masterCalls = agIdFor.cell('177000', 'calls');
            await expect(masterCalls).not.toHaveText('24');

            if (usesTemplate) {
                // Refresh Rows keeps the Detail Grid instance, so the once-set template title stays at 24.
                await expect(detailRow).toContainText('Nora Thomas 24 calls');
            }

            // But the row data was refreshed in place, so the duration value changed.
            const durationAfter = (await durationCell.textContent())?.trim();
            expect(durationAfter).not.toBe(durationBefore);
        }
    );
});
