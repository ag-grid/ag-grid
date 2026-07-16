import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const usGroup = agIdFor.rowNode('row-group-country-United States').first();
        await expect(usGroup).toHaveClass(/ag-full-width-row/);

        // The fully custom groupRowRenderer replaces the default group cell renderer.
        await expect(usGroup.locator('.eValueContainer')).toHaveText('United States');
        const status = usGroup.locator('.eGroupStatus');
        await expect(status).toHaveText('→');
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
