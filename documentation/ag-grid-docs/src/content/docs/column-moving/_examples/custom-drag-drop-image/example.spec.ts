import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('grid renders with data', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('dragging a column header shows the custom drag-and-drop image', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        const cover = page.locator('.my-custom-drag-and-drop-cover');
        await expect(cover).toHaveCount(0);

        // Start dragging the athlete header — the custom dragAndDropImageComponent should render.
        const header = agIdFor.headerCell('athlete');
        const box = await header.boundingBox();
        expect(box).not.toBeNull();

        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.mouse.down();
        await page.mouse.move(box!.x + box!.width / 2 + 40, box!.y + box!.height / 2, { steps: 5 });
        await page.mouse.move(box!.x + box!.width / 2 + 200, box!.y + box!.height / 2, { steps: 10 });

        await expect(cover.first()).toBeVisible();
        // The label reflects the dragged column's header name.
        await expect(cover.first()).toContainText('Athlete');

        await page.mouse.up();
    });
});
