import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The example creates a range chart into the #myChart container on first data rendered.
        const chart = page.locator('#myChart .ag-chart');
        await expect(chart).toBeVisible();
        await expect(page.locator('#myChart canvas').first()).toBeVisible();

        // Download Chart Image (PNG) — uses getChartImageDataURL() + an anchor download.
        const [pngDownload] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'Download Chart Image (PNG)' }).click(),
        ]);
        expect(pngDownload.suggestedFilename()).toContain('image');

        // Download Chart Image (JPG 800x500) — uses downloadChart() with fileName 'resizedImage'.
        const [jpgDownload] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'Download Chart Image (JPG 800x500)' }).click(),
        ]);
        expect(jpgDownload.suggestedFilename()).toContain('resizedImage');

        // Open Chart Image (JPG) — uses getChartImageDataURL() and opens the image in a new window.
        const [popup] = await Promise.all([
            page.waitForEvent('popup'),
            page.getByRole('button', { name: 'Open Chart Image (JPG)' }).click(),
        ]);
        await expect(popup.locator('img')).toBeVisible();
        await popup.close();
    });
});
