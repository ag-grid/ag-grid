import type { Page } from '@playwright/test';

import { test } from '../test-utils';

export async function scrollGridRelative(
    method: 'wheel' | 'element',
    page: Page,
    { x, y, xStep, yStep }: { x?: number; y?: number; xStep?: number; yStep?: number },
    waitForTimeout = 10
) {
    async function scrollElement() {
        const verticalView = page.locator('.ag-body-viewport.ag-row-animation.ag-layout-normal');
        const horizontalView = page.locator('.ag-viewport.ag-center-cols-viewport');

        if (y !== undefined) {
            if (yStep !== undefined) {
                let currentY = 0;
                const isNegative = y < 0;
                while (isNegative ? currentY > y : currentY < y) {
                    await verticalView.evaluate(
                        (el, { yStep }) => {
                            el.scrollTop += yStep;
                        },
                        { yStep }
                    );
                    currentY += yStep;
                }
            } else {
                await verticalView.evaluate((el, { y }) => (el.scrollTop += y), { y });
            }
            await page.waitForTimeout(waitForTimeout);
        }

        if (x !== undefined) {
            if (xStep !== undefined) {
                let currentX = 0;
                const isNegative = x < 0;
                while (isNegative ? currentX > x : currentX < x) {
                    await horizontalView.evaluate(
                        (el, { xStep }) => {
                            el.scrollLeft += xStep;
                        },
                        { xStep }
                    );
                    currentX += xStep;
                }
            } else {
                await horizontalView.evaluate((el, { x }) => (el.scrollLeft += x), { x });
            }
            await page.waitForTimeout(waitForTimeout);
        }
    }

    async function scrollWheel() {
        if (y !== undefined) {
            if (yStep !== undefined) {
                let currentY = 0;
                const isNegative = y < 0;
                while (isNegative ? currentY > y : currentY < y) {
                    await page.mouse.wheel(0, yStep);
                    await page.waitForTimeout(waitForTimeout);
                    currentY += yStep;
                }
            } else {
                await page.mouse.wheel(0, y);
                await page.waitForTimeout(waitForTimeout);
            }
        }

        if (x !== undefined) {
            if (xStep !== undefined) {
                let currentX = 0;
                const isNegative = x < 0;
                while (isNegative ? currentX > x : currentX < x) {
                    await page.mouse.wheel(xStep, 0);
                    await page.waitForTimeout(waitForTimeout);
                    currentX += xStep;
                }
            } else {
                await page.mouse.wheel(x, 0);
                await page.waitForTimeout(waitForTimeout);
            }
        }
    }
    const directionWord = [];

    if (x !== undefined && x !== 0) {
        directionWord.push(x > 0 ? 'right' : 'left');
    }

    if (y !== undefined && y !== 0) {
        directionWord.push(y > 0 ? 'down' : 'up');
    }

    await test.step(`Scroll grid ${directionWord.join('-')}`, async () => {
        if (method === 'element') {
            await scrollElement();
        } else if (method === 'wheel') {
            await scrollWheel();
        } else {
            // TODO: implement scrolling with keyboard, and scrollbars
        }
    });
}
