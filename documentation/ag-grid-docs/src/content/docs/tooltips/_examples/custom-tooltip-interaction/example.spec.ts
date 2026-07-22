import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Interactive custom tooltip updates the cell on submit', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const athleteCell = agIdFor.cell('0', 'athlete');
        const originalValue = (await athleteCell.innerText()).trim();

        const tooltip = page.locator('.custom-tooltip:not(.ag-tooltip-hiding)');

        // Hover the Athlete cell to open the interactive custom tooltip form.
        await athleteCell.hover();
        await expect(tooltip).toBeVisible();

        const input = tooltip.locator('input');
        await expect(input).toHaveValue(originalValue);

        // Edit the value and submit; the form calls node.setDataValue and hideTooltipCallback.
        await input.fill('Edited Athlete');
        await tooltip.locator('button[type="submit"]').click();

        // The submitted value is written back to the Athlete cell.
        await expect(athleteCell).toContainText('Edited Athlete');
    });
});
