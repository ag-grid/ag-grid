import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('theme buttons bind the theme class', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const grid = page.locator('#myGrid');
        await expect(grid).toHaveClass(/ag-theme-quartz/);

        await page.getByRole('button', { name: 'Alpine Dark', exact: true }).click();
        await expect(grid).toHaveClass(/ag-theme-alpine-dark/);

        await page.getByRole('button', { name: 'Balham', exact: true }).click();
        await expect(grid).toHaveClass(/ag-theme-balham/);
        await expect(grid).not.toHaveClass(/ag-theme-alpine-dark/);
    });
});
