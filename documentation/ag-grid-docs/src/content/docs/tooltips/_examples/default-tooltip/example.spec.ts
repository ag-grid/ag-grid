import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Browser tooltips use native title attributes', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // enableBrowserTooltips renders the tooltip text as a native `title` attribute
        // rather than the grid's rich .ag-tooltip element.
        await expect(agIdFor.headerCell('age')).toHaveAttribute('title', 'Tooltip for Age Column Header');
        await expect(agIdFor.cell('0', 'age')).toHaveAttribute('title', /This is the Athlete/);

        // No rich HTML tooltip element should be rendered on hover. Wait well past the
        // default show delay so a rich tooltip that appeared late would still be caught.
        await agIdFor.cell('0', 'age').hover();
        await page.waitForTimeout(2200);
        await expect(page.locator('.ag-tooltip')).toHaveCount(0);
    });
});
