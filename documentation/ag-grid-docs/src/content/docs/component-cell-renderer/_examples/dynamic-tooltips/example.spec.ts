import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renderer tooltip shows when shouldDisplayTooltip returns true', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 0 = Michael Phelps with 8 gold medals (olympic-winners.json)
        await agIdFor.cell('0', 'athlete').hover();

        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toHaveText('Won more than one gold medal at these Games');
    });

    test.eachFramework(
        'shouldDisplayTooltip is evaluated on hover, so editing Gold enables the tooltip',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Row 3 = Natalie Coughlin with 1 gold medal, so no tooltip yet.
            const athleteCell = agIdFor.cell('3', 'athlete');
            await expect(athleteCell).toContainText('Natalie Coughlin');
            await athleteCell.hover();
            // The default show delay is 2000ms; wait past it before concluding nothing appeared.
            await page.waitForTimeout(2500);
            await expect(page.locator('.ag-tooltip')).toHaveCount(0);

            const goldCell = agIdFor.cell('3', 'gold');
            await goldCell.dblclick();
            await page.keyboard.press('ControlOrMeta+a');
            await page.keyboard.type('2');
            await page.keyboard.press('Enter');
            await expect(goldCell).toHaveText('2');

            await athleteCell.hover();
            const tooltip = page.locator('.ag-tooltip');
            await expect(tooltip).toBeVisible();
            await expect(tooltip).toHaveText('Won more than one gold medal at these Games');
        }
    );
});
