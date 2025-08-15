import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example Tab Focus', async ({ page, agIdFor }) => {
        // force the viewport width to be 800px so that columns are virtualised
        await page.setViewportSize({ width: 800, height: 600 });

        // focus the first cell
        await agIdFor.cell('0', 'athlete').click();
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        // Shift tab to the last header
        await page.keyboard.press('Shift+Tab', {
            delay: 100,
        });

        await expect(agIdFor.headerCell('athlete')).toBeHidden();

        await expect(agIdFor.headerCell('total')).toHaveText('Total');
        await expect(agIdFor.floatingFilter('total')).toBeFocused();

        // Press tab to focus the first cell again
        await page.keyboard.press('Tab', {
            delay: 100,
        });
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
        await expect(agIdFor.cell('0', 'athlete')).toBeFocused();
    });
});
