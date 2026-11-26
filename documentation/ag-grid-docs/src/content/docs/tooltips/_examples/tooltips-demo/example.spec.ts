import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Cell and header tooltips combine across columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Exclude the previous, fading-out tooltip when moving between hover targets.
        const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');

        const athlete = (await agIdFor.cell('0', 'athlete').innerText()).trim();
        await agIdFor.cell('0', 'athlete').hover();
        await expect(tooltip).toHaveText(athlete);

        await agIdFor.cell('0', 'country').hover();
        await expect(tooltip).toHaveText('The country the athlete represents');

        const year = (await agIdFor.cell('0', 'year').innerText()).trim();
        await agIdFor.cell('0', 'year').hover();
        await expect(tooltip).toHaveText(`Games held in ${year}`);

        await agIdFor.headerCell('country').hover();
        await expect(tooltip).toHaveText("The athlete's nationality");
    });

    test.eachFramework('Total cell and header use the custom tooltip component', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const custom = page.locator('.custom-tooltip').last();

        const total = (await agIdFor.cell('0', 'total').innerText()).trim();
        expect(total).toMatch(/medals$/);
        await agIdFor.cell('0', 'total').hover();
        await expect(custom).toContainText('Custom Tooltip');
        await expect(custom).toContainText(total);
        await expect(custom).toHaveCSS('background-color', 'rgb(85, 170, 119)');

        await agIdFor.headerCell('total').locator('.ag-header-cell-text').hover();
        await expect(custom).toContainText('Column: Total Medals');
    });

    test.eachFramework('Keyboard focus shows tooltips for cells and grid controls', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');
        const cell = agIdFor.cell('1', 'country');
        await cell.focus();
        await expect(cell).toBeFocused();
        await expect(tooltip).toHaveText('The country the athlete represents');

        const nextPage = page.getByRole('button', { name: 'Next Page', exact: true });
        await nextPage.focus();
        await expect(nextPage).toBeFocused();
        await expect(tooltip).toContainText('Go to next page');
    });
});
