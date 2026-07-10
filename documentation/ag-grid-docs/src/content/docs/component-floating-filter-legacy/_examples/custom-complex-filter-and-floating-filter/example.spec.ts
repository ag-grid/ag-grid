import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.typescript('Grid renders the olympic medal data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.typescript(
        'jQuery slider floating filter drives the custom greater-than filter',
        async ({ agIdFor, page }) => {
            // The gold slider has max 7. Move the handle to 7 with the keyboard so only
            // rows with gold > 7 remain (Michael Phelps, 2008 - the sole row in the dataset).
            const handle = agIdFor.floatingFilter('gold').locator('.ui-slider-handle');
            await handle.focus();
            for (let i = 0; i < 7; i++) {
                await page.keyboard.press('ArrowRight');
            }

            await expect(page.locator('.ag-row')).toHaveCount(1);
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
            await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        }
    );
});
