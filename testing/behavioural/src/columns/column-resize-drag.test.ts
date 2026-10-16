import { waitFor } from '@testing-library/dom';
import { DragEventDispatcher, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, ColGroupDef, ColumnPinnedType, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule } from 'ag-grid-community';

/**
 * Which way a resize drag moves a header depends on the pinned section and on RTL, and the group and
 * single-column features derive that independently. Neither direction had coverage.
 */
describe('header resize drag direction', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createGrid = (pinned: ColumnPinnedType, enableRtl: boolean): GridApi => {
        // A group has no `pinned` of its own: it takes its lane from its children.
        const children: ColDef[] = [
            { colId: 'a', field: 'a', width: 100, resizable: true, pinned },
            { colId: 'b', field: 'b', width: 100, resizable: true, pinned },
        ];
        const columnDefs: (ColDef | ColGroupDef)[] = [
            { headerName: 'G', groupId: 'g', children },
            { colId: 'c', field: 'c', width: 100, resizable: true },
        ];
        return gridsManager.createGrid('resizeDrag', {
            columnDefs,
            rowData: [{ a: 'a1', b: 'b1', c: 'c1' }],
            enableRtl,
        });
    };

    const groupWidth = (api: GridApi): number =>
        (api.getColumn('a')?.getActualWidth() ?? 0) + (api.getColumn('b')?.getActualWidth() ?? 0);

    /** Drags the group header's resize bar right by `dx` and returns the group's width change. */
    const dragGroupResizeBy = async (api: GridApi, dx: number): Promise<number> => {
        const root = TestGridsManager.getHTMLElement(api)!;
        const bar = root.querySelector<HTMLElement>('.ag-header-group-cell .ag-header-cell-resize');
        expect(bar).not.toBeNull();

        const before = groupWidth(api);
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar!, 500, 10);
        await dispatcher.movePointer(bar!, 500 + dx, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);

        return groupWidth(api) - before;
    };

    test('LTR: dragging right grows an unpinned group and shrinks a right-pinned one', async () => {
        const unpinned = await dragGroupResizeBy(createGrid(null, false), 60);
        expect(unpinned).toBeGreaterThan(0);

        gridsManager.reset();

        const rightPinned = await dragGroupResizeBy(createGrid('right', false), 60);
        expect(rightPinned).toBeLessThan(0);
    });

    test('LTR: a left-pinned group grows, unlike a right-pinned one', async () => {
        expect(await dragGroupResizeBy(createGrid('left', false), 60)).toBeGreaterThan(0);
    });

    test('RTL: dragging right shrinks an unpinned group but still grows a left-pinned one', async () => {
        const unpinned = await dragGroupResizeBy(createGrid(null, true), 60);
        expect(unpinned).toBeLessThan(0);

        gridsManager.reset();

        const leftPinned = await dragGroupResizeBy(createGrid('left', true), 60);
        expect(leftPinned).toBeGreaterThan(0);
    });

    // one rule for every gesture: right grows a header, except pinned right in LTR and anything but pinned left in RTL
    test.each([
        { pinned: null, enableRtl: false, sign: 1 },
        { pinned: 'left', enableRtl: false, sign: 1 },
        { pinned: 'right', enableRtl: false, sign: -1 },
        { pinned: null, enableRtl: true, sign: -1 },
        { pinned: 'left', enableRtl: true, sign: 1 },
        { pinned: 'right', enableRtl: true, sign: -1 },
    ] as const)(
        'pinned $pinned, enableRtl $enableRtl: a drag right or ArrowRight changes a header by $sign',
        async ({ pinned, enableRtl, sign }) => {
            const api = createGrid(pinned, enableRtl);
            const width = (id: string): number => api.getColumn(id)!.getActualWidth();
            const pressArrowRight = (): void => {
                const header = document.activeElement!;
                header.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
                header.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
            };

            const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
                '.ag-header-cell[col-id="a"] .ag-header-cell-resize'
            )!;
            const dispatcher = new DragEventDispatcher('mouse');
            await dispatcher.startDrag(bar, 500, 10);
            await dispatcher.movePointer(bar, 520, 10);
            await dispatcher.finishDrag();

            api.setFocusedHeader('b');
            pressArrowRight();

            const groupBefore = groupWidth(api);
            api.setFocusedHeader('g');
            pressArrowRight();
            await asyncSetTimeout(0);

            expect({
                columnDrag: Math.sign(width('a') - 100),
                columnKey: Math.sign(width('b') - 100),
                groupKey: Math.sign(groupWidth(api) - groupBefore),
            }).toEqual({ columnDrag: sign, columnKey: sign, groupKey: sign });
        }
    );

    test('a keyboard resize ends when the focus leaves its header before the key is released', async () => {
        const api = createGrid(null, false);
        const keyDown = (init: KeyboardEventInit): void => {
            document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }));
        };

        // held: two keydowns and no keyup, then a click elsewhere takes the focus
        api.setFocusedHeader('c');
        keyDown({ key: 'ArrowRight', altKey: true });
        keyDown({ key: 'ArrowRight', altKey: true });
        api.setFocusedCell(0, 'a');

        api.setFocusedHeader('c');
        expect(document.activeElement!.classList.contains('ag-column-resizing')).toBe(false);
        keyDown({ key: 'ArrowDown' });
        expect(api.getFocusedCell()).toMatchObject({ rowIndex: 0, column: api.getColumn('c') });

        // a fresh resize starts from the first step again
        api.setFocusedHeader('c');
        const before = api.getColumn('c')!.getActualWidth();
        keyDown({ key: 'ArrowRight', altKey: true });
        document.activeElement!.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
        expect(api.getColumn('c')!.getActualWidth() - before).toBe(2);
    });

    test('a keyboard resize released and left at once ends then, without ending a resize started after it', async () => {
        const api = createGrid(null, false);
        const press = (type: 'keydown' | 'keyup'): void => {
            document.activeElement!.dispatchEvent(
                new KeyboardEvent(type, { key: 'ArrowRight', altKey: type === 'keydown', bubbles: true })
            );
        };
        const resizing = () => document.activeElement!.classList.contains('ag-column-resizing');
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        try {
            api.setFocusedHeader('c');
            press('keydown');
            press('keyup');
            const afterKeyUp = resizing();
            api.setFocusedCell(0, 'a');

            // held again within the end the release scheduled
            api.setFocusedHeader('c');
            const afterLeaving = resizing();
            press('keydown');
            vi.advanceTimersByTime(200);

            expect([afterKeyUp, afterLeaving, resizing()]).toEqual([true, false, true]);
        } finally {
            vi.useRealTimers();
        }
    });

    test('a keyboard resize held again before its release ends keeps resizing', () => {
        const api = createGrid(null, false);
        const press = (type: 'keydown' | 'keyup'): void => {
            document.activeElement!.dispatchEvent(
                new KeyboardEvent(type, { key: 'ArrowRight', altKey: type === 'keydown', bubbles: true })
            );
        };
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        try {
            api.setFocusedHeader('c');
            press('keydown');
            press('keyup');
            vi.advanceTimersByTime(100);
            press('keydown');
            vi.advanceTimersByTime(100);

            expect(document.activeElement!.classList.contains('ag-column-resizing')).toBe(true);
        } finally {
            vi.useRealTimers();
        }
    });

    test('a column drag that ends where it started still raises a finished columnResized, and only that', async () => {
        const api = createGrid(null, false);
        const events: { columns: string[]; finished: boolean; flexColumns: unknown }[] = [];
        api.addEventListener('columnResized', (e) => {
            events.push({
                columns: e.columns!.map((col) => col.getColId()),
                finished: e.finished,
                flexColumns: e.flexColumns,
            });
        });

        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-cell[col-id="c"] .ag-header-cell-resize'
        )!;
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 500, 10);
        await dispatcher.movePointer(bar, 500, 30);
        await dispatcher.finishDrag();

        // a resize event, so `flexColumns` is an array, as aligned grids read it
        await waitFor(() => expect(events).toEqual([{ columns: ['c'], finished: true, flexColumns: [] }]));
        expect(api.getColumn('c')!.getActualWidth()).toBe(100);
    });

    test("a drag ended past the column's bound stops on the bound and still ends", async () => {
        const api = createGrid(null, false);
        const finished: string[][] = [];
        api.addEventListener('columnResized', (e) => {
            if (e.finished) {
                finished.push(e.columns!.map((col) => col.getColId()));
            }
        });
        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-cell[col-id="c"] .ag-header-cell-resize'
        )!;
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 500, 10);
        await dispatcher.movePointer(bar, 405, 10);
        await dispatcher.finishDrag();

        await waitFor(() => expect(finished).toEqual([['c']]));
        const column = api.getColumn('c')!;
        expect(column.getActualWidth()).toBe(column.getMinWidth());
    });

    test('one fast drag or key step past minWidth or maxWidth stops on it', async () => {
        const api = gridsManager.createGrid('resizeBounds', {
            columnDefs: [
                { colId: 'a', field: 'a', width: 300, minWidth: 150, maxWidth: 400, resizable: true },
                { colId: 'b', field: 'b', width: 100, resizable: true },
            ],
            rowData: [{ a: 'a1', b: 'b1' }],
        });
        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-cell[col-id="a"] .ag-header-cell-resize'
        )!;
        const dragBy = async (dx: number): Promise<number> => {
            const dispatcher = new DragEventDispatcher('mouse');
            await dispatcher.startDrag(bar, 500, 10);
            await dispatcher.movePointer(bar, 500 + dx, 10);
            await dispatcher.finishDrag();
            await asyncSetTimeout(0);
            return api.getColumn('a')!.getActualWidth();
        };

        expect(await dragBy(500)).toBe(400);

        // the first key step is 2px
        api.applyColumnState({ state: [{ colId: 'a', width: 151 }] });
        api.setFocusedHeader('a');
        const header = document.activeElement!;
        header.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
        header.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft', bubbles: true }));
        expect(api.getColumn('a')!.getActualWidth()).toBe(150);
    });

    test('Alt+ArrowRight held on a column or group header that is not resizable resizes nothing and shows no resizing, and a column raises nothing', async () => {
        const api = gridsManager.createGrid('resizeKeyNotResizable', {
            columnDefs: [
                { headerName: 'G', groupId: 'g', children: [{ colId: 'a', field: 'a', width: 100, resizable: false }] },
                { colId: 'c', field: 'c', width: 100, resizable: false },
            ],
            rowData: [{ a: 'a1', c: 'c1' }],
        });
        let resized = 0;
        api.addEventListener('columnResized', () => ++resized);
        const holdAltArrowRight = (): boolean => {
            const header = document.activeElement!;
            header.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
            return header.classList.contains('ag-column-resizing');
        };

        api.setFocusedHeader('c');
        const columnResizing = holdAltArrowRight();
        const columnResized = resized;
        api.setFocusedHeader('g');
        const groupResizing = holdAltArrowRight();
        await asyncSetTimeout(0);

        expect({
            columnResizing,
            groupResizing,
            columnResized,
            widths: ['a', 'c'].map((id) => api.getColumn(id)!.getActualWidth()),
        }).toEqual({ columnResizing: false, groupResizing: false, columnResized: 0, widths: [100, 100] });
    });

    test('a shift resize, by drag or key, stops where the column it takes from reaches its minWidth or maxWidth', async () => {
        const api = gridsManager.createGrid('resizeShiftBounds', {
            columnDefs: [
                { colId: 'a', field: 'a', width: 100, resizable: true },
                { colId: 'b', field: 'b', width: 100, minWidth: 80, maxWidth: 120, resizable: true },
            ],
            rowData: [{ a: 'a1', b: 'b1' }],
            colResizeDefault: 'shift',
        });
        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-cell[col-id="a"] .ag-header-cell-resize'
        )!;
        const widths = () => ['a', 'b'].map((id) => api.getColumn(id)!.getActualWidth());
        const dragBy = async (dx: number): Promise<number[]> => {
            const dispatcher = new DragEventDispatcher('mouse');
            await dispatcher.startDrag(bar, 500, 10);
            await dispatcher.movePointer(bar, 500 + dx, 10);
            await dispatcher.finishDrag();
            await asyncSetTimeout(0);
            return widths();
        };

        expect([await dragBy(50), await dragBy(-50)]).toEqual([
            [120, 80],
            [80, 120],
        ]);

        // the first key step is 2px, one past what `b` can give
        api.applyColumnState({
            state: [
                { colId: 'a', width: 119 },
                { colId: 'b', width: 81 },
            ],
        });
        api.setFocusedHeader('a');
        const header = document.activeElement!;
        header.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
        header.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
        expect(widths()).toEqual([120, 80]);
    });

    test('a shift-drag where the column, or the one it takes from, has its minWidth above its maxWidth changes neither, and still ends', async () => {
        const noFit = { minWidth: 150, maxWidth: 120 };
        const results: [number[], [string[], boolean][]][] = [];
        for (const [colA, colB] of [
            [noFit, {}],
            [{}, noFit],
        ]) {
            const api = gridsManager.createGrid('resizeShiftNoFit', {
                columnDefs: [
                    { colId: 'a', field: 'a', width: 100, resizable: true, ...colA },
                    { colId: 'b', field: 'b', width: 100, resizable: true, ...colB },
                ],
                colResizeDefault: 'shift',
            });
            const resized: [string[], boolean][] = [];
            api.addEventListener('columnResized', (e) =>
                resized.push([e.columns!.map((col) => col.getColId()), e.finished])
            );
            const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
                '.ag-header-cell[col-id="a"] .ag-header-cell-resize'
            )!;
            const dispatcher = new DragEventDispatcher('mouse');
            await dispatcher.startDrag(bar, 500, 10);
            await dispatcher.movePointer(bar, 510, 10);
            await dispatcher.finishDrag();
            await asyncSetTimeout(0);
            results.push([['a', 'b'].map((id) => api.getColumn(id)!.getActualWidth()), resized]);
            api.destroy();
        }

        expect(results).toEqual([
            [[120, 100], [[['a'], true]]],
            [[100, 120], [[['a'], true]]],
        ]);
    });

    test('a drag that outlives its column resizes nothing', async () => {
        const api = createGrid(null, false);
        const resized: string[][] = [];
        api.addEventListener('columnResized', (e) => resized.push(e.columns!.map((col) => col.getColId())));
        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-cell[col-id="c"] .ag-header-cell-resize'
        )!;
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 500, 10);
        await dispatcher.movePointer(bar, 510, 10);

        api.setGridOption('columnDefs', [{ colId: 'a', field: 'a', width: 100 }]);
        await dispatcher.movePointer(bar, 560, 10);
        await dispatcher.finishDrag();
        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);

        // the drag's first move, then nothing until the call after it
        await waitFor(() => expect(resized).toEqual([['c'], ['a']]));
    });

    test('a shift drag on a column hidden mid-drag takes from no other column', async () => {
        const api = gridsManager.createGrid('resizeShiftHidden', {
            columnDefs: ['a', 'b', 'c'].map((colId) => ({ colId, field: colId, width: 100 })),
            colResizeDefault: 'shift',
        });
        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-cell[col-id="b"] .ag-header-cell-resize'
        )!;
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 500, 10);
        await dispatcher.movePointer(bar, 510, 10);

        api.setColumnsVisible(['b'], false);
        await dispatcher.movePointer(bar, 540, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);

        expect(['a', 'c'].map((id) => api.getColumn(id)!.getActualWidth())).toEqual([100, 90]);
    });

    /** 100/200/300 in one group, so the three ratios differ and a frozen column is detectable. */
    const createBoundedGroup = (bounds: ColDef): GridApi =>
        gridsManager.createGrid('resizeDrag', {
            columnDefs: [
                {
                    headerName: 'G',
                    groupId: 'g',
                    children: [
                        { colId: 'a', field: 'a', width: 100, resizable: true, ...bounds },
                        { colId: 'b', field: 'b', width: 200, resizable: true },
                        { colId: 'c', field: 'c', width: 300, resizable: true },
                    ],
                },
            ],
            rowData: [{ a: 'a1', b: 'b1', c: 'c1' }],
        });

    const dragGroupTo = async (api: GridApi, toX: number): Promise<number[]> => {
        const root = TestGridsManager.getHTMLElement(api)!;
        const bar = root.querySelector<HTMLElement>('.ag-header-group-cell .ag-header-cell-resize')!;
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 600, 10);
        await dispatcher.movePointer(bar, toX, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);

        return ['a', 'b', 'c'].map((id) => api.getColumn(id)!.getActualWidth());
    };

    // A column frozen at a bound drops out of the next distribution pass. The columns still in it must
    // keep their own share, and share only what the frozen one left rather than the whole group width.
    test('a group column frozen at its maxWidth leaves the rest sized by their own ratios', async () => {
        const api = createBoundedGroup({ maxWidth: 110 });
        // 610 left once `a` takes 110, split 2:3 between `b` and `c`.
        expect(await dragGroupTo(api, 720)).toEqual([110, 244, 366]);
    });

    test('a group column frozen at its minWidth leaves the rest sized by their own ratios', async () => {
        const api = createBoundedGroup({ minWidth: 90 });
        expect(await dragGroupTo(api, 480)).toEqual([90, 156, 234]);
    });

    // A capped at 100 leaves B and C splitting the remaining 500.
    test('a group resize splits the remaining width, as the resize algorithm documents', async () => {
        const api = gridsManager.createGrid('resizeDrag', {
            columnDefs: [
                {
                    headerName: 'G',
                    groupId: 'g',
                    children: [
                        { colId: 'a', field: 'a', width: 50, maxWidth: 100, resizable: true },
                        { colId: 'b', field: 'b', width: 50, resizable: true },
                        { colId: 'c', field: 'c', width: 50, resizable: true },
                    ],
                },
            ],
            rowData: [{ a: 'a1', b: 'b1', c: 'c1' }],
        });

        const root = TestGridsManager.getHTMLElement(api)!;
        const bar = root.querySelector<HTMLElement>('.ag-header-group-cell .ag-header-cell-resize')!;
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 150, 10);
        await dispatcher.movePointer(bar, 600, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);

        expect(['a', 'b', 'c'].map((id) => api.getColumn(id)!.getActualWidth())).toEqual([100, 250, 250]);
    });

    test('a drag back inside a bound frees the column it froze on', async () => {
        const api = createBoundedGroup({ maxWidth: 110 });
        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-group-cell .ag-header-cell-resize'
        )!;
        const widths = () => ['a', 'b', 'c'].map((id) => api.getColumn(id)!.getActualWidth());
        const dispatcher = new DragEventDispatcher('mouse');

        await dispatcher.startDrag(bar, 600, 10);
        await dispatcher.movePointer(bar, 720, 10);
        await asyncSetTimeout(0);
        const past = widths();
        await dispatcher.movePointer(bar, 600, 10);
        await asyncSetTimeout(0);
        const back = widths();
        await dispatcher.finishDrag();

        expect([past, back]).toEqual([
            [110, 244, 366],
            [100, 200, 300],
        ]);
    });

    test('one drag across a maxWidth bound never narrows another column, tick by tick', async () => {
        const api = createBoundedGroup({ maxWidth: 110 });
        const root = TestGridsManager.getHTMLElement(api)!;
        const bar = root.querySelector<HTMLElement>('.ag-header-group-cell .ag-header-cell-resize')!;
        const widths = () => ['a', 'b', 'c'].map((id) => api.getColumn(id)!.getActualWidth());

        // `a` binds at its cap between 662 and 663, so those two ticks straddle the threshold where the
        // remaining columns start sharing what it left. The ratios are captured once, at mousedown.
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 600, 10);
        const seen: number[][] = [];
        for (const toX of [660, 662, 663, 664, 720]) {
            await dispatcher.movePointer(bar, toX, 10);
            await asyncSetTimeout(0);
            seen.push(widths());
        }
        await dispatcher.finishDrag();

        expect(seen).toEqual([
            [110, 220, 330],
            [110, 221, 331],
            [110, 221, 332],
            [110, 222, 332],
            [110, 244, 366],
        ]);
        for (let i = 1; i < seen.length; ++i) {
            for (let col = 0; col < 3; ++col) {
                expect(seen[i][col]).toBeGreaterThanOrEqual(seen[i - 1][col]);
            }
        }
    });

    test('each further group drag grows every column still inside the distribution', async () => {
        const api = createBoundedGroup({ maxWidth: 110 });
        const root = TestGridsManager.getHTMLElement(api)!;
        const widths = () => ['a', 'b', 'c'].map((id) => api.getColumn(id)!.getActualWidth());

        const seen: number[][] = [];
        for (let from = 600; from < 960; from += 120) {
            const bar = root.querySelector<HTMLElement>('.ag-header-group-cell .ag-header-cell-resize')!;
            const dispatcher = new DragEventDispatcher('mouse');
            await dispatcher.startDrag(bar, from, 10);
            await dispatcher.movePointer(bar, from + 120, 10);
            await dispatcher.finishDrag();
            await asyncSetTimeout(0);
            seen.push(widths());
        }

        // `a` stays at its cap; `b` and `c` keep splitting what is left 2:3 on every drag.
        expect(seen).toEqual([
            [110, 244, 366],
            [110, 292, 438],
            [110, 340, 510],
        ]);
    });
});

