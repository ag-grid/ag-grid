import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const usGroup = agIdFor.rowNode('row-group-country-United States').first();
        await expect(usGroup).toHaveClass(/ag-full-width-row/);

        // The fully custom groupRowRenderer replaces the default group cell renderer. It renders
        // the group value text plus an arrow (a div with a rotate transform); the arrow is matched
        // by its inline rotate style so the selector works across frameworks.
        await expect(usGroup).toContainText('United States', { useInnerText: true });
        const status = usGroup.locator('div[style*="rotate"]');
        await expect(status).toBeVisible();
        // Default group cell renderer parts are not present.
        await expect(usGroup.locator('.ag-group-value')).toHaveCount(0);

        // Clicking the custom chevron expands the group and rotates the arrow.
        await status.click();
        await expect(usGroup).toHaveClass(/ag-row-group-expanded/);
        await expect(status).toHaveAttribute('style', /rotate\(90deg\)/);
        await expect(page.locator('[row-id^="row-group-country-United States-year-"]').first()).toBeVisible();

        // Clicking again collapses it.
        await status.click();
        await expect(usGroup).toHaveClass(/ag-row-group-contracted/);
        await expect(status).toHaveAttribute('style', /rotate\(0deg\)/);
    });
});
