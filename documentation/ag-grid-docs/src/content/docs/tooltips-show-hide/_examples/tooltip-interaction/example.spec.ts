import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Interactive tooltip stays visible while hovered', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tooltip = page.locator('.ag-tooltip');

        await agIdFor.cell('0', 'age').hover();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('This is the Athlete');

        // With tooltipInteraction enabled, moving the cursor onto the tooltip keeps it open.
        await tooltip.hover();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('This is the Athlete');
    });

    test.eachFramework('Interactive tooltip content can be selected', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tooltip = page.locator('.ag-tooltip');
        await agIdFor.cell('0', 'age').hover();
        await expect(tooltip).toBeVisible();

        // tooltipInteraction turns off the pointer-events/user-select suppression that
        // makes a normal tooltip inert, so its text can be selected and copied.
        await expect(tooltip).not.toHaveCSS('pointer-events', 'none');
        const userSelect = await tooltip.evaluate(
            (el) => getComputedStyle(el).userSelect || (getComputedStyle(el) as any).webkitUserSelect
        );
        expect(userSelect).not.toBe('none');
    });

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
