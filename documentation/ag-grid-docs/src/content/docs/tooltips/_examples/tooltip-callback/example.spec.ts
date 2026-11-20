import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Callbacks derive cell and header tooltips from the row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Exclude the previous, fading-out tooltip when moving between hover targets.
        const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');

        // The Athlete tooltip shows the row's country.
        const country = (await agIdFor.cell('0', 'country').innerText()).trim();
        await agIdFor.cell('0', 'athlete').hover();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toHaveText(country);

        // The Year tooltip derives from the cell value.
        const year = (await agIdFor.cell('0', 'year').innerText()).trim();
        await agIdFor.cell('0', 'year').hover();
        await expect(tooltip).toHaveText(`Games held in ${year}`);

        // Header callbacks receive the displayed header name as value.
        await agIdFor.headerCell('sport').hover();
        await expect(tooltip).toHaveText('Column: Sport');
    });
});
