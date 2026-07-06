import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('print layout toggles across both buttons', async ({ page, remoteGrid }) => {
        const remoteApi = remoteGrid(page, '1');
        const gridRoot = page.locator('.ag-root-wrapper');

        await waitForGridContent(page);

        // Starts in normal layout.
        await expect(gridRoot).toBeVisible();
        await expect(gridRoot).toHaveClass(/ag-layout-normal/);
        expect(await remoteApi.getGridOption('domLayout')).toBe('normal');

        // Printer Friendly Layout -> print layout, grid stays visible with every row.
        await page.getByRole('button', { name: 'Printer Friendly Layout' }).click();
        await waitForGridContent(page);
        await expect(gridRoot).toHaveClass(/ag-layout-print/);
        expect(await remoteApi.getGridOption('domLayout')).toBe('print');
        await expect(gridRoot).toBeVisible();

        // Regression guard: print layout must render every row and keep a real
        // height in all frameworks.
        const printHeight = (await gridRoot.boundingBox())!.height;
        expect(printHeight).toBeGreaterThan(400);
        await expect(page.locator('.ag-row')).toHaveCount(200);

        // Normal Layout -> back to normal layout, still visible.
        await page.getByRole('button', { name: 'Normal Layout' }).click();
        await waitForGridContent(page);
        await expect(gridRoot).toHaveClass(/ag-layout-normal/);
        expect(await remoteApi.getGridOption('domLayout')).toBe('normal');
        await expect(gridRoot).toBeVisible();
    });
});
