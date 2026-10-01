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

    // Tab-into-tooltip and Escape-to-close need a tooltip with focusable content, which this
    // example's plain-text tooltip does not have — Tab here falls through to the generic
    // "key pressed outside the tooltip" path and dismisses it, so an Escape assertion would
    // pass whether or not Escape were handled. That pair is covered by the
    // custom-tooltip-interaction example instead, whose tooltip is a form.
});
