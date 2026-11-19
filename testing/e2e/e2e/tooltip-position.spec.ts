import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';

import type { AgPromise, ICellRendererParams, ITooltipParams } from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

async function expectGap(source: Locator, tooltip: Locator, side: 'top' | 'bottom', gap: number): Promise<void> {
    await expect(async () => {
        const target = (await source.boundingBox())!;
        const popup = (await tooltip.boundingBox())!;
        const actual = side === 'top' ? target.y - popup.y - popup.height : popup.y - target.y - target.height;
        expect(actual).toBeCloseTo(gap, 0);
    }).toPass();
}

test.describe('tooltip positioning', () => {
    test('settles when custom tooltip dimensions depend on placement', async ({ page }) => {
        const { cell } = await mountGrid(page, {
            width: 500,
            height: 110,
            css: '.sized-tooltip { width: 100px; height: 40px; background: white; } .sized-tooltip.ag-tooltip-position-bottom-start { height: 20px; }',
            options: () => ({
                columnDefs: [
                    {
                        field: 'value',
                        width: 400,
                        tooltip: true,
                        tooltipComponent: class {
                            private readonly gui = document.createElement('div');
                            public init(): void {
                                this.gui.className = 'sized-tooltip';
                                this.gui.textContent = 'Tooltip';
                            }
                            public getGui(): HTMLElement {
                                return this.gui;
                            }
                        },
                    },
                ],
                rowData: [{ value: 'Value' }],
                headerHeight: 30,
                rowHeight: 20,
                tooltipShowDelay: 0,
                tooltipMouseTrack: true,
            }),
        });
        await cell(0, 'value').hover({ position: { x: 100, y: 3 } });
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText('Tooltip');
        await cell(0, 'value').hover({ position: { x: 110, y: 3 } });
        // Observe several resize deliveries, not just the first correct placement.
        const placements = await tooltip.evaluate(async (element) => {
            const classes: string[] = [];
            for (let i = 0; i < 8; i++) {
                await new Promise(requestAnimationFrame);
                classes.push(element.className);
            }
            return classes;
        });
        expect(placements.every((value) => value.includes('ag-tooltip-position-bottom-start'))).toBe(true);
    });

    test('keeps tooltips inside an outer scrolling container', async ({ page }) => {
        await mountGrid(page, {
            width: 550,
            height: 600,
            options: () => ({
                columnDefs: [{ field: 'value', width: 350, tooltip: true }],
                rowData: Array.from({ length: 20 }, (_, i) => ({ value: `Row ${i}` })),
                tooltipShowDelay: 0,
            }),
        });
        await page.evaluate(() => {
            const outer = document.createElement('div');
            outer.id = 'outer';
            outer.style.cssText = 'margin:100px 40px;width:600px;height:300px;overflow:auto';
            const grid = document.querySelector('#myGrid')!;
            grid.before(outer);
            outer.appendChild(grid);
            return new Promise<void>((resolve) => {
                outer.addEventListener('scroll', () => resolve(), { once: true });
                outer.scrollTop = 150;
            });
        });
        await page.mouse.move(70, 110);
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText('Row 2');
        await expect(async () => {
            const clip = (await page.locator('#outer').boundingBox())!;
            const popup = (await tooltip.boundingBox())!;
            expect(popup.y).toBeGreaterThanOrEqual(clip.y);
            expect(popup.y + popup.height).toBeLessThanOrEqual(clip.y + clip.height);
        }).toPass();
    });

    for (const layout of ['separate popup parent', 'shared static popup parent', 'shadow host', 'inside shadow root']) {
        test(`dismisses focused tooltips on ancestor scrolling (${layout})`, async ({ page }) => {
            const { cell } = await mountGrid(page, {
                width: 550,
                height: 600,
                shadowDom: layout === 'shadow host' || layout === 'inside shadow root',
                options: () => ({
                    columnDefs: [
                        {
                            field: 'value',
                            tooltip: true,
                            tooltipComponent: class {
                                private readonly gui = document.createElement('div');
                                public init(): void {
                                    this.gui.style.cssText =
                                        'position:absolute;width:160px;height:40px;background:white';
                                    this.gui.textContent = 'Tooltip';
                                }
                                public getGui(): HTMLElement {
                                    return this.gui;
                                }
                            },
                        },
                    ],
                    rowData: [{ value: 'Value' }],
                    tooltipTrigger: 'focus',
                    popupParent: document.body,
                }),
            });
            await page.evaluate((layout) => {
                const host = document.querySelector('#shadow-host');
                const grid = (host?.shadowRoot ?? document).querySelector('#myGrid')!;
                const content = layout === 'shadow host' ? host! : grid;
                const outer = document.createElement('div');
                outer.id = 'scroll-parent';
                outer.style.cssText = 'margin:80px 40px;width:600px;height:300px;overflow:auto';
                content.before(outer);
                outer.appendChild(content);
                if (layout === 'shared static popup parent') {
                    window.gridApi.setGridOption('popupParent', outer);
                }
            }, layout);
            const source = cell(0, 'value');
            await source.focus();
            await expect(page.getByRole('tooltip')).toHaveText('Tooltip');
            const before = (await source.boundingBox())!;

            await page.locator('#scroll-parent').evaluate((element) => {
                element.scrollTop = 40;
            });
            await expect(page.getByRole('tooltip')).toHaveCount(0);
            expect((await source.boundingBox())!.y).toBeCloseTo(before.y - 40, 0);
            await expect(source).toBeFocused();
        });
    }

    for (const scrollTop of [10, 150]) {
        test(`rechecks an async tooltip source after scrolling by ${scrollTop}`, async ({ page }) => {
            const { cell, withApi } = await mountGrid(page, {
                height: 600,
                options: () => ({
                    columnDefs: [
                        {
                            field: 'value',
                            tooltip: true,
                            tooltipComponent: class {
                                private readonly gui = document.createElement('div');
                                private params: ITooltipParams;
                                public init(params: ITooltipParams): AgPromise<void> {
                                    this.params = params;
                                    this.gui.style.cssText = 'position:absolute;width:120px;height:40px';
                                    this.gui.textContent = 'Tooltip';
                                    return new window.agGrid.AgPromise<void>((resolve) => {
                                        params.context.finishInit = resolve;
                                    });
                                }
                                public getGui(): HTMLElement {
                                    return this.gui;
                                }
                                public destroy(): void {
                                    this.params.context.destroyed = true;
                                }
                            },
                        },
                    ],
                    rowData: [{ value: 'Value' }],
                    context: {},
                    tooltipTrigger: 'focus',
                    popupParent: document.body,
                }),
            });
            await page.evaluate(() => {
                const grid = document.querySelector('#myGrid')!;
                const outer = document.createElement('div');
                outer.id = 'scroll-parent';
                outer.style.cssText = 'margin:100px 40px;width:900px;height:180px;overflow:auto';
                grid.before(outer);
                outer.appendChild(grid);
            });
            const source = cell(0, 'value');
            await source.focus();
            await expect.poll(() => withApi((api) => !!api.getGridOption('context').finishInit)).toBe(true);
            await page.locator('#scroll-parent').evaluate(
                (element, scrollTop) =>
                    new Promise<void>((resolve) => {
                        element.addEventListener('scroll', () => resolve(), { once: true });
                        element.scrollTop = scrollTop;
                    }),
                scrollTop
            );
            await withApi((api) => api.getGridOption('context').finishInit());
            const tooltip = page.getByRole('tooltip');
            if (scrollTop === 150) {
                await expect.poll(() => withApi((api) => !!api.getGridOption('context').destroyed)).toBe(true);
                await expect(tooltip).toHaveCount(0);
            } else {
                await expect(tooltip).toHaveText('Tooltip');
                await expectGap(source, tooltip, 'top', 6);
            }
            await expect(source).toBeFocused();
        });
    }

    test('preserves the gap after postProcessPopup resizes the tooltip', async ({ page }) => {
        const { cell } = await mountGrid(page, {
            css: '#myGrid { margin-top: 180px; }',
            options: () => ({
                columnDefs: [{ field: 'value', tooltip: true }],
                rowData: [{ value: 'Tooltip' }],
                tooltipTrigger: 'focus',
                tooltipPosition: 'top',
                popupParent: document.body,
                postProcessPopup: ({ type, ePopup }) => {
                    if (type === 'tooltip') {
                        ePopup.style.height = '100px';
                    }
                },
            }),
        });
        const source = cell(0, 'value');
        await source.focus();
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText('Tooltip');
        expect((await tooltip.boundingBox())!.height).toBe(100);
        await expectGap(source, tooltip, 'top', 6);
    });

    for (const sourceKind of ['header', 'pinned row', 'pinned column', 'full-width row']) {
        test(`anchors partially covered sources at their visible top edge (${sourceKind})`, async ({ page }) => {
            const { grid, cell, withApi } = await mountGrid(page, {
                height: 300,
                options: () => ({
                    columnDefs: [{ field: 'value', tooltip: true }],
                    rowData: Array.from({ length: 20 }, (_, i) => ({ value: `Row ${i}` })),
                    headerHeight: 80,
                    tooltipShowDelay: 0,
                    isFullWidthRow: ({ rowNode }) => !!rowNode.data.fullWidth,
                    fullWidthCellRenderer: (params: ICellRendererParams) => {
                        params.setTooltip(params.data.value);
                        return document.createElement('span');
                    },
                }),
            });
            if (sourceKind === 'pinned row') {
                await withApi((api) => api.setGridOption('pinnedTopRowData', [{ value: 'Pinned' }]));
            } else if (sourceKind === 'pinned column') {
                await withApi((api) => api.applyColumnState({ state: [{ colId: 'value', pinned: 'left' }] }));
            } else if (sourceKind === 'full-width row') {
                await withApi((api) =>
                    api.setGridOption(
                        'rowData',
                        Array.from({ length: 20 }, (_, i) => ({ value: `Row ${i}`, fullWidth: true }))
                    )
                );
            }
            await grid.locator('.ag-grid-viewport').evaluate((element) => {
                element.scrollTop = 20;
            });
            const source =
                sourceKind === 'full-width row' ? grid.locator('.ag-full-width-row[row-index="0"]') : cell(0, 'value');
            await source.hover({ position: { x: 100, y: 35 } });
            const tooltip = page.getByRole('tooltip');
            await expect(tooltip).toHaveText('Row 0');
            await expect(async () => {
                const topRows = (await grid.locator('.ag-grid-pinned-top-rows').boundingBox())!;
                const popup = (await tooltip.boundingBox())!;
                expect(popup.y + popup.height + 6).toBeCloseTo(topRows.y + topRows.height, 0);
            }).toPass();
        });
    }

    test('anchors above the pinned bottom overlay without clipping pinned sources', async ({ page }) => {
        const { grid, cell } = await mountGrid(page, {
            height: 300,
            options: () => ({
                columnDefs: [{ field: 'value', tooltip: true }],
                rowData: Array.from({ length: 20 }, (_, i) => ({ value: `Row ${i}` })),
                pinnedBottomRowData: [{ value: 'Pinned' }],
                headerHeight: 40,
                rowHeight: 40,
                tooltipShowDelay: 0,
                tooltipPosition: 'bottom-start',
                popupParent: document.body,
            }),
        });
        await cell(5, 'value').hover({ position: { x: 100, y: 8 } });
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText('Row 5');
        await expect(async () => {
            const bottom = (await grid.locator('.ag-grid-pinned-bottom-rows').boundingBox())!;
            const popup = (await tooltip.boundingBox())!;
            expect(popup.y).toBeCloseTo(bottom.y + 6, 0);
        }).toPass();
        await page.keyboard.press('Escape');
        await expect(tooltip).toHaveCount(0);
        const pinned = grid.locator('.ag-grid-pinned-bottom-rows .ag-cell');
        await pinned.hover();
        await expect(tooltip).toHaveText('Pinned');
        await expectGap(pinned, tooltip, 'bottom', 6);
    });

    for (const { name, css, scale } of [
        { name: 'scaled down', css: 'position: relative; transform: scale(0.5)', scale: 0.5 },
        { name: 'scaled up', css: 'position: relative; transform: scale(2)', scale: 2 },
        { name: 'transformed static', css: 'transform: translateZ(0)', scale: 1 },
        { name: 'contained static', css: 'contain: layout', scale: 1 },
    ]) {
        for (const anchor of ['target', 'pointer'] as const) {
            test(`positions and flips a ${anchor} tooltip inside a ${name} popup parent`, async ({ page }) => {
                await page.setViewportSize({ width: 1400, height: 1000 });
                const { cell } = await mountGrid(page, {
                    width: 500,
                    height: 300,
                    css: `#myGrid { margin: 40px; border: 8px solid black; transform-origin: top left; ${css} }`,
                    options: () => ({
                        columnDefs: [
                            { field: 'a', width: 200 },
                            { field: 'b', width: 200, tooltip: true },
                        ],
                        rowData: Array.from({ length: 6 }, () => ({ a: 'A', b: 'Tooltip' })),
                        headerHeight: 0,
                        popupParent: document.querySelector<HTMLElement>('#myGrid'),
                        tooltipShowDelay: 0,
                        tooltipSwitchShowDelay: 0,
                    }),
                });
                await page.evaluate((anchor) => window.gridApi.setGridOption('tooltipAnchor', anchor), anchor);

                for (const row of [4, 0]) {
                    const source = cell(row, 'b');
                    const target = (await source.boundingBox())!;
                    const pointer = {
                        x: Math.round(target.x + target.width / 2),
                        y: Math.round(target.y + target.height / 2),
                    };
                    await page.mouse.move(pointer.x, pointer.y);
                    const tooltip = page.getByRole('tooltip');
                    await expect(tooltip).toHaveText('Tooltip');
                    const side = row === 0 ? 'bottom' : 'top';
                    await expect(tooltip).toHaveClass(new RegExp(`ag-tooltip-position-${side}-start`));
                    await expect(async () => {
                        const popup = (await tooltip.boundingBox())!;
                        const x = anchor === 'pointer' ? pointer.x : target.x;
                        const targetY = row === 0 ? target.y + target.height : target.y;
                        const y = anchor === 'pointer' ? pointer.y : targetY;
                        expect(popup.x).toBeCloseTo(x, 0);
                        const gap = row === 0 ? popup.y - y : y - popup.y - popup.height;
                        expect(gap).toBeCloseTo(6 * scale, 0);
                    }).toPass();
                    await page.keyboard.press('Escape');
                    await expect(tooltip).toHaveCount(0);
                }
            });
        }
    }

    for (const { zoom, useNativeZoom } of [
        { zoom: 0.5, useNativeZoom: true },
        { zoom: 2, useNativeZoom: true },
        { zoom: 0.5, useNativeZoom: false },
    ]) {
        for (const anchor of ['target', 'pointer'] as const) {
            test(`positions and flips a ${anchor} tooltip with CSS zoom ${zoom} below its containing block (native zoom: ${useNativeZoom})`, async ({
                page,
            }) => {
                await page.setViewportSize({ width: 1400, height: 1000 });
                const { cell, grid } = await mountGrid(page, {
                    width: 500,
                    height: 300,
                    css: `body { position: relative; margin: 40px; border: 5px solid; } #myGrid { zoom: ${zoom}; border: 8px solid; } .ag-tooltip { height: 40px; }`,
                    options: () => ({
                        columnDefs: [
                            { field: 'a', width: 200 },
                            { field: 'b', width: 200, tooltip: true },
                        ],
                        rowData: Array.from({ length: 7 }, () => ({ a: 'A', b: 'Tooltip' })),
                        headerHeight: 0,
                        rowHeight: 40,
                        tooltipPosition: 'bottom-start',
                        tooltipShowDelay: 0,
                        tooltipSwitchShowDelay: 0,
                        popupParent: document.querySelector<HTMLElement>('#myGrid'),
                    }),
                });
                if (!useNativeZoom) {
                    await page.evaluate(() => {
                        Object.defineProperty(Element.prototype, 'currentCSSZoom', { value: undefined });
                    });
                }
                await page.evaluate((anchor) => window.gridApi.setGridOption('tooltipAnchor', anchor), anchor);
                for (const row of [0, 6]) {
                    const source = cell(row, 'b');
                    const target = (await source.boundingBox())!;
                    const pointer = {
                        x: Math.round(target.x + target.width / 2),
                        y: Math.round(target.y + target.height / 2),
                    };
                    await page.mouse.move(pointer.x, pointer.y);
                    const tooltip = page.getByRole('tooltip');
                    const side = row === 0 ? 'bottom' : 'top';
                    await expect(tooltip).toHaveClass(new RegExp(`ag-tooltip-position-${side}-start`));
                    await expect(async () => {
                        const popup = (await tooltip.boundingBox())!;
                        const bounds = (await grid.boundingBox())!;
                        const x = anchor === 'pointer' ? pointer.x : target.x;
                        const edge = row === 0 ? target.y + target.height : target.y;
                        const y = anchor === 'pointer' ? pointer.y : edge;
                        const gap = row === 0 ? popup.y - y : y - popup.y - popup.height;
                        expect(popup.x).toBeCloseTo(x, 0);
                        expect(gap).toBeCloseTo(6 * zoom, 0);
                        expect(popup.y).toBeGreaterThanOrEqual(bounds.y + 8 * zoom);
                        expect(popup.y + popup.height).toBeLessThanOrEqual(bounds.y + bounds.height - 8 * zoom);
                    }).toPass();
                    await page.keyboard.press('Escape');
                    await expect(tooltip).toHaveCount(0);
                }
            });
        }
    }

    for (const bodyStyle of ['', 'position: relative', 'transform: translateZ(0)', 'contain: layout']) {
        test(`positions body-hosted tooltips after document scrolling (${bodyStyle || 'static'})`, async ({ page }) => {
            const { cell } = await mountGrid(page, {
                width: 500,
                height: 300,
                css: `body { margin: 30px; border: 5px solid black; padding: 150px 70px; min-height: 1500px; ${bodyStyle} }`,
                options: () => ({
                    columnDefs: [{ field: 'value', tooltip: true }],
                    rowData: Array.from({ length: 4 }, (_, i) => ({ value: `Row ${i}` })),
                    popupParent: document.body,
                    tooltipShowDelay: 0,
                }),
            });
            await page.evaluate(() => window.scrollTo(0, 120));
            const source = cell(2, 'value');
            await source.hover();
            const tooltip = page.getByRole('tooltip');
            await expect(tooltip).toHaveText('Row 2');
            await expect(async () => {
                const target = (await source.boundingBox())!;
                const popup = (await tooltip.boundingBox())!;
                expect(popup.x).toBeCloseTo(target.x, 0);
            }).toPass();
            await expectGap(source, tooltip, 'top', 6);
        });
    }

    for (const anchor of ['target', 'pointer'] as const) {
        test(`positions ${anchor}-anchored tooltips after scrolling the document root`, async ({ page }) => {
            await page.setViewportSize({ width: 1000, height: 800 });
            const { cell } = await mountGrid(page, {
                width: 500,
                height: 180,
                css: 'html { overflow-y: auto; } body { padding-top: 900px; min-height: 1800px; }',
                options: () => ({
                    columnDefs: [{ field: 'value', tooltip: true }],
                    rowData: [{ value: 'Tooltip' }],
                    headerHeight: 40,
                    rowHeight: 40,
                    popupParent: document.body,
                    tooltipPosition: 'top',
                    tooltipShowDelay: 0,
                }),
            });
            await page.evaluate((anchor) => window.gridApi.setGridOption('tooltipAnchor', anchor), anchor);
            await page.evaluate(() => window.scrollTo(0, 300));
            const target = (await cell(0, 'value').boundingBox())!;
            const pointer = { x: target.x + 50, y: target.y + 20 };
            await page.mouse.move(pointer.x, pointer.y);
            const tooltip = page.getByRole('tooltip');
            await expect(tooltip).toHaveText('Tooltip');
            await expect(async () => {
                const popup = (await tooltip.boundingBox())!;
                const y = anchor === 'pointer' ? pointer.y : target.y;
                expect(y - popup.y - popup.height).toBeCloseTo(6, 0);
            }).toPass();
        });
    }

    test('keeps a top tooltip clear of its source after delayed content growth', async ({ page }) => {
        const { cell } = await mountGrid(page, {
            options: () => ({
                columnDefs: [
                    {
                        field: 'value',
                        tooltip: true,
                        tooltipComponent: class {
                            private gui = document.createElement('div');
                            private timer?: ReturnType<typeof setTimeout>;

                            public init(): void {
                                this.gui.textContent = 'Loading';
                                this.gui.style.cssText = 'width:180px;height:24px;background:white';
                                this.timer = setTimeout(() => {
                                    this.gui.textContent = 'Loaded';
                                    this.gui.style.height = '100px';
                                }, 500);
                            }

                            public getGui(): HTMLElement {
                                return this.gui;
                            }
                            public destroy(): void {
                                clearTimeout(this.timer);
                            }
                        },
                    },
                ],
                rowData: Array.from({ length: 8 }, (_, i) => ({ value: `Row ${i}` })),
                tooltipShowDelay: 0,
            }),
        });
        const source = cell(4, 'value');
        await source.hover();
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText('Loading');
        await expectGap(source, tooltip, 'top', 6);
        await expect(tooltip).toHaveText('Loaded');
        await expectGap(source, tooltip, 'top', 6);
        expect(
            await source.evaluate((element) => {
                const rect = element.getBoundingClientRect();
                return element.contains(
                    document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
                );
            })
        ).toBe(true);
    });

    for (const sourceKind of ['cell', 'header', 'group'] as const) {
        test(`anchors a clipped ${sourceKind} clear of pinned columns`, async ({ page }) => {
            const { grid, cell, headerCell, withApi } = await mountGrid(page, {
                width: 700,
                height: 350,
                options: () => ({
                    columnDefs: [
                        { field: 'left', pinned: 'left', width: 120 },
                        {
                            headerName: 'Group',
                            headerTooltip: true,
                            children: [
                                { field: 'a', width: 300, tooltip: true, headerTooltip: true },
                                { field: 'b', width: 300 },
                            ],
                        },
                        { field: 'right', pinned: 'right', width: 120 },
                    ],
                    rowData: Array.from({ length: 4 }, () => ({ left: 'Left', a: 'Tooltip', b: 'B', right: 'Right' })),
                    tooltipShowDelay: 0,
                }),
            });
            await withApi((api) => api.ensureColumnVisible('b', 'end'));
            const source = sourceKind === 'cell' ? cell(2, 'a') : headerCell('a');
            const target =
                sourceKind === 'group' ? grid.locator('.ag-header-group-cell').filter({ hasText: 'Group' }) : source;
            const leftPinned = (await cell(2, 'left').boundingBox())!;
            const rightPinned = (await cell(2, 'right').boundingBox())!;
            const visibleLeft = leftPinned.x + leftPinned.width;
            const visibleRight = rightPinned.x;
            await expect(async () => {
                const bounds = (await target.boundingBox())!;
                expect(bounds.x).toBeLessThan(visibleLeft);
            }).toPass();
            const bounds = (await target.boundingBox())!;
            const x = (Math.max(bounds.x, visibleLeft) + Math.min(bounds.x + bounds.width, visibleRight)) / 2;
            await page.mouse.move(x, bounds.y + bounds.height / 2);
            const tooltip = page.getByRole('tooltip');
            const text = { cell: 'Tooltip', header: 'A', group: 'Group' };
            await expect(tooltip).toHaveText(text[sourceKind]);
            await expect(async () => {
                const popup = (await tooltip.boundingBox())!;
                expect(popup.x).toBeCloseTo(visibleLeft, 0);
            }).toPass();
        });
    }
    test('anchors a clipped RTL cell before the right pinned column', async ({ page }) => {
        const { cell, withApi } = await mountGrid(page, {
            width: 600,
            height: 350,
            options: () => ({
                enableRtl: true,
                columnDefs: [
                    { field: 'right', pinned: 'right', width: 180 },
                    { field: 'a', width: 300, tooltip: true },
                    { field: 'b', width: 300 },
                ],
                rowData: Array.from({ length: 4 }, () => ({ right: 'Right', a: 'Tooltip', b: 'B' })),
                tooltipShowDelay: 0,
            }),
        });
        await withApi((api) => api.ensureColumnVisible('b', 'end'));
        const source = cell(2, 'a');
        const pinned = (await cell(2, 'right').boundingBox())!;
        await expect(async () => {
            const bounds = (await source.boundingBox())!;
            expect(bounds.x + bounds.width).toBeGreaterThan(pinned.x);
        }).toPass();
        const bounds = (await source.boundingBox())!;
        await page.mouse.move(pinned.x - 30, bounds.y + bounds.height / 2);
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText('Tooltip');
        await expect(async () => {
            const popup = (await tooltip.boundingBox())!;
            expect(popup.x + popup.width).toBeCloseTo(pinned.x, 0);
        }).toPass();
    });
    for (const trigger of ['hover', 'focus'] as const) {
        test(`defaults to top-start of the target on ${trigger}`, async ({ page }) => {
            const { cell } = await mountGrid(page, {
                width: 500,
                height: 300,
                css: '#myGrid { margin: 60px; }',
                options: () => ({
                    columnDefs: [{ field: 'value', width: 280, tooltip: true }],
                    rowData: Array.from({ length: 4 }, (_, i) => ({ value: `Row ${i}` })),
                    popupParent: document.body,
                    tooltipTrigger: 'hoverOrFocus',
                    tooltipShowDelay: 0,
                }),
            });
            const source = cell(2, 'value');
            if (trigger === 'hover') {
                await source.hover({ position: { x: 170, y: 20 } });
            } else {
                await source.focus();
            }
            const tooltip = page.getByRole('tooltip');
            await expect(tooltip).toHaveText('Row 2');
            await expect(tooltip).toHaveClass(/ag-tooltip-position-top-start/);
            await expect(async () => {
                const target = (await source.boundingBox())!;
                const popup = (await tooltip.boundingBox())!;
                expect(popup.x).toBeCloseTo(target.x, 0);
            }).toPass();
            await expectGap(source, tooltip, 'top', 6);
        });
    }

    test('an undefined position callback uses logical top-start in RTL', async ({ page }) => {
        const { cell } = await mountGrid(page, {
            width: 500,
            height: 300,
            css: '#myGrid { margin: 60px; }',
            options: () => ({
                columnDefs: [{ field: 'value', width: 280, tooltip: true }],
                rowData: Array.from({ length: 4 }, (_, i) => ({ value: `Row ${i}` })),
                enableRtl: true,
                popupParent: document.body,
                tooltipPosition: () => undefined,
                tooltipShowDelay: 0,
            }),
        });
        const source = cell(2, 'value');
        await source.hover({ position: { x: 30, y: 20 } });
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText('Row 2');
        await expect(tooltip).toHaveClass(/ag-tooltip-position-top-start/);
        await expect(async () => {
            const target = (await source.boundingBox())!;
            const popup = (await tooltip.boundingBox())!;
            expect(popup.x + popup.width).toBeCloseTo(target.x + target.width, 0);
        }).toPass();
        await expectGap(source, tooltip, 'top', 6);
    });

    test('a bottom-start pointer tooltip flips before clamping and leaves the bottom cell clickable', async ({
        page,
    }) => {
        await page.setViewportSize({ width: 480, height: 320 });
        const { cell, withApi } = await mountGrid(page, {
            width: 320,
            height: 162,
            css: '#myGrid { position: absolute; left: 40px; bottom: 0; }',
            options: () => ({
                columnDefs: [{ field: 'value', width: 300, tooltip: true }],
                rowData: Array.from({ length: 4 }, (_, i) => ({ value: `Row ${i}` })),
                headerHeight: 0,
                rowHeight: 40,
                popupParent: document.body,
                tooltipAnchor: 'pointer',
                tooltipPosition: 'bottom-start',
                tooltipTrigger: 'hoverOrFocus',
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
                context: { clicked: [] as number[] },
                onCellClicked: ({ context, rowIndex }) => context.clicked.push(rowIndex),
                postProcessPopup: ({ type, ePopup, tooltipPosition }) => {
                    if (type === 'tooltip') {
                        ePopup.dataset.reportedPosition = tooltipPosition;
                        ePopup.dataset.positionClassReady = String(
                            ePopup.classList.contains(`ag-tooltip-position-${tooltipPosition}`)
                        );
                        ePopup.dataset.arrowReady = String(
                            ePopup.style.getPropertyValue('--ag-tooltip-arrow-offset') !== ''
                        );
                    }
                },
            }),
        });
        const source = cell(3, 'value');
        const target = (await source.boundingBox())!;
        const point = { x: target.x + 30, y: target.y + target.height - 3 };
        await page.mouse.move(point.x, point.y);
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText('Row 3');
        await expect(tooltip).toHaveAttribute('data-reported-position', 'top-start');
        await expect(tooltip).toHaveAttribute('data-position-class-ready', 'true');
        await expect(tooltip).toHaveAttribute('data-arrow-ready', 'true');
        await expect(tooltip).toHaveClass(/ag-tooltip-position-top-start/);
        await expect(async () => {
            const popup = (await tooltip.boundingBox())!;
            expect(popup.x).toBeCloseTo(point.x, 0);
            expect(point.y - (popup.y + popup.height)).toBeCloseTo(6, 0);
        }).toPass();
        expect(
            await source.evaluate(
                (element, point) => element.contains(document.elementFromPoint(point.x, point.y)),
                point
            )
        ).toBe(true);
        await page.mouse.click(point.x, point.y);
        await expect.poll(() => withApi((api) => api.getGridOption('context').clicked)).toEqual([3]);

        // Focus must ignore the explicit pointer anchor and the pointer still resting over row 3.
        const focused = cell(1, 'value');
        await focused.focus();
        await expect(tooltip).toHaveText('Row 1');
        await expect(tooltip).toHaveClass(/ag-tooltip-position-bottom-start/);
        await expect(async () => {
            const target = (await focused.boundingBox())!;
            const popup = (await tooltip.boundingBox())!;
            expect(popup.x).toBeCloseTo(target.x, 0);
        }).toPass();
        await expectGap(focused, tooltip, 'bottom', 6);
    });

    test('mouse tracking implies a pointer anchor only for hover', async ({ page }) => {
        const { cell } = await mountGrid(page, {
            width: 500,
            height: 300,
            css: '#myGrid { margin: 60px; }',
            options: () => ({
                columnDefs: [{ field: 'value', width: 280, tooltip: true }],
                rowData: Array.from({ length: 4 }, (_, i) => ({ value: `Row ${i}` })),
                popupParent: document.body,
                tooltipMouseTrack: true,
                tooltipTrigger: 'hoverOrFocus',
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
            }),
        });
        const hovered = cell(2, 'value');
        await hovered.hover({ position: { x: 40, y: 25 } });
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText('Row 2');
        const initial = (await tooltip.boundingBox())!;
        await hovered.hover({ position: { x: 120, y: 25 } });
        await expect.poll(async () => (await tooltip.boundingBox())!.x - initial.x).toBeCloseTo(80, 0);

        const focused = cell(1, 'value');
        await focused.focus();
        await expect(tooltip).toHaveText('Row 1');
        await expect(async () => {
            const target = (await focused.boundingBox())!;
            const popup = (await tooltip.boundingBox())!;
            expect(popup.x).toBeCloseTo(target.x, 0);
        }).toPass();
        await expectGap(focused, tooltip, 'top', 6);
    });

    test('mouse tracking flips back to the preferred side when space becomes available', async ({ page }) => {
        const { cell } = await mountGrid(page, {
            width: 700,
            height: 250,
            options: () => ({
                columnDefs: [{ field: 'value', width: 650, tooltip: true }],
                rowData: [{ value: 'Tracking tooltip' }],
                tooltipMouseTrack: true,
                tooltipPosition: 'right-start',
                tooltipShowDelay: 0,
            }),
        });
        const source = cell(0, 'value');
        const target = (await source.boundingBox())!;
        for (const x of [30, 620, 30]) {
            const pointerX = target.x + x;
            await page.mouse.move(pointerX, target.y + 20);
            const tooltip = page.getByRole('tooltip');
            await expect(tooltip).toHaveText('Tracking tooltip');
            const side = x === 620 ? 'left' : 'right';
            await expect(tooltip).toHaveClass(new RegExp(`ag-tooltip-position-${side}-start`));
            await expect(async () => {
                const popup = (await tooltip.boundingBox())!;
                const gap = side === 'left' ? pointerX - popup.x - popup.width : popup.x - pointerX;
                expect(gap).toBeCloseTo(6, 0);
            }).toPass();
        }
    });

    test('shifts within popupParent and the viewport while honouring the configured gap', async ({ page }) => {
        await page.setViewportSize({ width: 420, height: 400 });
        const { grid, cell } = await mountGrid(page, {
            width: 300,
            height: 260,
            css: '#myGrid { position: absolute; left: 80px; top: 60px; } .ag-tooltip { width: 180px; box-sizing: border-box; }',
            options: () => ({
                columnDefs: ['a', 'b', 'c'].map((field) => ({ field, width: 100, tooltip: true })),
                rowData: Array.from({ length: 4 }, () => ({ a: 'A', b: 'B', c: 'Shifted tooltip' })),
                popupParent: document.querySelector<HTMLElement>('#myGrid')!,
                tooltipOffset: 14,
                tooltipShowDelay: 0,
            }),
        });
        const source = cell(2, 'c');
        await source.hover({ position: { x: 30, y: 20 } });
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText('Shifted tooltip');
        await expect(tooltip).toHaveClass(/ag-tooltip-position-top-start/);
        await expect(async () => {
            const parent = (await grid.boundingBox())!;
            const target = (await source.boundingBox())!;
            const popup = (await tooltip.boundingBox())!;
            expect(popup.x).toBeLessThan(target.x);
            expect(popup.x).toBeGreaterThanOrEqual(parent.x);
            expect(popup.x + popup.width).toBeLessThanOrEqual(parent.x + parent.width);
            expect(popup.y).toBeGreaterThanOrEqual(parent.y);
            expect(popup.y + popup.height).toBeLessThanOrEqual(parent.y + parent.height);
            expect(popup.x + popup.width).toBeLessThanOrEqual(page.viewportSize()!.width);
            expect(target.y - (popup.y + popup.height)).toBeCloseTo(14, 0);
        }).toPass();

        await page.mouse.move(10, 10);
        await expect(tooltip).toHaveCount(0);
        await grid.evaluate((element) => (element.style.left = '180px'));
        const target = (await source.boundingBox())!;
        // Use real coordinates without Locator.hover scrolling the partly clipped column into view.
        await page.mouse.move(target.x + 10, target.y + 20);
        await expect(tooltip).toHaveText('Shifted tooltip');
        await expect(async () => {
            const parent = (await grid.boundingBox())!;
            const popup = (await tooltip.boundingBox())!;
            expect(parent.x + parent.width).toBeGreaterThan(page.viewportSize()!.width);
            expect(popup.x).toBeGreaterThanOrEqual(parent.x);
            expect(popup.x + popup.width).toBeLessThanOrEqual(page.viewportSize()!.width);
        }).toPass();
    });

    test('wraps built-in text tooltips inside the visible part of popupParent', async ({ page }) => {
        await page.setViewportSize({ width: 420, height: 400 });
        const { cell } = await mountGrid(page, {
            width: 300,
            height: 260,
            css: '#myGrid { position: absolute; left: 180px; top: 50px; }',
            options: () => ({
                columnDefs: [{ field: 'value', width: 100, tooltip: true }],
                rowData: Array.from({ length: 4 }, () => ({
                    value: 'An ordinary text tooltip with enough words to need wrapping in a narrow viewport.',
                })),
                popupParent: document.querySelector<HTMLElement>('#myGrid')!,
                tooltipShowDelay: 0,
            }),
        });
        await cell(2, 'value').hover();
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toBeVisible();
        await expect(async () => {
            const popup = (await tooltip.boundingBox())!;
            expect(popup.x).toBeGreaterThanOrEqual(180);
            expect(popup.x + popup.width).toBeLessThanOrEqual(page.viewportSize()!.width);
            expect(await tooltip.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
        }).toPass();
    });

    for (const position of ['top-start', 'bottom-end'] as const) {
        test(`keeps a calculated-size arrow clear of rounded corners at ${position}`, async ({ page }) => {
            const { cell } = await mountGrid(page, {
                css: '#myGrid { margin: 60px; }',
                options: () => ({
                    theme: window.agGrid.themeQuartz.withParams({
                        spacing: 4,
                        borderRadius: 6,
                        tooltipArrowSize: { calc: 'spacing * 5' },
                    }),
                    columnDefs: [{ field: 'value', width: 350, tooltip: true }],
                    rowData: Array.from({ length: 4 }, () => ({ value: 'Tooltip with a calculated-size arrow' })),
                    tooltipOffset: 30,
                    tooltipShowDelay: 0,
                }),
            });
            await page.evaluate((position) => window.gridApi.setGridOption('tooltipPosition', position), position);
            await cell(2, 'value').hover();
            const tooltip = page.getByRole('tooltip');
            await expect(tooltip).toBeVisible();
            await expect(async () => {
                const { offset, radius, arrowSize, width } = await tooltip.evaluate((element) => {
                    const style = getComputedStyle(element);
                    const arrow = getComputedStyle(element, '::after');
                    return {
                        offset: parseFloat(arrow.left) + element.clientLeft,
                        radius: parseFloat(style.borderRadius),
                        arrowSize: parseFloat(arrow.clipPath.slice('circle('.length)),
                        width: element.getBoundingClientRect().width,
                    };
                });
                expect(offset - arrowSize).toBeGreaterThanOrEqual(radius - 0.5);
                expect(offset + arrowSize).toBeLessThanOrEqual(width - radius + 0.5);
            }).toPass();
        });
    }

    for (const wrapped of [false, true]) {
        test(`custom tooltips clamp their own arrows (framework wrapper: ${wrapped})`, async ({ page }) => {
            const { cell } = await mountGrid(page, {
                css: `
                    .custom-tooltip { position: relative; width: 180px; height: 60px; border-radius: 24px; background: white; }
                    .custom-tooltip::after {
                        content: ''; position: absolute; top: 100%; width: 16px; height: 16px;
                        left: clamp(36px, var(--ag-tooltip-arrow-offset), calc(100% - 36px));
                        transform: translate(-50%, -50%) rotate(45deg); background: inherit;
                    }
                `,
                options: () => {
                    class CustomTooltip {
                        private gui: HTMLElement;

                        public init(params: { context: { wrapped: boolean } }): void {
                            const content = document.createElement('div');
                            content.className = 'custom-tooltip';
                            content.textContent = 'Custom tooltip';
                            this.gui = params.context.wrapped ? document.createElement('div') : content;
                            if (params.context.wrapped) {
                                this.gui.appendChild(content);
                            }
                        }

                        public getGui(): HTMLElement {
                            return this.gui;
                        }
                    }
                    return {
                        columnDefs: [{ field: 'value', width: 300, tooltip: true, tooltipComponent: CustomTooltip }],
                        rowData: Array.from({ length: 4 }, () => ({ value: 'Value' })),
                        tooltipShowDelay: 0,
                    };
                },
            });
            await page.evaluate((wrapped) => window.gridApi.setGridOption('context', { wrapped }), wrapped);
            await cell(2, 'value').hover();
            const tooltip = page.locator('.ag-tooltip-custom');
            await expect(tooltip).toBeVisible();
            await expect(tooltip).toHaveClass(/ag-tooltip-position-top-start/);
            await expect(async () => {
                const geometry = await tooltip.evaluate((element) => {
                    const content = element.matches('.custom-tooltip') ? element : element.firstElementChild!;
                    const arrow = getComputedStyle(content, '::after');
                    return {
                        targetOffset: parseFloat(element.style.getPropertyValue('--ag-tooltip-arrow-offset')),
                        arrowOffset: parseFloat(arrow.left),
                        arrowRadius: parseFloat(arrow.width) / Math.SQRT2,
                        cornerRadius: parseFloat(getComputedStyle(content).borderRadius),
                    };
                });
                expect(geometry.targetOffset).toBe(12);
                expect(geometry.arrowOffset - geometry.arrowRadius).toBeGreaterThanOrEqual(geometry.cornerRadius);
            }).toPass();
        });
    }

    for (const scale of [1, 0.5, 2]) {
        test(`positions within a bordered, scrolled popup parent (${scale})`, async ({ page }) => {
            await page.setViewportSize({ width: 1000, height: 800 });
            const { cell } = await mountGrid(page, {
                width: 350,
                height: 400,
                options: () => {
                    const popupParent = document.createElement('div');
                    popupParent.style.cssText =
                        'position:relative;margin:40px;width:400px;height:240px;overflow:auto;border:8px solid black';
                    document.body.appendChild(popupParent);
                    popupParent.appendChild(document.querySelector('#myGrid')!);
                    popupParent.scrollTop = 80;
                    return {
                        columnDefs: [{ field: 'value', tooltip: true }],
                        rowData: Array.from({ length: 8 }, (_, i) => ({ value: `Row ${i}` })),
                        popupParent,
                        tooltipShowDelay: 0,
                    };
                },
            });
            await page.evaluate((scale) => {
                const parent = window.gridApi.getGridOption('popupParent')!;
                parent.style.transform = `scale(${scale})`;
                parent.style.transformOrigin = 'top left';
            }, scale);
            const source = cell(4, 'value');
            await source.hover();
            const tooltip = page.getByRole('tooltip');
            await expect(tooltip).toHaveText('Row 4');
            await expect(async () => {
                const target = (await source.boundingBox())!;
                const popup = (await tooltip.boundingBox())!;
                expect(popup.x).toBeCloseTo(target.x, 0);
            }).toPass();
            await expectGap(source, tooltip, 'top', 6 * scale);
        });
    }

    test('the default non-interactive tooltip accepts the pointer across the target gap', async ({ page }) => {
        const { cell, withApi } = await mountGrid(page, {
            options: () => ({
                columnDefs: [{ field: 'value', tooltip: true }],
                rowData: Array.from({ length: 4 }, (_, i) => ({ value: `Row ${i}` })),
                tooltipShowDelay: 0,
            }),
        });
        expect(await withApi((api) => api.getGridOption('tooltipInteraction'))).toBe(false);
        const source = cell(2, 'value');
        await source.hover({ position: { x: 30, y: 2 } });
        const tooltip = page.getByRole('tooltip');
        await expect(tooltip).toHaveText('Row 2');
        const popup = (await tooltip.boundingBox())!;
        const point = { x: popup.x + popup.width / 2, y: popup.y + popup.height / 2 };
        await page.mouse.move(point.x, point.y, { steps: 5 });
        // Observe beyond the leave delay: the tooltip, not the row under it, must own the pointer.
        await page.waitForTimeout(200);
        await expect(tooltip).toHaveText('Row 2');
        expect(
            await tooltip.evaluate(
                (element, point) => element.contains(document.elementFromPoint(point.x, point.y)),
                point
            )
        ).toBe(true);
        await expect(tooltip).not.toBeFocused();
        await page.keyboard.press('Escape');
        await expect(tooltip).toHaveCount(0);
    });

    test('a context menu suppresses source tooltips but still positions its menu-item tooltip', async ({ page }) => {
        const { cell } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'value', width: 400, tooltip: true }],
                rowData: Array.from({ length: 4 }, (_, i) => ({ value: `Row ${i}` })),
                tooltipShowDelay: 0,
                tooltipSwitchShowDelay: 0,
                tooltipPosition: () => 'right-start',
                getContextMenuItems: () => [{ name: 'Action', tooltip: 'Menu hint' }],
                postProcessPopup: ({ type, ePopup, tooltipLocation }) => {
                    if (type === 'tooltip') {
                        ePopup.dataset.tooltipLocation = tooltipLocation;
                    }
                },
            }),
        });
        const tooltip = page.getByRole('tooltip');
        await cell(0, 'value').hover({ position: { x: 20, y: 20 } });
        await expect(tooltip).toHaveText('Row 0');
        const sourceTooltip = await tooltip.elementHandle();
        await cell(0, 'value').click({ button: 'right', position: { x: 20, y: 20 } });
        expect(await sourceTooltip!.isVisible()).toBe(false);
        const item = page.getByRole('menuitem', { name: /^Action/ });
        await expect(item).toBeVisible();
        await expect(tooltip).toHaveCount(0);
        await cell(3, 'value').hover({ position: { x: 350, y: 20 } });
        // Allow a forbidden source tooltip's zero-delay show and switch delay to fire.
        await page.waitForTimeout(200);
        await expect(tooltip).toHaveCount(0);

        await item.hover();
        await expect(tooltip).toHaveText('Menu hint');
        await expect(tooltip).toHaveAttribute('data-tooltip-location', 'menu');
        await expect(tooltip).toHaveClass(/ag-tooltip-position-right-start/);
        const target = (await item.boundingBox())!;
        const popup = (await tooltip.boundingBox())!;
        expect(popup.x).toBeGreaterThanOrEqual(target.x + target.width);
        await expect(item).toBeVisible();
    });
});
