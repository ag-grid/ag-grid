import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

/** What the browser draws at the centre of the Medals group label: the label itself, or a header covering it. */
const medalsLabelShown = (page: Page) =>
    page.evaluate(() => {
        const text = Array.from(document.querySelectorAll('.ag-header-group-text')).find(
            (element) => element.textContent === 'Medals'
        );
        const rect = text?.getBoundingClientRect();
        const drawn = rect && document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return {
            sticky: !!text?.closest('.ag-sticky-label'),
            covered: drawn ? !text!.contains(drawn) && !drawn.contains(text!) : null,
        };
    });

test.describe('community grid in a real browser', () => {
    test('RTL left-pinned columns keep their visual order through resizing, dragging and scrolling', async ({
        page,
    }) => {
        const { grid, headerCell, cell, withApi } = await mountGrid(page, {
            width: 800,
            options: () => ({
                enableRtl: true,
                defaultColDef: { width: 100 },
                columnDefs: [
                    {
                        headerName: 'Pinned',
                        groupId: 'pinned',
                        children: [
                            { field: 'a', pinned: 'left' },
                            { field: 'b', pinned: 'left', width: 150 },
                        ],
                    },
                    { field: 'c', width: 300 },
                    { field: 'd', width: 300 },
                    { field: 'e', width: 300 },
                    { field: 'f', pinned: 'right' },
                ],
                rowData: [{ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }],
            }),
        });

        await expect(async () => {
            const a = (await headerCell('a').boundingBox())!;
            const b = (await headerCell('b').boundingBox())!;
            expect(b.x + b.width).toBeCloseTo(a.x, 0);
            expect((await cell(0, 'a').boundingBox())!.x).toBeCloseTo(a.x, 0);
            expect((await cell(0, 'b').boundingBox())!.x).toBeCloseTo(b.x, 0);
            const group = (await grid.locator('.ag-header-group-cell').filter({ hasText: 'Pinned' }).boundingBox())!;
            expect(group.x).toBeCloseTo(b.x, 0);
            expect(group.width).toBeCloseTo(a.width + b.width, 0);
        }).toPass();
        expect(await withApi((api) => api.getColumn('a')!.isLastLeftPinned())).toBe(true);
        expect(await withApi((api) => api.getColumn('b')!.isLastLeftPinned())).toBe(false);

        const handle = (await headerCell('a').locator('.ag-header-cell-resize').boundingBox())!;
        await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
        await page.mouse.down();
        await page.mouse.move(handle.x + handle.width / 2 + 40, handle.y + handle.height / 2, { steps: 10 });
        await page.mouse.up();
        await expect.poll(() => withApi((api) => api.getColumn('a')!.getActualWidth())).toBe(140);

        await withApi((api) => api.ensureColumnVisible('e', 'end'));
        const a = (await headerCell('a').boundingBox())!;
        const b = (await headerCell('b').boundingBox())!;
        expect(b.x + b.width).toBeCloseTo(a.x, 0);
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
        await page.mouse.down();
        await page.mouse.move(a.x + a.width - 20, a.y + a.height / 2, { steps: 15 });
        await page.mouse.up();
        await expect
            .poll(() => withApi((api) => api.getDisplayedLeftColumns().map((col) => col.getColId())))
            .toEqual(['b', 'a']);
        await expect(async () => {
            const movedA = (await headerCell('a').boundingBox())!;
            const movedB = (await headerCell('b').boundingBox())!;
            expect(movedA.x + movedA.width).toBeCloseTo(movedB.x, 0);
            expect((await cell(0, 'a').boundingBox())!.x).toBeCloseTo(movedA.x, 0);
        }).toPass();
        expect(await withApi((api) => api.getColumn('b')!.isLastLeftPinned())).toBe(true);

        await withApi((api) => api.setGridOption('domLayout', 'print'));
        await expect(async () => {
            expect((await headerCell('a').boundingBox())!.x).toBeLessThan((await headerCell('b').boundingBox())!.x);
            expect((await cell(0, 'a').boundingBox())!.x).toBeCloseTo((await headerCell('a').boundingBox())!.x, 0);
        }).toPass();

        await withApi((api) => {
            api.setGridOption('domLayout', 'normal');
            api.setGridOption('suppressMoveWhenColumnDragging', true);
        });
        const dropTarget = (await headerCell('a').boundingBox())!;
        const dragSource = (await headerCell('b').boundingBox())!;
        await page.mouse.move(dragSource.x + dragSource.width / 2, dragSource.y + dragSource.height / 2);
        await page.mouse.down();
        await page.mouse.move(dropTarget.x + 20, dropTarget.y + dropTarget.height / 2, { steps: 15 });
        await expect(headerCell('a')).toHaveClass(/ag-header-highlight-after/);
        expect(await withApi((api) => api.getDisplayedLeftColumns().map((col) => col.getColId()))).toEqual(['b', 'a']);
        await page.mouse.up();
        await expect
            .poll(() => withApi((api) => api.getDisplayedLeftColumns().map((col) => col.getColId())))
            .toEqual(['a', 'b']);
        await expect(async () => {
            const first = (await headerCell('a').boundingBox())!;
            const second = (await headerCell('b').boundingBox())!;
            expect(second.x + second.width).toBeCloseTo(first.x, 0);
            expect((await cell(0, 'b').boundingBox())!.x).toBeCloseTo(second.x, 0);
        }).toPass();
    });

    test('typing into the text editor and pressing Tab commits the value and moves focus right', async ({ page }) => {
        const { cell, withApi } = await mountGrid(page, {
            options: () => ({
                defaultColDef: { editable: true },
                columnDefs: [{ field: 'make' }, { field: 'model' }],
                rowData: [{ make: 'Toyota', model: 'Celica' }],
            }),
        });

        await cell(0, 'make').click();
        await page.keyboard.press('Enter');
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.type('Ford');
        await page.keyboard.press('Tab');

        await expect(cell(0, 'make')).toHaveText('Ford');
        await expect(cell(0, 'model')).toHaveClass(/ag-cell-focus/);
        expect(await withApi((api) => api.getDisplayedRowAtIndex(0)!.data.make)).toBe('Ford');
    });

    test('Escape discards what was typed in the text editor', async ({ page }) => {
        const { cell, grid, withApi } = await mountGrid(page, {
            options: () => ({
                defaultColDef: { editable: true },
                columnDefs: [{ field: 'make' }],
                rowData: [{ make: 'Toyota' }],
            }),
        });

        await cell(0, 'make').dblclick();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.type('Ford');
        await page.keyboard.press('Escape');

        await expect(grid.locator('.ag-cell-inline-editing')).toHaveCount(0);
        await expect(cell(0, 'make')).toHaveText('Toyota');
        expect(await withApi((api) => api.getDisplayedRowAtIndex(0)!.data.make)).toBe('Toyota');
    });

    test('columns outside the laid-out viewport render only after a real wheel scroll', async ({ page }) => {
        const { grid, headerCell } = await mountGrid(page, {
            width: 500,
            height: 300,
            options: () => ({
                columnDefs: Array.from({ length: 20 }, (_, i) => ({ field: `col${i}`, width: 100 })),
                rowData: [{}],
            }),
        });

        await expect(headerCell('col0')).toBeVisible();
        await expect(headerCell('col19')).toHaveCount(0);

        await grid.hover();
        // Firefox applies a wheel delta per scroll animation frame, so one large delta can stop short of the end.
        await expect(async () => {
            await page.mouse.wheel(1000, 0);
            await expect(headerCell('col19')).toBeVisible({ timeout: 500 });
        }).toPass();
        await expect(headerCell('col0')).toHaveCount(0);
    });

    test('right to left, a sticky group label stays clear of the right-pinned columns as they widen', async ({
        page,
    }) => {
        const { withApi } = await mountGrid(page, {
            options: () => ({
                enableRtl: true,
                columnDefs: [
                    { field: 'athlete', width: 200 },
                    { headerName: 'Medals', children: [{ field: 'gold' }, { field: 'silver' }] },
                    { field: 'total', width: 100, pinned: 'right' },
                ],
                defaultColDef: { width: 400 },
                rowData: [{ athlete: 'Michael Phelps', gold: 8, silver: 0, total: 8 }],
            }),
        });

        await withApi((api) => api.ensureColumnVisible('silver', 'start'));
        await expect.poll(() => medalsLabelShown(page)).toEqual({ sticky: true, covered: false });

        await withApi((api) => api.setColumnWidths([{ key: 'total', newWidth: 300 }]));
        await expect.poll(() => medalsLabelShown(page)).toEqual({ sticky: true, covered: false });
    });

    test('a sticky group label stays clear of the left-pinned columns as they widen', async ({ page }) => {
        const { withApi } = await mountGrid(page, {
            options: () => ({
                columnDefs: [
                    { field: 'athlete', width: 100, pinned: 'left' },
                    { headerName: 'Medals', children: [{ field: 'gold' }, { field: 'silver' }] },
                    { field: 'total', width: 200 },
                ],
                defaultColDef: { width: 400 },
                rowData: [{ athlete: 'Michael Phelps', gold: 8, silver: 0, total: 8 }],
            }),
        });

        await withApi((api) => api.ensureColumnVisible('silver', 'start'));
        await expect.poll(() => medalsLabelShown(page)).toEqual({ sticky: true, covered: false });

        await withApi((api) => api.setColumnWidths([{ key: 'athlete', newWidth: 300 }]));
        await expect.poll(() => medalsLabelShown(page)).toEqual({ sticky: true, covered: false });
    });

    test('a group unpinned at runtime keeps its label in view as it scrolls, and one pinned at runtime never sticks', async ({
        page,
    }) => {
        const { withApi } = await mountGrid(page, {
            options: () => ({
                columnDefs: [
                    {
                        headerName: 'Medals',
                        children: [
                            { field: 'gold', pinned: 'left' },
                            { field: 'silver', pinned: 'left' },
                        ],
                    },
                    { field: 'athlete' },
                    { field: 'total' },
                ],
                defaultColDef: { width: 400 },
                rowData: [{ athlete: 'Michael Phelps', gold: 8, silver: 0, total: 8 }],
            }),
        });

        await withApi((api) => api.setColumnsPinned(['gold', 'silver'], null));
        await withApi((api) => api.ensureColumnVisible('silver', 'start'));
        await expect.poll(() => medalsLabelShown(page)).toEqual({ sticky: true, covered: false });

        await withApi((api) => api.ensureColumnVisible('gold', 'start'));
        await withApi((api) => api.setColumnsPinned(['gold', 'silver'], 'left'));
        await withApi((api) =>
            api.setColumnWidths([
                { key: 'gold', newWidth: 150 },
                { key: 'silver', newWidth: 150 },
            ])
        );
        // a scroll inside the pinned group's own extent, where a centre group would stick
        await withApi(
            (api) =>
                new Promise<void>((resolve) => {
                    api.addEventListener('bodyScroll', () => resolve());
                    document.querySelector('.ag-grid-viewport')!.scrollLeft = 100;
                })
        );
        expect(await medalsLabelShown(page)).toEqual({ sticky: false, covered: false });
    });

    // A hidden viewport measures no size; reading that as a change each frame kept the grid scheduling frames forever.
    test('a grid in a container hidden with display:none stops scheduling animation frames', async ({ page }) => {
        const { grid } = await mountGrid(page, {
            options: () => ({
                columnDefs: [{ field: 'make' }, { field: 'model' }],
                rowData: [{ make: 'Toyota', model: 'Celica' }],
            }),
        });

        const framesRequestedWhileHidden = await page.evaluate(async () => {
            const requestFrame = window.requestAnimationFrame.bind(window);
            const frames = async (count: number) => {
                for (let i = 0; i < count; ++i) {
                    await new Promise((resolve) => requestFrame(resolve));
                }
            };
            let requested = 0;
            window.requestAnimationFrame = (callback) => {
                ++requested;
                return requestFrame(callback);
            };
            document.querySelector<HTMLElement>('#myGrid')!.parentElement!.style.display = 'none';
            // the frames the hiding itself schedules
            await frames(10);
            requested = 0;
            await frames(30);
            return requested;
        });

        await expect(grid).toBeHidden();
        expect(framesRequestedWhileHidden).toBe(0);
    });

    for (const animating of [false, true]) {
        test(`a header focused through the API is scrolled into view on the page, as columns animate=${animating}`, async ({
            page,
        }) => {
            const { headerCell, withApi } = await mountGrid(page, {
                css: 'body{padding-top:2000px}',
                options: () => ({
                    columnDefs: [{ field: 'make' }, { field: 'model' }],
                    rowData: [{ make: 'Toyota', model: 'Celica' }],
                }),
            });
            await expect(headerCell('make')).not.toBeInViewport();

            // `withApi` serialises the function, so each variant is its own literal
            const moving = await withApi(
                animating
                    ? (api) => {
                          api.applyColumnState({ state: [{ colId: 'model' }, { colId: 'make' }], applyOrder: true });
                          api.setFocusedHeader('make');
                          return document.querySelector('.ag-column-moving') !== null;
                      }
                    : (api) => {
                          api.setFocusedHeader('make');
                          return false;
                      }
            );

            expect(moving).toBe(animating);
            await expect(headerCell('make')).toBeFocused();
            await expect(headerCell('make')).toBeInViewport({ ratio: 1 });
        });
    }

    test('a header focused as grid state moves its column stays scrolled into view', async ({ page }) => {
        const { headerCell, withApi } = await mountGrid(page, {
            width: 400,
            options: () => ({
                columnDefs: [{ field: 'a' }, ...Array.from({ length: 12 }, (_, i) => ({ field: `b${i}` }))],
                defaultColDef: { width: 100 },
                rowData: [{}],
                suppressColumnVirtualisation: true,
            }),
        });

        await withApi((api) => {
            const order = api.getColumnState().map(({ colId }) => colId);
            api.setState({ columnOrder: { orderedColIds: [...order.slice(1), order[0]] } }, ['scroll']);
            api.setFocusedHeader('a');
        });

        await expect(headerCell('a')).toBeFocused();
        await expect(headerCell('a')).toHaveCSS('left', '1200px');
        await expect(headerCell('a')).toBeInViewport({ ratio: 1 });
    });
});
