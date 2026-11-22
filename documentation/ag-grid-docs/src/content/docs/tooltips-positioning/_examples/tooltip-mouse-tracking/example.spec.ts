import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Tooltip follows the pointer with mouse tracking enabled', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const cell = agIdFor.cell('0', 'age');
        const box = await cell.boundingBox();
        if (!box) {
            throw new Error('age cell not found');
        }
        const y = box.y + box.height / 2;

        // Hover near the left edge of the cell — the tooltip appears near the pointer.
        await page.mouse.move(box.x + 12, y);
        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('This is the Athlete');
        const firstBox = await tooltip.boundingBox();

        // Move the pointer to the right within the same cell. With tooltipMouseTrack the
        // tooltip tracks the pointer, so its x position must increase. A grid that ignored
        // tooltipMouseTrack would leave the tooltip anchored and fail this assertion.
        await page.mouse.move(box.x + box.width - 12, y);
        await page.waitForTimeout(200);
        const secondBox = await tooltip.boundingBox();
        expect(firstBox && secondBox).toBeTruthy();
        expect(secondBox!.x).toBeGreaterThan(firstBox!.x);
    });
});
