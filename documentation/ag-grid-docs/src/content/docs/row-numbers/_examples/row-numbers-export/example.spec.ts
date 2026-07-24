import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFileSync } from 'node:fs';

test.agExample(import.meta, () => {
    test.eachFramework('Renders sequential row numbers', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.rowNumber('0')).toContainText('1');
        await expect(agIdFor.rowNumber('1')).toContainText('2');
        await expect(agIdFor.rowNumber('2')).toContainText('3');
    });

    test.eachFramework('CSV export includes the row numbers column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Export via the right-click context menu; defaultCsvExportParams.exportRowNumbers is true.
        const downloadPromise = page.waitForEvent('download');
        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await page.getByText('Export', { exact: true }).hover();
        await page.getByText('CSV Export', { exact: true }).click();

        const download = await downloadPromise;
        const csvPath = await download.path();
        const lines = readFileSync(csvPath, 'utf8').split('\n');

        // The data column is still present, and each data row is prefixed with its row number.
        expect(lines[0]).toContain('Athlete');
        expect(lines[1]).toMatch(/^"1",/);
        expect(lines[2]).toMatch(/^"2",/);
    });
});