/** How a group resize shares the new width between its columns, pass by pass. */
describe('group resize distribution', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createGroups = (groups: Record<string, ColDef[]>, gridOptions?: GridOptions): GridApi =>
        gridsManager.createGrid('groupResize', {
            columnDefs: Object.keys(groups).map((groupId) => ({
                headerName: groupId,
                groupId,
                children: groups[groupId].map((col) => ({ field: col.colId, resizable: true, ...col })),
            })),
            rowData: [{}],
            ...gridOptions,
        });

    const widths = (api: GridApi, ids: string[]): number[] => ids.map((id) => api.getColumn(id)!.getActualWidth());

    /** Drags the first group's resize bar from x 600 to `toX`, so the group's width moves by `toX - 600`. */
    const dragFirstGroupTo = async (api: GridApi, toX: number): Promise<void> => {
        const root = TestGridsManager.getHTMLElement(api)!;
        const bar = root.querySelector<HTMLElement>('.ag-header-group-cell .ag-header-cell-resize')!;
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 600, 10);
        await dispatcher.movePointer(bar, toX, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);
    };

    test('a listener reordering the columns of a drag event leaves the rest of the drag sharing by the start ratios', async () => {
        const api = createGroups({
            g: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 300 },
            ],
        });
        api.addEventListener('columnResized', (event) => {
            event.columns?.reverse();
        });
        const root = TestGridsManager.getHTMLElement(api)!;
        const bar = root.querySelector<HTMLElement>('.ag-header-group-cell .ag-header-cell-resize')!;
        const dispatcher = new DragEventDispatcher('mouse');

        await dispatcher.startDrag(bar, 600, 10);
        await dispatcher.movePointer(bar, 640, 10);
        await dispatcher.movePointer(bar, 700, 10);
        const midDrag = widths(api, ['a', 'b']);
        await dispatcher.finishDrag();

        expect(midDrag).toEqual([125, 375]);
    });

    test('a column frozen in one pass can push another past its bound in the next', async () => {
        const api = createGroups({
            g: [
                { colId: 'a', width: 100, minWidth: 90 },
                { colId: 'b', width: 200, minWidth: 157 },
                { colId: 'c', width: 300 },
            ],
        });

        // Shrunk to 480: the first pass gives a 80 and b 160, so only a freezes, at 90. Sharing the 390 left
        // 2:3 gives b 156, under its 157, so a second pass freezes it too and c takes the remaining 233.
        await dragFirstGroupTo(api, 480);

        expect(widths(api, ['a', 'b', 'c'])).toEqual([90, 157, 233]);
    });

    test('a resize past what the columns can hold together stops each on its minWidth, and still ends', async () => {
        const api = createGroups({
            g: [
                { colId: 'a', width: 100, minWidth: 90 },
                { colId: 'b', width: 200 },
                { colId: 'c', width: 300 },
            ],
        });
        const finished: string[][] = [];
        api.addEventListener('columnResized', (e) => {
            if (e.finished) {
                finished.push(e.columns!.map((col) => col.getColId()));
            }
        });

        // 100 is under the minimum widths summed, so the group stops at that sum, each column on its own minimum.
        await dragFirstGroupTo(api, 100);

        expect(widths(api, ['a', 'b', 'c'])).toEqual(['a', 'b', 'c'].map((id) => api.getColumn(id)!.getMinWidth()));
        expect(finished).toEqual([['a', 'b', 'c']]);
    });

    test('a drag that outlives its group header resizes nothing, and ends', async () => {
        const api = createGroups({ g: [{ colId: 'a', width: 100 }], h: [{ colId: 'b', width: 100 }] });
        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-group-cell .ag-header-cell-resize'
        )!;
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 600, 10);
        await dispatcher.movePointer(bar, 620, 10);
        expect(widths(api, ['a'])).toEqual([120]);

        // the group's header goes, as a scroll can take it out of the rendered window mid-drag
        api.setGridOption('columnDefs', [
            { colId: 'a', field: 'a', width: 120 },
            { colId: 'b', field: 'b' },
        ]);
        await dispatcher.movePointer(bar, 680, 10);
        await dispatcher.finishDrag();

        expect(widths(api, ['a'])).toEqual([120]);
        expect(document.querySelector('.ag-column-resizing')).toBeNull();
    });

    test("a group resize shares its width across its nested groups' columns", async () => {
        const api = gridsManager.createGrid('nested', {
            columnDefs: [
                {
                    headerName: 'g',
                    groupId: 'g',
                    children: [
                        {
                            headerName: 's',
                            groupId: 's',
                            children: [
                                { colId: 'a', width: 100 },
                                { colId: 'b', width: 100 },
                            ],
                        },
                        { colId: 'c', width: 200 },
                    ],
                },
            ],
            rowData: [{}],
        });

        await dragFirstGroupTo(api, 800);

        expect(widths(api, ['a', 'b', 'c'])).toEqual([150, 150, 300]);
    });

    test('shift takes the width from the next group, which shares the loss by its own ratios', async () => {
        const api = createGroups({
            g: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
            h: [
                { colId: 'd', width: 100 },
                { colId: 'e', width: 300 },
            ],
        });
        api.setFocusedHeader('g');
        const header = document.activeElement!;

        // Alt resizes from the keyboard, by 2px on the first press; shift takes those 2px from `h`.
        header.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, shiftKey: true, bubbles: true })
        );
        header.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
        await asyncSetTimeout(0);

        // `h` shrinks to 398 1:3, so d's 99.5 rounds to 100 and e takes the 298 left.
        expect(widths(api, ['a', 'b', 'd', 'e'])).toEqual([101, 101, 100, 298]);
    });

    test('shift takes the width from the next column when that column is not in a group', async () => {
        const api = gridsManager.createGrid('groupResize', {
            columnDefs: [
                {
                    headerName: 'g',
                    groupId: 'g',
                    children: [
                        { field: 'a', resizable: true, width: 100 },
                        { field: 'b', resizable: true, width: 100 },
                    ],
                },
                { field: 'x', resizable: true, width: 200 },
            ],
            rowData: [{}],
        });
        api.setFocusedHeader('g');
        const header = document.activeElement!;

        header.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, shiftKey: true, bubbles: true })
        );
        header.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
        await asyncSetTimeout(0);

        expect(widths(api, ['a', 'b', 'x'])).toEqual([101, 101, 198]);
    });

    test('a shift-drag resizes the next group against this one on every move', async () => {
        const api = createGroups({
            g: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
            h: [
                { colId: 'd', width: 100 },
                { colId: 'e', width: 300 },
            ],
        });
        const root = TestGridsManager.getHTMLElement(api)!;
        const bar = root.querySelector<HTMLElement>('.ag-header-group-cell .ag-header-cell-resize')!;
        const dispatcher = new DragEventDispatcher('mouse');
        const seen: number[][] = [];

        await dispatcher.startDrag(bar, 600, 10, { shiftKey: true });
        for (const toX of [610, 620, 605]) {
            await dispatcher.movePointer(bar, toX, 10);
            await asyncSetTimeout(0);
            seen.push(widths(api, ['a', 'b', 'd', 'e']));
        }
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);
        seen.push(widths(api, ['a', 'b', 'd', 'e']));

        // `h` gives what `g` takes, 1:3: at +10 d's 97.5 rounds to 98; at +5 a's 102.5 rounds up, d's 98.75 to 99.
        expect(seen).toEqual([
            [105, 105, 98, 292],
            [110, 110, 95, 285],
            [103, 102, 99, 296],
            [103, 102, 99, 296],
        ]);
    });

    test("colResizeDefault 'shift' makes a group drag take from the next group, and Shift resizes the group alone", async () => {
        const api = createGroups(
            {
                g: [
                    { colId: 'a', width: 100 },
                    { colId: 'b', width: 100 },
                ],
                h: [
                    { colId: 'd', width: 100 },
                    { colId: 'e', width: 100 },
                ],
            },
            { colResizeDefault: 'shift' }
        );
        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-group-cell .ag-header-cell-resize'
        )!;
        const drag = async (shiftKey: boolean): Promise<number[]> => {
            const dispatcher = new DragEventDispatcher('mouse');
            await dispatcher.startDrag(bar, 600, 10, { shiftKey });
            await dispatcher.movePointer(bar, 610, 10);
            await dispatcher.finishDrag();
            await asyncSetTimeout(0);
            return widths(api, ['a', 'b', 'd', 'e']);
        };

        expect([await drag(false), await drag(true)]).toEqual([
            [105, 105, 95, 95],
            [110, 110, 95, 95],
        ]);
    });

    test("a Shift drag, or a drag under colResizeDefault 'shift', whose next group has no resizable column resizes the group alone", async () => {
        const api = createGroups({
            g: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
            h: [{ colId: 'd', width: 100, resizable: false }],
        });
        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-group-cell .ag-header-cell-resize'
        )!;
        const dispatcher = new DragEventDispatcher('mouse');

        await dispatcher.startDrag(bar, 600, 10, { shiftKey: true });
        await dispatcher.movePointer(bar, 610, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);
        const shiftDrag = widths(api, ['a', 'b', 'd']);
        api.setGridOption('colResizeDefault', 'shift');
        await dragFirstGroupTo(api, 610);

        expect([shiftDrag, widths(api, ['a', 'b', 'd'])]).toEqual([
            [105, 105, 100],
            [110, 110, 100],
        ]);
    });

    test('each held keyboard resize step starts from the widths the last one left', async () => {
        const api = createGroups({
            g: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
        });
        api.setFocusedHeader('g');
        const header = document.activeElement!;
        const press = () =>
            header.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));

        // Held down, the step grows: 2px, then 3px. The second 205 halves to 102.5, so `a` rounds up to 103.
        press();
        await asyncSetTimeout(0);
        const first = widths(api, ['a', 'b']);
        press();
        header.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
        await asyncSetTimeout(0);

        expect([first, widths(api, ['a', 'b'])]).toEqual([
            [101, 101],
            [103, 102],
        ]);
    });

    test('a keyboard group resize stops on the summed maxWidth', async () => {
        const api = createGroups({
            g: [
                { colId: 'a', width: 100, maxWidth: 101 },
                { colId: 'b', width: 100, maxWidth: 100 },
            ],
        });
        api.setFocusedHeader('g');
        const header = document.activeElement!;

        // the first key step is 2px, one past what the group can hold
        header.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
        header.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
        await asyncSetTimeout(0);

        expect(widths(api, ['a', 'b'])).toEqual([101, 100]);
    });

    test.each([
        { where: 'unpinned', pinned: null },
        { where: 'pinned left with no room to grow', pinned: 'left' as const },
    ])(
        "under colResizeDefault 'shift', Alt+ArrowRight on a group $where takes from the next group",
        async ({ pinned }) => {
            const api = createGroups(
                { g: [{ colId: 'a', width: 100, pinned }], h: [{ colId: 'd', width: 850, pinned }] },
                { colResizeDefault: 'shift' }
            );
            api.setFocusedHeader('g');
            const header = document.activeElement!;

            // the first key step is 2px
            header.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
            header.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
            await asyncSetTimeout(0);

            expect(widths(api, ['a', 'd'])).toEqual([102, 848]);
        }
    );

    test("under colResizeDefault 'shift', Alt+ArrowRight on a pinned group whose next group cannot resize grows only into the room left", async () => {
        const api = createGroups(
            {
                g: [{ colId: 'a', width: 100, pinned: 'left' }],
                h: [{ colId: 'd', width: 850, pinned: 'left', resizable: false }],
            },
            { colResizeDefault: 'shift' }
        );
        api.setFocusedHeader('g');
        const header = document.activeElement!;

        header.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
        header.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
        await asyncSetTimeout(0);

        expect(widths(api, ['a', 'd'])).toEqual([100, 850]);
    });

    test("under colResizeDefault 'shift', Alt+ArrowRight on a pinned group taking from a centre group grows only into the room left", async () => {
        const api = createGroups(
            {
                g: [
                    { colId: 'a', width: 100, pinned: 'left' },
                    { colId: 'b', width: 850, pinned: 'left', resizable: false },
                ],
                h: [{ colId: 'd', width: 100 }],
            },
            { colResizeDefault: 'shift' }
        );
        api.setFocusedHeader('g');
        const header = document.activeElement!;

        header.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
        header.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true }));
        await asyncSetTimeout(0);

        expect(widths(api, ['a', 'd'])).toEqual([100, 100]);
    });

    test('a group shift-drag stops where the next group reaches its summed minWidth', async () => {
        const api = createGroups({
            g: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
            h: [
                { colId: 'd', width: 100, minWidth: 99 },
                { colId: 'e', width: 300, minWidth: 299 },
            ],
        });
        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-group-cell .ag-header-cell-resize'
        )!;
        const dispatcher = new DragEventDispatcher('mouse');

        await dispatcher.startDrag(bar, 600, 10, { shiftKey: true });
        await dispatcher.movePointer(bar, 610, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);

        expect(widths(api, ['a', 'b', 'd', 'e'])).toEqual([101, 101, 99, 299]);
    });

    test('a group shift-drag where no width fits both groups changes neither, and still ends', async () => {
        // `d`'s minWidth above its maxWidth leaves the next group nothing it can give or take
        const api = createGroups({
            g: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
            ],
            h: [{ colId: 'd', width: 100, minWidth: 150, maxWidth: 120 }],
        });
        const resized: [string[], boolean][] = [];
        api.addEventListener('columnResized', (e) =>
            resized.push([e.columns!.map((col) => col.getColId()), e.finished])
        );
        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-group-cell .ag-header-cell-resize'
        )!;
        const dispatcher = new DragEventDispatcher('mouse');

        await dispatcher.startDrag(bar, 600, 10, { shiftKey: true });
        await dispatcher.movePointer(bar, 610, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);

        expect(widths(api, ['a', 'b', 'd'])).toEqual([100, 100, 120]);
        expect(resized).toEqual([[['a', 'b'], true]]);
    });

    test('a group resize lands its whole width when one pass takes columns past their max and another under its min', async () => {
        // 2px wider: rounding takes `b` and `c` a pixel past their max and leaves `d` a pixel under its min
        const api = createGroups({
            g: [
                { colId: 'a', width: 121, minWidth: 120, maxWidth: 122 },
                { colId: 'b', width: 149, minWidth: 147, maxWidth: 149 },
                { colId: 'c', width: 117, minWidth: 117, maxWidth: 117 },
                { colId: 'd', width: 18, minWidth: 18, maxWidth: 19 },
            ],
        });

        await dragFirstGroupTo(api, 602);

        expect(widths(api, ['a', 'b', 'c', 'd'])).toEqual([122, 149, 117, 19]);
    });

    test('a double-click on the group edge widens its columns, by their ratios, to what the header needs', async () => {
        // The header is measured as the width of a cloned form; the leaves opt out of their own auto-size.
        const measured = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
            this: HTMLElement
        ) {
            return this.tagName === 'FORM' ? 300 : 0;
        });
        try {
            const api = gridsManager.createGrid('groupFit', {
                columnDefs: [
                    {
                        headerName: 'g',
                        groupId: 'g',
                        children: [
                            { colId: 'a', field: 'a', width: 100, suppressAutoSize: true },
                            { colId: 'b', field: 'b', width: 50, suppressAutoSize: true },
                        ],
                    },
                ],
                autoSizePadding: 0,
                rowData: [{}],
            });
            const root = TestGridsManager.getHTMLElement(api)!;
            const bar = root.querySelector<HTMLElement>('.ag-header-group-cell .ag-header-cell-resize')!;

            bar.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            await asyncSetTimeout(0);
            const widened = widths(api, ['a', 'b']);

            // Already wider than the header needs: a fit only ever grows the group.
            measured.mockImplementation(function (this: HTMLElement) {
                return this.tagName === 'FORM' ? 100 : 0;
            });
            bar.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            await asyncSetTimeout(0);

            expect([widened, widths(api, ['a', 'b'])]).toEqual([
                [200, 100],
                [200, 100],
            ]);
        } finally {
            measured.mockRestore();
        }
    });

    test('a double-click group fit re-flexes the flex columns before the group too, as a column auto-size does', async () => {
        const measured = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
            this: HTMLElement
        ) {
            return this.tagName === 'FORM' ? 300 : 0;
        });
        try {
            const api = gridsManager.createGrid('groupFitFlex', {
                columnDefs: [
                    { colId: 'x', flex: 1 },
                    {
                        headerName: 'g',
                        groupId: 'g',
                        children: [{ colId: 'a', field: 'a', width: 200, suppressAutoSize: true }],
                    },
                    { colId: 'y', flex: 1 },
                ],
                autoSizePadding: 0,
                rowData: [{}],
            });
            const root = TestGridsManager.getHTMLElement(api)!;
            const bar = root.querySelector<HTMLElement>('.ag-header-group-cell .ag-header-cell-resize')!;

            bar.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            await asyncSetTimeout(0);

            expect(widths(api, ['x', 'a', 'y'])).toEqual([350, 300, 350]);
        } finally {
            measured.mockRestore();
        }
    });

    test('a group drag keeps the flex columns before the group at their widths, re-flexing only those after it', async () => {
        const api = gridsManager.createGrid('groupDragFlex', {
            columnDefs: [
                { colId: 'x', flex: 1 },
                { headerName: 'g', groupId: 'g', children: [{ colId: 'a', field: 'a', width: 200 }] },
                { colId: 'y', flex: 1 },
            ],
        });
        const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
            '.ag-header-group-cell .ag-header-cell-resize'
        )!;
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 600, 10);
        await dispatcher.movePointer(bar, 700, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);

        expect(widths(api, ['x', 'a', 'y'])).toEqual([400, 300, 300]);
    });

    test('a double-click group fit wider than its columns can hold stops each on its maxWidth', async () => {
        const measured = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
            this: HTMLElement
        ) {
            return this.tagName === 'FORM' ? 300 : 0;
        });
        try {
            const api = gridsManager.createGrid('groupFitMax', {
                columnDefs: [
                    {
                        headerName: 'g',
                        groupId: 'g',
                        children: [
                            { colId: 'a', field: 'a', width: 100, maxWidth: 120, suppressAutoSize: true },
                            { colId: 'b', field: 'b', width: 50, maxWidth: 120, suppressAutoSize: true },
                        ],
                    },
                ],
                autoSizePadding: 0,
                rowData: [{}],
            });
            const bar = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>(
                '.ag-header-group-cell .ag-header-cell-resize'
            )!;

            bar.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            await asyncSetTimeout(0);

            expect(widths(api, ['a', 'b'])).toEqual([120, 120]);
        } finally {
            measured.mockRestore();
        }
    });
});

