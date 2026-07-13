import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('detailRowAutoHeight sizes the detail row to fit all its call records', async ({ page }) => {
        await waitForGridContent(page);

        const masterRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('[col-id="name"]', { hasText: name }) })
                .first();

        // Liam Padberg has 15 call records.
        await expect(masterRow('Liam Padberg')).toBeVisible();
        await masterRow('Liam Padberg').locator('.ag-group-contracted').first().click();

        const detail = page
            .locator('.ag-details-row')
            .filter({ has: page.locator('[col-id="callId"]', { hasText: '2000' }) })
            .first();
        await expect(detail).toBeVisible();

        // With detailRowAutoHeight all 15 records render inside the detail grid — the detail
        // row auto-sizes to fit them, so nothing is clipped by a fixed detail row height.
        await expect(detail.locator('.ag-row')).toHaveCount(15);

        // The details row is far taller than the default fixed detail row height (~300px),
        // proving it grew to fit all 15 records.
        const box = await detail.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThan(400);
    });
});
