import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders the fetched data with the company logo renderer', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'mission')).toContainText('CRS SpX-25');
        await expect(agIdFor.cell('0', 'company').locator('img')).toBeVisible();
    });

    test.eachFramework('editing a cell commits the new value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // defaultColDef.editable is true, so double-clicking opens the cell editor.
        const missionCell = agIdFor.cell('0', 'mission');
        await missionCell.dblclick();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.type('Test Mission');
        await page.keyboard.press('Enter');

        await expect(missionCell).toContainText('Test Mission');
    });
});
