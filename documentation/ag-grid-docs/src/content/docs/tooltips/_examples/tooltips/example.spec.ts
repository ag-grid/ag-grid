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

        // With a valueFormatter, tooltip: true shows the formatted value.
        const total = (await agIdFor.cell('0', 'total').innerText()).trim();
        expect(total).toMatch(/medals$/);
        await agIdFor.cell('0', 'total').hover();
        await expect(tooltip).toHaveText(total);

        // A string shows fixed text.
        await agIdFor.cell('0', 'age').hover();
        await expect(tooltip).toHaveText('Age at the time of the event');
    });
});
