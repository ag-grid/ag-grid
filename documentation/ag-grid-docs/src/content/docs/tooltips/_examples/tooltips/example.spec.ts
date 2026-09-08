import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Cell and header tooltips show on hover', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Exclude the previous, fading-out tooltip when moving between hover targets.
        const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');

        // Age column uses a fixed tooltip string.
        await agIdFor.cell('0', 'age').hover();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('This is the Athlete');

        // Year column uses a dynamic tooltip based on the cell value.
        const yearValue = (await agIdFor.cell('0', 'year').innerText()).trim();
        await agIdFor.cell('0', 'year').hover();
        await expect(tooltip).toContainText(`dynamic tooltip using the value of ${yearValue}`);

        // Header tooltip.
        await agIdFor.headerCell('athlete').hover();
        await expect(tooltip).toContainText('Tooltip for Athlete Column Header');
    });
});