describe('setColumnWidths', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a width outside the column bounds is refused rather than clamped, so the column keeps its width', async () => {
        const api = gridsManager.createGrid('bounds', {
            columnDefs: [{ colId: 'a', width: 100, minWidth: 50, maxWidth: 150 }],
        });
        const finished: string[][] = [];
        api.addEventListener('columnResized', (e) => {
            if (e.finished) {
                finished.push(e.columns!.map((col) => col.getColId()));
            }
        });

        api.setColumnWidths([{ key: 'a', newWidth: 30 }]);
        api.setColumnWidths([{ key: 'a', newWidth: 200 }]);
        api.setColumnWidths([{ key: 'a', newWidth: Number.NaN }]);
        const refused = api.getColumn('a')!.getActualWidth();
        api.setColumnWidths([{ key: 'a', newWidth: 149.5 }]);

        expect([refused, api.getColumn('a')!.getActualWidth()]).toEqual([100, 149.5]);
        // a refused resize still ends, so a drag that ends on one is told it did
        await waitFor(() => expect(finished).toEqual([['a'], ['a'], ['a'], ['a']]));
    });

    test('a call naming no column, or refused and not finished, raises nothing', async () => {
        const api = gridsManager.createGrid('nothing', {
            columnDefs: [{ colId: 'a', width: 100, minWidth: 50, maxWidth: 150 }],
        });
        const events: string[][] = [];
        api.addEventListener('columnResized', (e) => events.push(e.columns!.map((col) => col.getColId())));

        api.setColumnWidths([{ key: 'missing', newWidth: 100 }]);
        api.setColumnWidths([{ key: 'a', newWidth: 30 }], false);
        api.setColumnWidths([{ key: 'a', newWidth: 120 }]);

        // only the last call's event, as the two before it raised none
        await waitFor(() => expect(events).toEqual([['a']]));
        expect(api.getColumn('a')!.getActualWidth()).toBe(120);
    });

    test("under colResizeDefault 'shift', every displayed column a setColumnWidths call names takes from the column after it, a hidden one from none", () => {
        const api = gridsManager.createGrid('apiShiftEach', {
            columnDefs: [
                ...['a', 'b', 'c', 'd'].map((colId) => ({ colId, field: colId, width: 100 })),
                { colId: 'h', width: 100, hide: true },
            ],
            colResizeDefault: 'shift',
        });

        api.setColumnWidths([
            { key: 'a', newWidth: 150 },
            { key: 'c', newWidth: 150 },
            { key: 'h', newWidth: 80 },
        ]);

        expect(['a', 'b', 'c', 'd', 'h'].map((id) => api.getColumn(id)!.getActualWidth())).toEqual([
            150, 50, 150, 50, 80,
        ]);
    });

    test('one refused column set refuses the whole call, including the adjacent column shift takes from', () => {
        const api = gridsManager.createGrid('boundsShift', {
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100, minWidth: 80 },
            ],
            colResizeDefault: 'shift',
        });

        // `b` would have to give 30px and drop to 70, under its 80.
        api.setColumnWidths([{ key: 'a', newWidth: 130 }]);

        expect(['a', 'b'].map((id) => api.getColumn(id)!.getActualWidth())).toEqual([100, 100]);
    });
});

