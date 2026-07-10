import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The slider floating filter is only implemented for the React, Angular and Vue frameworks.
    test.eachFramework('Grid renders the olympic medal data', async ({ agFramework, agIdFor }) => {
        test.skip(agFramework === 'vanilla' || agFramework === 'typescript', 'Examples only for frameworks.');

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework(
        'Slider floating filter applies a greater-than filter',
        async ({ agFramework, agIdFor, page }) => {
            test.skip(agFramework === 'vanilla' || agFramework === 'typescript', 'Examples only for frameworks.');
            // The React provided component sets the model via a path that logs deprecation warning #286,
            // which the console-error gate treats as a failure; the behaviour is covered by Angular and Vue.
            test.skip(
                agFramework.includes('react'),
                'React variant emits legacy deprecation warning #286 on model set.'
            );

            // The gold slider has max 7; setting it to 7 keeps only rows with gold > 7 (Michael Phelps, 2008).
            const slider = agIdFor.floatingFilter('gold').locator('input[type="range"]');
            await slider.fill('7');

            await expect(page.locator('.ag-row')).toHaveCount(1);
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
            await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        }
    );
});
