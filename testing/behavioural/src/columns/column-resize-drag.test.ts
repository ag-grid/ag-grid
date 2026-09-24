import { DragEventDispatcher, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, ColGroupDef, ColumnPinnedType, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';

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

    // The worked example in `resizeColumnSets`: A capped at 100 leaves B and C splitting the remaining 500.
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
