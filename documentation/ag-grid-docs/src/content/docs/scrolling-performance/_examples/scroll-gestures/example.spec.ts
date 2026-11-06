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
                await expect(select).toHaveValue('native');

                const modes = ['native', 'axisLocked', 'native'];
                for (let i = 0; i < modes.length; i++) {
                    const mode = modes[i];
                    if (i > 0) {
                        await select.selectOption(mode);
                    }
                    await expect(page.locator('.ag-root-wrapper')).toHaveCount(1);
                    await expect(async () => {
                        const position = await viewport.evaluate((element) => ({
                            left: element.scrollLeft,
                            top: element.scrollTop,
                        }));
                        expect(position).toEqual({ left: 0, top: 0 });
                    }).toPass();
                    await expect(agIdFor.cell('0', 'c0')).toContainText('Row 1, column 1');
                    await agIdFor.cell('0', 'c0').hover();

                    await page.mouse.wheel(horizontal ? 120 : 40, horizontal ? 40 : 120);
                    await expect(async () => {
                        const position = await viewport.evaluate((element) => ({
                            left: element.scrollLeft,
                            top: element.scrollTop,
                        }));
                        if (mode === 'native') {
                            expect(position.left).toBeGreaterThan(0);
                            expect(position.top).toBeGreaterThan(0);
                        } else {
                            expect(position).toEqual({ left: horizontal ? 120 : 0, top: horizontal ? 0 : 120 });
                        }
                    }).toPass();
                }
            }
        );
    }
});
