import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom drag & drop image appears while dragging a column', async ({ page }) => {
        await waitForGridContent(page);

        // The side bar (with the Columns tool panel) and the row group panel are present.
        await expect(page.getByRole('tab', { name: 'Columns' })).toBeVisible();
        const rowGroupPanel = page.locator('.ag-column-drop-rowgroup').first();
        await expect(rowGroupPanel).toBeVisible();

        // Drag a column header towards the row group panel; the custom drag image should render during the drag.
        const athleteHeader = page.locator('.ag-header-cell[col-id="athlete"]');
        await expect(athleteHeader).toBeVisible();

        const cover = page.locator('.my-custom-drag-and-drop-cover');
        await expect(cover).toHaveCount(0);

        const headerBox = (await athleteHeader.boundingBox())!;
        const dropBox = (await rowGroupPanel.boundingBox())!;
        await page.mouse.move(headerBox.x + headerBox.width / 2, headerBox.y + headerBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(headerBox.x + headerBox.width / 2 + 15, headerBox.y + headerBox.height / 2 + 15, {
            steps: 5,
        });
        await page.mouse.move(dropBox.x + dropBox.width / 2, dropBox.y + dropBox.height / 2, { steps: 10 });

        // The custom cover is shown and uses the configured accent colour (SlateGray).
        await expect(cover).toBeVisible();
        await expect(cover).toHaveCSS('background-color', 'rgb(112, 128, 144)');

        await page.mouse.up();
        await expect(cover).toHaveCount(0);
    });
});