describe('header auto-size', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a double-click on a resize bar auto-sizes its column or group, unless auto-size is suppressed', async () => {
        // a header or cell is measured as the width of a cloned form
        const measured = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
            this: HTMLElement
        ) {
            return this.tagName === 'FORM' ? 300 : 0;
        });
        try {
            const columnDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'g',
                    groupId: 'g',
                    children: [
                        { colId: 'x', width: 100, suppressAutoSize: true },
                        { colId: 'y', width: 50, suppressAutoSize: true },
                    ],
                },
                { colId: 'a', width: 100, suppressAutoSize: true },
                { colId: 'b', width: 100 },
                // its column auto-sizes itself first, and then already fits the header
                { headerName: 'h', groupId: 'h', children: [{ colId: 'z', width: 100 }] },
            ];
            const doubleClickAll = async (api: GridApi): Promise<number[]> => {
                const root = TestGridsManager.getHTMLElement(api)!;
                const bars = [
                    ...root.querySelectorAll('.ag-header-group-cell .ag-header-cell-resize'),
                    root.querySelector('.ag-header-cell[col-id="a"] .ag-header-cell-resize')!,
                    root.querySelector('.ag-header-cell[col-id="b"] .ag-header-cell-resize')!,
                ];
                for (const bar of bars) {
                    bar.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                }
                await asyncSetTimeout(0);
                return ['x', 'y', 'a', 'b', 'z'].map((id) => api.getColumn(id)!.getActualWidth());
            };

            const sized = gridsManager.createGrid('autosize', { columnDefs, autoSizePadding: 0, rowData: [{}] });
            expect(await doubleClickAll(sized)).toEqual([200, 100, 100, 300, 300]);

            const suppressed = gridsManager.createGrid('suppressed', {
                columnDefs,
                autoSizePadding: 0,
                rowData: [{}],
                suppressAutoSize: true,
            });
            expect(await doubleClickAll(suppressed)).toEqual([100, 50, 100, 100, 100]);

            // a column's own suppression follows its definition, both ways
            const toggled = gridsManager.createGrid('toggled', {
                columnDefs: [{ colId: 'a', width: 100, suppressAutoSize: true }],
                autoSizePadding: 0,
                rowData: [{}],
            });
            const doubleClick = async (): Promise<number> => {
                TestGridsManager.getHTMLElement(toggled)!
                    .querySelector('.ag-header-cell[col-id="a"] .ag-header-cell-resize')!
                    .dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                await asyncSetTimeout(0);
                return toggled.getColumn('a')!.getActualWidth();
            };
            expect(await doubleClick()).toBe(100);
            toggled.setGridOption('columnDefs', [{ colId: 'a', width: 100 }]);
            expect(await doubleClick()).toBe(300);
            toggled.setGridOption('columnDefs', [{ colId: 'a', width: 100, suppressAutoSize: true }]);
            toggled.setColumnWidths([{ key: 'a', newWidth: 100 }]);
            expect(await doubleClick()).toBe(100);
        } finally {
            measured.mockRestore();
        }
    });

    test('an auto-size reaching a group none of whose columns resizes sizes only the columns', async () => {
        const measured = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
            this: HTMLElement
        ) {
            return this.tagName === 'FORM' ? 300 : 0;
        });
        try {
            const api = gridsManager.createGrid('fixedGroup', {
                columnDefs: [
                    { headerName: 'g', groupId: 'g', children: [{ colId: 'a', width: 100, resizable: false }] },
                ],
                autoSizePadding: 0,
                rowData: [{}],
            });
            await asyncSetTimeout(0);

            api.autoSizeAllColumns();
            await asyncSetTimeout(0);

            expect(api.getColumn('a')!.getActualWidth()).toBe(300);
        } finally {
            measured.mockRestore();
        }
    });
});
