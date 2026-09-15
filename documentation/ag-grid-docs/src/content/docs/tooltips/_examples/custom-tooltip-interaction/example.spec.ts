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

    test.eachFramework('Tab moves focus into the tooltip and Escape closes it', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const athleteCell = agIdFor.cell('0', 'athlete');
        const tooltip = page.locator('.custom-tooltip:not(.ag-tooltip-hiding)');

        // Focus the cell rather than hovering it: Tab is only routed into the tooltip when
        // the keydown originates from the tooltip's source element.
        await athleteCell.click();
        await expect(tooltip).toBeVisible();

        // The first focusable element in the tooltip is the name input.
        await page.keyboard.press('Tab');
        await expect(tooltip.locator('input')).toBeFocused();

        // Escape closes the tooltip and returns focus to the source cell. A non-Escape key
        // pressed inside the tooltip does not close it, so this distinguishes the two.
        await page.keyboard.press('a');
        await expect(tooltip).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.locator('.custom-tooltip')).toHaveCount(0);
        await expect(athleteCell).toBeFocused();
    });
});
