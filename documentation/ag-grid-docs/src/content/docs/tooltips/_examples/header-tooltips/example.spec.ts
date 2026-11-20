import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Header and column group tooltips show on hover', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Exclude the previous, fading-out tooltip when moving between hover targets.
        const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');

        // A string shows fixed text.
        await agIdFor.headerCell('athlete').hover();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toHaveText("The athlete's full name");

        // headerTooltip: true shows the displayed header name.
        await agIdFor.headerCell('country').hover();
        await expect(tooltip).toHaveText('Country of Origin');

        // Column groups accept headerTooltip too.
        await page.locator('.ag-header-group-cell', { hasText: 'Results' }).hover();
        await expect(tooltip).toHaveText('Medals won at the event');

        await agIdFor.headerCell('gold').hover();
        await expect(tooltip).toHaveText('Gold medals won');
    });
});
