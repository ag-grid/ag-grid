import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('formats dates and prices and renders the result icon', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'mission')).toContainText('CRS SpX-25');

        // dateFormatter turns "2022-07-15" into a long localised date, not the raw string.
        const dateCell = agIdFor.cell('0', 'date');
        await expect(dateCell).toContainText('Jul');
        await expect(dateCell).toContainText('2022');

        // price valueFormatter prefixes with '£'.
        await expect(agIdFor.cell('0', 'price')).toContainText('£12,480,000');

        // MissionResultRenderer shows a tick icon for successful missions.
        await expect(agIdFor.cell('0', 'successful').locator('img')).toHaveAttribute('src', /tick-in-circle\.png$/);
    });

    test.eachFramework('selecting a row via its checkbox toggles the selected state', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const row = agIdFor.rowNode('0');
        await expect(row).not.toHaveClass(/ag-row-selected/);

        // rowSelection mode 'multiRow' renders a selection checkbox on each row.
        await row.locator('.ag-selection-checkbox').first().click();
        await expect(row).toHaveClass(/ag-row-selected/);
    });
});
