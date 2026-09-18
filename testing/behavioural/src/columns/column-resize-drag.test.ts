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
});
