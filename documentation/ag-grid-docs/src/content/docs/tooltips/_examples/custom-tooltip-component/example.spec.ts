import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom tooltip component renders on hover', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // A previous tooltip lingers (fading out) after moving hover targets, so target the
        // most recently opened one with .last().
        const latestTooltip = page.locator('.custom-tooltip').last();

        // The Age column uses the default custom tooltip component (default background).
        await agIdFor.cell('0', 'age').hover();
        await expect(latestTooltip).toBeVisible();
        await expect(latestTooltip).toContainText('Custom Tooltip');

        // The Athlete column passes tooltipComponentParams { color: '#55AA77' }.
        await agIdFor.cell('0', 'athlete').hover();
        await expect(latestTooltip).toBeVisible();
        await expect(latestTooltip).toHaveCSS('background-color', 'rgb(85, 170, 119)');
    });
});
