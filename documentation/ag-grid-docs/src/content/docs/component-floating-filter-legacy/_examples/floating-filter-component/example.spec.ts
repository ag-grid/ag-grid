import { dismissValidationOverlay, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The slider floating filter is only implemented for the React, Angular and Vue frameworks.
    test.eachFramework(
        'Grid renders the olympic medal data',
        async ({ agIdFor }) => {
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
            await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        },
        { allowedConsoleMessages: ['warning #348'] }
    );

    test.eachFramework(
        'Slider floating filter applies a greater-than filter',
        async ({ agIdFor, page }) => {
            // The gold slider has max 7; setting it to 7 keeps only rows with gold > 7 (Michael Phelps, 2008).
            const slider = agIdFor.floatingFilter('gold').locator('input[type="range"]');
            await dismissValidationOverlay(page);
            await slider.fill('7');

            await expect(page.locator('.ag-row')).toHaveCount(1);
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
            await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        },
        { allowedConsoleMessages: ['warning #348'] }
    );
});
