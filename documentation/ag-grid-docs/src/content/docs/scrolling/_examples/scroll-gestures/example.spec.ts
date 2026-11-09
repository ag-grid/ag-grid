import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    for (const horizontal of [false, true]) {
        test.eachFramework(
            `switches between native and axis-locked ${horizontal ? 'horizontal' : 'vertical'} gestures`,
            async ({ agIdFor, page }) => {
                await ensureGridReady(page);
                await waitForGridContent(page);

                const select = page.getByLabel('Scroll gesture mode:');
                const viewport = page.locator('.ag-grid-viewport');
                const originalViewport = await viewport.elementHandle();
                const position = () =>
                    viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop }));
                await expect(select).toHaveValue('native');
                await expect(agIdFor.cell('0', 'c0')).toContainText('Row 1, column 1');

                const modes = ['native', 'axisLocked', 'native'];
                for (let i = 0; i < modes.length; i++) {
                    const mode = modes[i];
                    const before = await position();
                    if (i > 0) {
                        await select.selectOption(mode);
                    }
                    await expect(page.locator('.ag-root-wrapper')).toHaveCount(1);
                    expect(await originalViewport!.evaluate((element) => element.isConnected)).toBe(true);
                    expect(await position()).toEqual(before);
                    await viewport.hover();

                    await page.mouse.wheel(horizontal ? 120 : 40, horizontal ? 40 : 120);
                    await expect(async () => {
                        const after = await position();
                        if (mode === 'native') {
                            expect(after.left).toBeGreaterThan(before.left);
                            expect(after.top).toBeGreaterThan(before.top);
                        } else {
                            expect(after).toEqual({
                                left: before.left + (horizontal ? 120 : 0),
                                top: before.top + (horizontal ? 0 : 120),
                            });
                        }
                    }).toPass();
                }
                await originalViewport!.dispose();
            }
        );
    }
});
