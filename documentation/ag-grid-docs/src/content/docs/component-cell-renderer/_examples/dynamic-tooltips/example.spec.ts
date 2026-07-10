import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom renderer registers a dynamic tooltip', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0 = Michael Phelps (olympic-winners.json)
        const athleteCell = agIdFor.cell('0', 'athlete');
        await expect(athleteCell).toContainText('Michael Phelps');

        // The narrow (120px) athlete column truncates the text, so hovering shows the dynamic tooltip
        await athleteCell.hover();

        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Dynamic Tooltip for Michael Phelps');
    });
});
