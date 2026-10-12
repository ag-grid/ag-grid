import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    CellSpanModule,
    ClientSideRowModelModule,
    GridStateModule,
    RowAutoHeightModule,
    ScrollApiModule,
} from 'ag-grid-community';

describe('scroll API', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, GridStateModule, ScrollApiModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const getViewport = (api: GridApi) =>
        TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-grid-viewport')!;

    describe('fake scrollbars', () => {
        // the viewport's one scroll event serves both axes, so scrolling one axis must not take over the other
        const createScrollGrid = () => {
            // wider than the grid, so it scrolls both ways
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: Array.from({ length: 10 }, (_, i) => ({ colId: `c${i}`, width: 300 })),
                rowData: Array.from({ length: 200 }, () => ({})),
            });
            const root = TestGridsManager.getHTMLElement(api)!;
            const scroll = (selector: string, axis: 'scrollTop' | 'scrollLeft', value: number) => {
                const element = root.querySelector<HTMLElement>(selector)!;
                element[axis] = value;
                element.dispatchEvent(new Event('scroll'));
            };
            return { api, root, viewport: getViewport(api), scroll };
        };

        test('the vertical scrollbar scrolls the rows', () => {
            const { viewport, scroll } = createScrollGrid();
            scroll('.ag-body-vertical-scroll-viewport', 'scrollTop', 100);
            expect(viewport.scrollTop).toBe(100);
        });

        test('the vertical scrollbar scrolls the rows straight after a horizontal scroll of the viewport', () => {
            const { viewport, scroll } = createScrollGrid();
            scroll('.ag-grid-viewport', 'scrollLeft', 30);
            scroll('.ag-body-vertical-scroll-viewport', 'scrollTop', 100);
            expect(viewport.scrollTop).toBe(100);
        });

        test('the horizontal scrollbar scrolls the columns', () => {
            const { viewport, scroll } = createScrollGrid();
            scroll('.ag-body-horizontal-scroll-viewport', 'scrollLeft', 30);
            expect(viewport.scrollLeft).toBe(30);
        });

        test('the horizontal scrollbar scrolls the columns straight after a vertical scroll of the viewport', () => {
            const { viewport, scroll } = createScrollGrid();
            scroll('.ag-grid-viewport', 'scrollTop', 100);
            scroll('.ag-body-horizontal-scroll-viewport', 'scrollLeft', 30);
            expect(viewport.scrollLeft).toBe(30);
        });

        test('a vertical scroll reports only its own axis, and the horizontal one at its position', async () => {
            const { api, scroll } = createScrollGrid();
            const events: { direction: string; left: number; top: number }[] = [];
            api.addEventListener('bodyScroll', ({ direction, left, top }) => events.push({ direction, left, top }));

            scroll('.ag-grid-viewport', 'scrollTop', 100);
            await waitFor(() => expect(events).toEqual([{ direction: 'vertical', left: 0, top: 100 }]));
            scroll('.ag-grid-viewport', 'scrollLeft', 30);
            await waitFor(() =>
                expect(events).toEqual([
                    { direction: 'vertical', left: 0, top: 100 },
                    { direction: 'horizontal', left: 30, top: 100 },
                ])
            );
        });

        test('a horizontal scroll reports the vertical axis at its position, not unset', async () => {
            const { api, scroll } = createScrollGrid();
            const events: { direction: string; left: number; top: number }[] = [];
            api.addEventListener('bodyScroll', ({ direction, left, top }) => events.push({ direction, left, top }));

            scroll('.ag-grid-viewport', 'scrollLeft', 30);
            await waitFor(() => expect(events).toEqual([{ direction: 'horizontal', left: 30, top: 0 }]));
        });

        test('a viewport scroll brings a vertical scrollbar that fell out of step back to the viewport', () => {
            const { root, scroll } = createScrollGrid();
            scroll('.ag-grid-viewport', 'scrollTop', 100);
            const fakeVertical = root.querySelector<HTMLElement>('.ag-body-vertical-scroll-viewport')!;
            fakeVertical.scrollTop = 0;

            scroll('.ag-grid-viewport', 'scrollLeft', 30);

            expect(fakeVertical.scrollTop).toBe(100);
        });

        test('the viewport scrolls the columns straight after a horizontal scroll the grid made', () => {
            const { api, root, viewport, scroll } = createScrollGrid();
            const fakeHorizontal = root.querySelector<HTMLElement>('.ag-body-horizontal-scroll-viewport')!;
            api.setState({ scroll: { left: 300, top: 0 } });
            // the browser then reports both elements the grid moved, the viewport first
            viewport.dispatchEvent(new Event('scroll'));
            fakeHorizontal.dispatchEvent(new Event('scroll'));

            scroll('.ag-grid-viewport', 'scrollLeft', 600);

            expect(fakeHorizontal.scrollLeft).toBe(600);
        });

        test('a viewport check brings a horizontal scrollbar that fell out of step back to the viewport', () => {
            const { api, root, scroll } = createScrollGrid();
            scroll('.ag-grid-viewport', 'scrollLeft', 30);
            const fakeHorizontal = root.querySelector<HTMLElement>('.ag-body-horizontal-scroll-viewport')!;
            fakeHorizontal.scrollLeft = 0;

            api.setGridOption('alwaysShowHorizontalScroll', true);

            expect(fakeHorizontal.scrollLeft).toBe(30);
        });
    });

    describe('ensureIndexVisible', () => {
        // Only a row still loading or still to be measured is worth scrolling to again; here neither can happen,
        // so a later change moving the rows leaves the scroll where it is.
        test('without auto-height rows, a scroll to a row is not repeated when the rows move afterwards', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: Array.from({ length: 200 }, (_, i) => ({ a: i })),
            });
            const viewport = getViewport(api);
            api.ensureIndexVisible(100, 'top');
            const top = viewport.scrollTop;
            expect(top).toBe(api.getDisplayedRowAtIndex(100)!.rowTop);
            await asyncSetTimeout(0);

            api.setGridOption('rowHeight', 80);
            await asyncSetTimeout(0);

            expect(api.getDisplayedRowAtIndex(100)!.rowTop).toBeGreaterThan(top);
            expect(viewport.scrollTop).toBe(top);
        });

        test('with auto-height rows still unmeasured, with or without a colSpan column, a scroll to a row follows the row when it moves', async () => {
            const scrollAndMoveRows = async (id: string, columnDefs: ColDef[]) => {
                const api = gridsManager.createGrid(
                    id,
                    { columnDefs, rowData: Array.from({ length: 200 }, (_, i) => ({ a: i, b: i })) },
                    { modules: [RowAutoHeightModule] }
                );
                const viewport = getViewport(api);
                api.ensureIndexVisible(100, 'top');
                const top = viewport.scrollTop;
                expect(top).toBe(api.getDisplayedRowAtIndex(100)!.rowTop);
                await asyncSetTimeout(0);

                api.setGridOption('rowHeight', 80);
                await asyncSetTimeout(0);

                const movedTop = api.getDisplayedRowAtIndex(100)!.rowTop!;
                expect(movedTop).toBeGreaterThan(top);
                return viewport.scrollTop - movedTop;
            };

            expect({
                autoHeight: await scrollAndMoveRows('autoHeight', [{ field: 'a', autoHeight: true }]),
                withColSpan: await scrollAndMoveRows('withColSpan', [
                    { field: 'a', autoHeight: true },
                    { field: 'b', colSpan: () => 1 },
                ]),
            }).toEqual({ autoHeight: 0, withColSpan: 0 });
        });

        // A covered auto-height column has no cell to measure, so it must not count as unmeasured.
        test('with auto-height cells a colSpan covers and the rest all measured, a scroll to a row is not repeated', async () => {
            mockGridLayout.useRealOffsetDimensions = true;
            mockGridLayout.elementHeightOverride = (el) =>
                el.isConnected && el.classList.contains('ag-cell-wrapper') ? 60 : undefined;
            try {
                const api = gridsManager.createGrid(
                    'myGrid',
                    {
                        columnDefs: [
                            { field: 'a', colSpan: (params) => (params.node!.rowIndex! % 2 === 1 ? 2 : 1) },
                            { field: 'b', autoHeight: true },
                            { field: 'c', autoHeight: true },
                        ],
                        rowData: Array.from({ length: 200 }, (_, i) => ({ a: i, b: i, c: i })),
                    },
                    { modules: [RowAutoHeightModule] }
                );
                const viewport = getViewport(api);
                api.ensureIndexVisible(103, 'top');
                await waitFor(() => expect(api.getDisplayedRowAtIndex(103)!.rowHeight).toBe(60));
                await asyncSetTimeout(0);
                const hasCellB = (rowIndex: number) =>
                    !!TestGridsManager.getHTMLElement(api)!.querySelector(
                        `.ag-row[row-index="${rowIndex}"] [col-id="b"]`
                    );
                expect([hasCellB(103), hasCellB(104)]).toEqual([false, true]);

                api.ensureIndexVisible(103, 'top');
                const top = viewport.scrollTop;
                expect(top).toBe(api.getDisplayedRowAtIndex(103)!.rowTop);
                await asyncSetTimeout(0);

                api.setGridOption('rowHeight', 80);
                await asyncSetTimeout(0);

                expect(api.getDisplayedRowAtIndex(103)!.rowTop).toBeGreaterThan(top);
                expect(viewport.scrollTop).toBe(top);
            } finally {
                mockGridLayout.useRealOffsetDimensions = false;
                mockGridLayout.elementHeightOverride = undefined;
            }
        });

        // A span measures into its first row, taller than that row, and the rows it covers have no `a` cell.
        test('with row-spanned auto-height cells all measured, a scroll to a row is not repeated', async () => {
            mockGridLayout.useRealOffsetDimensions = true;
            mockGridLayout.elementHeightOverride = (el) =>
                el.isConnected && el.classList.contains('ag-cell-wrapper') ? 60 : undefined;
            try {
                const api = gridsManager.createGrid(
                    'myGrid',
                    {
                        enableCellSpan: true,
                        columnDefs: [
                            { field: 'a', autoHeight: true, spanRows: true },
                            { field: 'b', autoHeight: true },
                        ],
                        rowData: Array.from({ length: 200 }, (_, i) => ({ a: Math.floor(i / 4), b: i })),
                    },
                    { modules: [CellSpanModule, RowAutoHeightModule] }
                );
                const viewport = getViewport(api);
                api.ensureIndexVisible(103, 'top');
                await waitFor(() => {
                    expect(document.querySelector('.ag-spanned-cell')).not.toBeNull();
                    expect(api.getDisplayedRowAtIndex(0)!.rowHeight).toBe(60);
                });
                await asyncSetTimeout(0);

                api.ensureIndexVisible(103, 'top');
                const top = viewport.scrollTop;
                expect(top).toBe(api.getDisplayedRowAtIndex(103)!.rowTop);
                await asyncSetTimeout(0);

                api.setGridOption('rowHeight', 80);
                await asyncSetTimeout(0);

                expect(api.getDisplayedRowAtIndex(103)!.rowTop).toBeGreaterThan(top);
                expect(viewport.scrollTop).toBe(top);
            } finally {
                mockGridLayout.useRealOffsetDimensions = false;
                mockGridLayout.elementHeightOverride = undefined;
            }
        });
    });

    describe('a grid taller than the browser can draw', () => {
        // the rows are drawn at a scaled offset that moves with the scroll, so a row kept through a scroll moves too
        test('rows kept rendered through a scroll stay one row height apart from the rows drawn for it', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                rowData: Array.from({ length: 30000 }, (_, i) => ({ a: i })),
                suppressRowVirtualisation: false,
            });
            const rowGaps = () => {
                const rows = Array.from(
                    TestGridsManager.getHTMLElement(api)!.querySelectorAll<HTMLElement>('.ag-row[row-index]')
                );
                const tops = rows
                    .map((row) => ({
                        index: Number(row.getAttribute('row-index')),
                        top: Number(/translateY\((-?[\d.]+)px\)/.exec(row.style.transform)?.[1]),
                    }))
                    .sort((a, b) => a.index - b.index);
                const gaps = new Set<number>();
                for (let i = 1; i < tops.length; ++i) {
                    gaps.add(tops[i].top - tops[i - 1].top);
                }
                return { rows: tops.length, gaps: [...gaps] };
            };
            api.ensureIndexVisible(15000, 'top');
            await asyncSetTimeout(0);

            api.ensureIndexVisible(15005, 'top');
            await asyncSetTimeout(0);

            expect(rowGaps()).toEqual({ rows: 21, gaps: [42] });
            // stretched: the row is drawn above its own top, at a scaled offset
            const drawn =
                TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-row[row-index="15005"]');
            expect(Number(/translateY\(([\d.]+)px\)/.exec(drawn!.style.transform)?.[1])).toBeLessThan(15005 * 42);
        });
    });
});
