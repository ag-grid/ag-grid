import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Cell tooltips show the displayed value or fixed text on hover', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Exclude the previous, fading-out tooltip when moving between hover targets.
        const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');

        // tooltip: true shows the displayed value.
        const athlete = (await agIdFor.cell('0', 'athlete').innerText()).trim();
        await agIdFor.cell('0', 'athlete').hover();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toHaveText(athlete);

        // A string shows fixed text.
        await agIdFor.cell('0', 'country').hover();
        await expect(tooltip).toHaveText('The country the athlete represents');

        // A callback generates the content.
        const year = (await agIdFor.cell('0', 'year').innerText()).trim();
        await agIdFor.cell('0', 'year').hover();
        await expect(tooltip).toHaveText(`Games held in ${year}`);
    });
});
