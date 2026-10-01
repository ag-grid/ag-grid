import { expect, test } from '@playwright/test';
import path from 'node:path';

declare const agGrid: typeof import('../src/main');

test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

for (const enableRtl of [false, true]) {
    for (const rowCount of [1, 50]) {
        test(`dragging the horizontal scrollbar to the end stays there (rtl=${enableRtl}, rows=${rowCount})`, async ({
            page,
        }) => {
            await page.setContent(`
                <!DOCTYPE html>
                <style>
                    ::-webkit-scrollbar { width: 15px; height: 15px; }
                    ::-webkit-scrollbar-button { display: none; }
                    ::-webkit-scrollbar-thumb { background: #888; }
                    ::-webkit-scrollbar-track { background: #eee; }
                </style>
                <div id="myGrid" style="width: 550px; height: 300px"></div>
            `);
            await page.addScriptTag({ path: path.join(__dirname, '../dist/ag-grid-community.js') });
            await page.evaluate(
                ({ enableRtl, rowCount }) => {
                    agGrid.createGrid(document.querySelector<HTMLElement>('#myGrid')!, {
                        enableRtl,
                        columnDefs: [
                            { field: 'athlete', minWidth: 150 },
                            { field: 'age', maxWidth: 90 },
                            { field: 'country', minWidth: 150 },
                            { field: 'year', maxWidth: 90 },
                            { field: 'date', minWidth: 150 },
                            { field: 'sport', minWidth: 150 },
                            { field: 'gold' },
                            { field: 'silver' },
                            { field: 'bronze' },
                            { field: 'total' },
                        ],
                        rowData: Array.from(
                            { length: rowCount },
                            (_, i): Record<string, string | number> => ({
                                athlete: `Athlete ${i}`,
                                total: i,
                            })
                        ),
                    });
                },
                { enableRtl, rowCount }
            );

            const scrollbar = page.locator('.ag-body-horizontal-scroll-viewport');
            await expect(page.locator('.ag-body-horizontal-scroll')).toHaveCSS('height', '15px');
            await expect(page.locator('.ag-body-horizontal-scroll-end-spacer')).toHaveCSS(
                'width',
                rowCount > 1 ? '15px' : '0px'
            );

            const { x, y, width, height, thumbWidth, maxScrollLeft } = await scrollbar.evaluate((element) => {
                const { x, y, width, height } = element.getBoundingClientRect();
                return {
                    x,
                    y,
                    width,
                    height,
                    thumbWidth: (width * element.clientWidth) / element.scrollWidth,
                    maxScrollLeft: element.scrollWidth - element.clientWidth,
                };
            });
            await page.mouse.move(x + (enableRtl ? width - thumbWidth / 2 : thumbWidth / 2), y + height / 2);
            await page.mouse.down();
            try {
                await page.mouse.move(x + (enableRtl ? -30 : width + 30), y + height / 2, { steps: 30 });
                await expect
                    .poll(() =>
                        scrollbar.evaluate((element) => ({
                            position: Math.abs(element.scrollLeft),
                            gridPosition: Math.abs(document.querySelector('.ag-grid-viewport')!.scrollLeft),
                        }))
                    )
                    .toEqual({ position: maxScrollLeft, gridPosition: maxScrollLeft });
            } finally {
                await page.mouse.up();
            }
        });
    }
}
