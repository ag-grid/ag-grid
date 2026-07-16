import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const LIMIT_WARNING = 'limit of 1000 generated columns has been exceeded';

// The example configures pivotMaxGeneratedColumns: 1000 with an onPivotMaxColumnsExceeded
// handler that logs a warning. The `athlete` column has enablePivot, so pivoting by it
// generates far more than 1000 pivot result columns, tripping the limit: the grid halts
// column generation, clears the view, and fires onPivotMaxColumnsExceeded.
test.agExample(import.meta, () => {
    test.eachFramework(
        'Pivoting by athlete exceeds the generated-column limit',
        async ({ page, remoteGrid }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const remoteApi = remoteGrid(page, '1');

            // Baseline: no active pivot, so only the value columns are shown (no pivot result columns).
            const initialCols = await page.locator('.ag-header-cell[col-id]').count();
            expect(initialCols).toBeGreaterThan(0);
            expect(await page.locator('.ag-header-cell[col-id^="pivot_"]').count()).toBe(0);

            // Capture the warning emitted by onPivotMaxColumnsExceeded.
            const warnings: string[] = [];
            const handler = (msg: { type: () => string; text: () => string }) => {
                if (msg.type() === 'warning' || msg.type() === 'error') {
                    warnings.push(msg.text());
                }
            };
            page.on('console', handler);

            // Pivot by athlete: too many unique values -> exceeds pivotMaxGeneratedColumns (1000).
            await remoteApi.setPivotColumns(['athlete']);

            // The handler fires and logs the documented warning.
            await expect(() => {
                expect(warnings.some((w) => w.includes(LIMIT_WARNING))).toBe(true);
            }).toPass();

            // Column generation is halted and the pivot view is cleared - no pivot result columns rendered.
            await expect(page.locator('.ag-header-cell[col-id^="pivot_"]')).toHaveCount(0);

            page.off('console', handler);
        },
        { allowedConsoleMessages: [LIMIT_WARNING] }
    );
});
