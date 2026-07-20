import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('shows the total row count in the left-aligned panel', async ({ page }) => {
        await ensureGridReady(page);

        await expect(page.locator('.ag-status-panel-total-row-count')).toContainText('8,618');
    });

    test.eachFramework(
        'aggregation panel only shows the configured avg and sum funcs',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            // statusPanelParams.aggFuncs is limited to ['avg', 'sum'], so only those two
            // aggregations should appear for a selected range (gold values 8, 6, 4).
            await agIdFor.cell('0', 'gold').click();
            await agIdFor.cell('2', 'gold').click({ modifiers: ['Shift'] });

            const aggregations = page.locator('.ag-status-panel-aggregations');
            await expect(aggregations.locator('.ag-status-name-value').filter({ hasText: 'Average' })).toContainText(
                '6'
            );
            await expect(aggregations.locator('.ag-status-name-value').filter({ hasText: 'Sum' })).toContainText('18');

            // Count, Min and Max are not configured, so they must not be shown.
            await expect(aggregations).not.toContainText('Count');
            await expect(aggregations).not.toContainText('Min');
            await expect(aggregations).not.toContainText('Max');
        }
    );
});
