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

    test.eachFramework(
        'shouldDisplayTooltip suppresses the tooltip once nothing is truncated',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const athleteCell = agIdFor.cell('0', 'athlete');
            await expect(athleteCell).toContainText('Michael Phelps');

            // Widen the athlete column so its content is no longer clipped. The renderer's
            // shouldDisplayTooltip callback compares scrollWidth to clientWidth at hover time,
            // so the tooltip must now be suppressed.
            const resizer = agIdFor.headerCell('athlete').locator('.ag-header-cell-resize');
            const box = await resizer.boundingBox();
            expect(box).toBeTruthy();
            await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
            await page.mouse.down();
            await page.mouse.move(box!.x + box!.width / 2 + 300, box!.y + box!.height / 2, { steps: 10 });
            await page.mouse.up();

            await athleteCell.hover();
            // The default show delay is 2000ms; wait past it before concluding nothing appeared.
            await page.waitForTimeout(2500);
            await expect(page.locator('.ag-tooltip')).toHaveCount(0);
        }
    );
});
