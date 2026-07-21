import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // React-only: with a floating filter focused, horizontal scrolling must not be hijacked. If the
    // reconcile moves the focused input's DOM node, refocus-on-remount runs scrollIntoView and snaps the
    // viewport back to the first column. Focus retention differs by framework, so this guard is React-specific.
    test.reactFunctionalTs('Floating filter focus does not hijack horizontal scroll', async ({ page, agIdFor }) => {
        // Narrow viewport so columns virtualise and the first column scrolls out of view.
        await page.setViewportSize({ width: 800, height: 600 });
        await ensureGridReady(page);

        const athleteFilterInput = agIdFor.floatingFilter('athlete').locator('input');
        await athleteFilterInput.click();
        await expect(athleteFilterInput).toBeFocused();

        const hScroll = page.locator('.ag-body-horizontal-scroll-viewport');

        // Scroll the focused column out of view.
        await hScroll.evaluate((el) => {
            el.scrollLeft = 600;
            el.dispatchEvent(new Event('scroll'));
        });

        // The scroll must stick — pre-fix, the focus-on-remount scrollIntoView snapped it back to 0.
        await expect(async () => {
            const left = await hScroll.evaluate((el) => el.scrollLeft);
            expect(left).toBeGreaterThan(100);
        }).toPass();

        // The floating filter keeps focus (cell kept alive, not remounted/refocused).
        await expect(athleteFilterInput).toBeFocused();
    });

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
