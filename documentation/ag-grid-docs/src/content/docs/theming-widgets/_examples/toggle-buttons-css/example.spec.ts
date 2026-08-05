import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Country row-grouped, sport pivoted, gold/silver/bronze/total summed. The toggle-button theme
    // styling is applied to the side bar's Pivot Mode switch, which the user toggles on and off.
    // Values from olympic-winners.json (United States): Alpine Skiing gold total = 4.

    test.eachFramework('Grouping is active before pivot mode is toggled on', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Country row groups are shown, with no pivot result columns yet.
        await expect(agIdFor.rowNode('row-group-country-United States')).toBeVisible();
        await expect(agIdFor.headerGroupCell('pivotGroup_sport_Alpine Skiing_0')).toHaveCount(0);
    });

    test.eachFramework(
        'Toggling Pivot Mode on shows pivoted sport columns with aggregated totals',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            await agIdFor.pivotModeSelect().click();
            await waitForRowAnimations(page);

            await expect(agIdFor.headerGroupCell('pivotGroup_sport_Alpine Skiing_0')).toBeVisible();
            await expect(
                agIdFor.cell('row-group-country-United States', 'pivot_sport_Alpine Skiing_gold')
            ).toContainText('4');
        }
    );

    test.eachFramework(
        'Toggling Pivot Mode off again restores the plain row-grouped view',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            await agIdFor.pivotModeSelect().click();
            await waitForRowAnimations(page);
            await expect(agIdFor.headerGroupCell('pivotGroup_sport_Alpine Skiing_0')).toBeVisible();

            await agIdFor.pivotModeSelect().click();
            await waitForRowAnimations(page);

            await expect(agIdFor.headerGroupCell('pivotGroup_sport_Alpine Skiing_0')).toHaveCount(0);
            await expect(agIdFor.rowNode('row-group-country-United States')).toBeVisible();
        }
    );
});
