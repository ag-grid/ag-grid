import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Headers derive names and show static headerTooltip on hover', async ({ agIdFor, page }) => {
        // Header names are derived from the field (camelCase -> Title Case)
        await expect(agIdFor.headerCell('athlete')).toContainText('Athlete');
        await expect(agIdFor.headerCell('total')).toContainText('Total');

        // Hovering the header reveals the static headerTooltip (tooltipShowDelay: 500)
        await agIdFor.headerCell('athlete').hover();
        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText("The athlete's name");
    });

    test.eachFramework('headerTooltipValueGetter builds the tooltip dynamically', async ({ agIdFor, page }) => {
        // gold/silver/bronze use headerTooltipValueGetter -> `How many ${field} medals`
        await agIdFor.headerCell('gold').hover();
        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('How many gold medals');

        // Move to a different header and confirm the dynamic value changes
        // (the previous tooltip animates out, so scope to the visible one)
        await agIdFor.headerCell('bronze').hover();
        await expect(page.locator('.ag-tooltip:not(.ag-tooltip-hiding)')).toContainText('How many bronze medals');
    });
});
