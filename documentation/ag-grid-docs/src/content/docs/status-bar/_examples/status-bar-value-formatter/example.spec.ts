import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('total row count is rendered via the custom valueFormatter', async ({ page }) => {
        await ensureGridReady(page);

        // The valueFormatter divides counts above 1000 by 1000 and appends " K":
        // 8618 -> (8618 / 1000).toFixed(1) + ' K' === '8.6 K'.
        await expect(page.locator('.ag-status-panel-total-row-count')).toContainText('8.6 K');
    });
});
