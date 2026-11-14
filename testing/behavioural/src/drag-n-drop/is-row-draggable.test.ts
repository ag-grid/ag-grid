import {
    ALL_SEVERITIES,
    DragEventDispatcher,
    RowDragDispatcher,
    TestGridsManager,
    applyTransactionChecked,
    asyncSetTimeout,
    clickRowSelectionCheckbox,
    initPointerEventPolyfill,
    mockGridLayout,
} from 'ag-test-utils';

import type { GridApi, GridOptions, RowDragEndEvent } from 'ag-grid-community';
import { ClientSideRowModelModule, RowDragModule, RowSelectionModule, enableDevValidations } from 'ag-grid-community';
import { CellSelectionModule, TreeDataModule } from 'ag-grid-enterprise';

interface Athlete {
    id: string;
    name: string;
    locked?: boolean;
    children?: Athlete[];
}

const createRowData = (): Athlete[] => [
    { id: '1', name: 'A' },
    { id: '2', name: 'B', locked: true },
    { id: '3', name: 'C' },
    { id: '4', name: 'D', locked: true },
    { id: '5', name: 'E' },
    { id: '6', name: 'F' },
];

const isRowDraggable: GridOptions<Athlete>['isRowDraggable'] = (params) => !params.data?.locked;

const rowOrder = (api: GridApi): string[] => {
    const ids: string[] = [];
    api.forEachNodeAfterFilterAndSort((node) => ids.push(node.id!));
    return ids;
};

const rowElement = (api: GridApi, rowId: string): HTMLElement =>
    TestGridsManager.getHTMLElement(api)!.querySelector(`.ag-row[row-id="${rowId}"]`)!;

const handleOf = (api: GridApi, rowId: string, colId = 'name'): HTMLElement =>
    rowElement(api, rowId).querySelector(`[col-id="${colId}"] .ag-drag-handle`)!;

const suppressRowDragDeprecation = () => enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [306] });

const handleClasses = (api: GridApi, rowId: string, colId?: string) => {
    const classList = handleOf(api, rowId, colId).classList;
    return {
        hidden: classList.contains('ag-hidden'),
        invisible: classList.contains('ag-invisible'),
        disabled: classList.contains('ag-drag-handle-disabled'),
    };
};

const VISIBLE = { hidden: false, invisible: false, disabled: false };
const LOCKED = { hidden: false, invisible: true, disabled: true };

interface DragOutcome {
    enter: number;
    ends: RowDragEndEvent[];
}

/** Presses `source` (a cell or handle), moves onto the lower half of row `toId` and releases. */
const dragFrom = async (api: GridApi, source: Element, toId: string): Promise<DragOutcome> => {
    const gridElement = TestGridsManager.getHTMLElement(api)!;
    const target = rowElement(api, toId);
    const outcome: DragOutcome = { enter: 0, ends: [] };
    const onEnter = () => ++outcome.enter;
    const onEnd = (event: RowDragEndEvent) => outcome.ends.push(event);
    api.addEventListener('rowDragEnter', onEnter);
    api.addEventListener('rowDragEnd', onEnd);

    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const dispatcher = new DragEventDispatcher('mouse', gridElement.querySelector('.ag-grid-viewport'));
    await dispatcher.startDrag(source, sourceRect.left + 5, sourceRect.top + 5);
    await dispatcher.movePointer(source, sourceRect.left + 10, sourceRect.top + 10);
    await dispatcher.movePointer(target, targetRect.left + 10, targetRect.top + targetRect.height * 0.8);
    await dispatcher.finishDrag();
    await asyncSetTimeout(0);

    api.removeEventListener('rowDragEnter', onEnter);
    api.removeEventListener('rowDragEnd', onEnd);
    return outcome;
};

const dragCell = (api: GridApi, fromId: string, toId: string) =>
    dragFrom(api, rowElement(api, fromId).querySelector('[col-id="name"]')!, toId);

const dragHandle = (api: GridApi, fromId: string, toId: string, colId?: string) =>
    dragFrom(api, handleOf(api, fromId, colId), toId);

describe('isRowDraggable', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule, RowSelectionModule, CellSelectionModule, TreeDataModule],
    });

    beforeAll(() => {
        mockGridLayout.init();
        initPointerEventPolyfill();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    const createGrid = (options: GridOptions<Athlete>): GridApi<Athlete> =>
        gridsManager.createGrid('isRowDraggable', {
            columnDefs: [{ field: 'name', rowDrag: true }],
            rowData: createRowData(),
            getRowId: (params) => params.data.id,
            rowDragManaged: true,
            isRowDraggable,
            ...options,
        });

    test('entire-row drag starts nothing on a non-draggable row and moves a draggable one', async () => {
        const api = createGrid({ columnDefs: [{ field: 'name' }], rowDragEntireRow: true });
        await asyncSetTimeout(0);

        const locked = await dragCell(api, '2', '6');
        expect(locked.enter).toBe(0);
        expect(locked.ends).toHaveLength(0);
        expect(rowOrder(api)).toEqual(['1', '2', '3', '4', '5', '6']);

        const unlocked = await dragCell(api, '1', '6');
        expect(unlocked.enter).toBe(1);
        expect(unlocked.ends).toHaveLength(1);
        expect(rowOrder(api)).toEqual(['2', '3', '4', '5', '6', '1']);
    });

    test('rowDrag true column disables handles of non-draggable rows and starts nothing from them', async () => {
        const api = createGrid({});
        await asyncSetTimeout(0);

        expect(handleClasses(api, '1')).toEqual(VISIBLE);
        expect(handleClasses(api, '2')).toEqual(LOCKED);
        expect(handleClasses(api, '4')).toEqual(LOCKED);

        const column = api.getColumn('name')!;
        expect(column.isRowDrag(api.getRowNode('1')!)).toBe(true);
        expect(column.isRowDrag(api.getRowNode('2')!)).toBe(false);

        const locked = await dragHandle(api, '2', '6');
        expect(locked.enter).toBe(0);
        expect(locked.ends).toHaveLength(0);
        expect(rowOrder(api)).toEqual(['1', '2', '3', '4', '5', '6']);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('1');
        await dispatcher.move('6', { yOffsetPercent: 0.8 });
        await dispatcher.finish();
        await asyncSetTimeout(0);
        expect(rowOrder(api)).toEqual(['2', '3', '4', '5', '6', '1']);
    });

    test('multi-row drag leaves non-draggable selected rows behind', async () => {
        const api = createGrid({ rowSelection: { mode: 'multiRow' }, rowDragMultiRow: true });
        await asyncSetTimeout(0);
        await clickRowSelectionCheckbox(api, ['1', '2', '3']);
        await asyncSetTimeout(0);

        const outcome = await dragHandle(api, '1', '6');
        expect(outcome.ends).toHaveLength(1);
        expect(outcome.ends[0].nodes.map((node) => node.id)).toEqual(['1', '3']);
        expect(rowOrder(api)).toEqual(['2', '4', '5', '6', '1', '3']);
    });

    test('multi-row drag cannot start from a selected non-draggable row', async () => {
        const api = createGrid({
            columnDefs: [{ field: 'name' }],
            rowDragEntireRow: true,
            rowSelection: { mode: 'multiRow' },
            rowDragMultiRow: true,
        });
        await asyncSetTimeout(0);
        await clickRowSelectionCheckbox(api, ['1', '2']);
        await asyncSetTimeout(0);

        const outcome = await dragCell(api, '2', '6');
        expect(outcome.enter).toBe(0);
        expect(outcome.ends).toHaveLength(0);
        expect(rowOrder(api)).toEqual(['1', '2', '3', '4', '5', '6']);
    });

    test('multi-row drag from the entire row leaves non-draggable selected rows behind', async () => {
        const api = createGrid({
            columnDefs: [{ field: 'name' }],
            rowDragEntireRow: true,
            rowSelection: { mode: 'multiRow' },
            rowDragMultiRow: true,
        });
        await asyncSetTimeout(0);
        await clickRowSelectionCheckbox(api, ['1', '2', '3']);
        await asyncSetTimeout(0);

        const outcome = await dragCell(api, '1', '6');
        expect(outcome.ends).toHaveLength(1);
        expect(outcome.ends[0].nodes.map((node) => node.id)).toEqual(['1', '3']);
        expect(rowOrder(api)).toEqual(['2', '4', '5', '6', '1', '3']);
    });

    test('other rows can be dropped around a non-draggable row', async () => {
        const api = createGrid({});
        await asyncSetTimeout(0);

        const outcome = await dragHandle(api, '1', '2');
        expect(outcome.ends).toHaveLength(1);
        expect(rowOrder(api)).toEqual(['2', '1', '3', '4', '5', '6']);
        expect(api.getRowNode('2')!.rowIndex).toBe(0);
    });

    test('a drag in progress completes when its row becomes non-draggable', async () => {
        const api = createGrid({});
        await asyncSetTimeout(0);

        const dispatcher = new RowDragDispatcher({ api });
        await dispatcher.start('1');
        await dispatcher.move('3', { yOffsetPercent: 0.5 });
        applyTransactionChecked(api, { update: [{ id: '1', name: 'A', locked: true }] });
        await dispatcher.move('6', { yOffsetPercent: 0.8 });
        await dispatcher.finish();
        await asyncSetTimeout(0);

        expect(rowOrder(api)).toEqual(['2', '3', '4', '5', '6', '1']);
        expect(handleClasses(api, '1')).toEqual(LOCKED);
    });

    test('with cell selection a non-draggable row handle starts no row drag', async () => {
        const api = createGrid({ cellSelection: true });
        await asyncSetTimeout(0);

        const outcome = await dragHandle(api, '2', '6');
        expect(outcome.enter).toBe(0);
        expect(outcome.ends).toHaveLength(0);
        expect(rowOrder(api)).toEqual(['1', '2', '3', '4', '5', '6']);
    });

    test('suppressRowDrag keeps handles hidden whatever isRowDraggable returns', async () => {
        const api = createGrid({ suppressRowDrag: true });
        await asyncSetTimeout(0);

        expect(handleClasses(api, '1').hidden).toBe(true);
        expect(handleClasses(api, '2').hidden).toBe(true);
    });

    test('data updates and option changes re-evaluate handles and drag gating', async () => {
        const api = createGrid({});
        await asyncSetTimeout(0);

        applyTransactionChecked(api, {
            update: [
                { id: '1', name: 'A', locked: true },
                { id: '2', name: 'B', locked: false },
            ],
        });
        await asyncSetTimeout(0);
        expect(handleClasses(api, '1')).toEqual(LOCKED);
        expect(handleClasses(api, '2')).toEqual(VISIBLE);
        expect((await dragHandle(api, '1', '6')).enter).toBe(0);
        expect((await dragHandle(api, '2', '6')).enter).toBe(1);

        api.setGridOption('isRowDraggable', undefined);
        await asyncSetTimeout(0);
        expect(handleClasses(api, '1')).toEqual(VISIBLE);
        expect(handleClasses(api, '4')).toEqual(VISIBLE);
        expect((await dragHandle(api, '1', '6')).enter).toBe(1);

        api.setGridOption('isRowDraggable', (params) => params.data?.id === '3');
        await asyncSetTimeout(0);
        expect(handleClasses(api, '3')).toEqual(VISIBLE);
        expect(handleClasses(api, '5')).toEqual(LOCKED);
    });

    test('tree data multi-row drag keeps draggable selected children of a non-draggable parent', async () => {
        const api = createGrid({
            columnDefs: [],
            autoGroupColumnDef: { field: 'name', rowDrag: true },
            treeData: true,
            treeDataChildrenField: 'children',
            groupDefaultExpanded: -1,
            rowData: [
                {
                    id: 'P',
                    name: 'P',
                    locked: true,
                    children: [
                        { id: 'pc1', name: 'PC1' },
                        { id: 'pc2', name: 'PC2' },
                    ],
                },
                {
                    id: 'Q',
                    name: 'Q',
                    children: [
                        { id: 'qc1', name: 'QC1' },
                        { id: 'qc2', name: 'QC2' },
                    ],
                },
                { id: 'T', name: 'T' },
            ],
            rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
            rowDragMultiRow: true,
        });
        await asyncSetTimeout(0);
        api.setNodesSelected({ nodes: [api.getRowNode('P')!, api.getRowNode('qc1')!], newValue: true });
        await asyncSetTimeout(0);

        const outcome = await dragHandle(api, 'pc1', 'T', 'ag-Grid-AutoColumn');
        expect(outcome.ends).toHaveLength(1);
        expect(outcome.ends[0].nodes.map((node) => node.id).sort()).toEqual(['pc1', 'pc2', 'qc1']);
    });

    test('redrawRows re-evaluates a callback that reads external state', async () => {
        const lockedIds = new Set<string>();
        const api = createGrid({ isRowDraggable: (params) => !lockedIds.has(params.node.id!) });
        await asyncSetTimeout(0);
        expect(handleClasses(api, '1')).toEqual(VISIBLE);

        lockedIds.add('1');
        api.redrawRows();
        await asyncSetTimeout(0);
        expect(handleClasses(api, '1')).toEqual(LOCKED);
        expect((await dragHandle(api, '1', '6')).enter).toBe(0);
    });

    test('entire-row drag gating follows data updates', async () => {
        const api = createGrid({ columnDefs: [{ field: 'name' }], rowDragEntireRow: true });
        await asyncSetTimeout(0);

        applyTransactionChecked(api, { update: [{ id: '1', name: 'A', locked: true }] });
        await asyncSetTimeout(0);
        expect((await dragCell(api, '1', '6')).enter).toBe(0);

        applyTransactionChecked(api, { update: [{ id: '2', name: 'B', locked: false }] });
        await asyncSetTimeout(0);
        expect((await dragCell(api, '2', '6')).enter).toBe(1);
    });

    test('a rowDrag callback is ignored and handles show on draggable rows', async () => {
        const rowDragCallback = vi.fn(() => false);
        suppressRowDragDeprecation();
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = createGrid({ columnDefs: [{ field: 'name', rowDrag: rowDragCallback }] });
        await asyncSetTimeout(0);

        expect(handleClasses(api, '1')).toEqual(VISIBLE);
        expect(handleClasses(api, '2')).toEqual(LOCKED);
        expect(rowDragCallback).not.toHaveBeenCalled();
        expect((await dragHandle(api, '1', '6')).enter).toBe(1);
    });

    test('a rowDrag false column stays hidden', async () => {
        const api = createGrid({
            columnDefs: [
                { field: 'id', rowDrag: false },
                { field: 'name', rowDrag: true },
            ],
        });
        await asyncSetTimeout(0);

        expect(handleOf(api, '1', 'id')).toBeNull();
        expect(handleOf(api, '2', 'id')).toBeNull();
        expect(handleClasses(api, '1', 'name')).toEqual(VISIBLE);
        expect(handleClasses(api, '2', 'name')).toEqual(LOCKED);
    });

    test('without the option the rowDrag callback only hides the handle', async () => {
        suppressRowDragDeprecation();
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = createGrid({
            isRowDraggable: undefined,
            columnDefs: [{ field: 'name', rowDrag: (params) => !params.data?.locked }],
            rowDragEntireRow: true,
        });
        await asyncSetTimeout(0);

        expect(handleClasses(api, '1')).toEqual(VISIBLE);
        expect(handleClasses(api, '2')).toEqual({ hidden: false, invisible: true, disabled: true });
        expect((await dragCell(api, '2', '6')).ends).toHaveLength(1);
    });

    test('unmanaged entire-row drag fires no events for a non-draggable row', async () => {
        const api = createGrid({ columnDefs: [{ field: 'name' }], rowDragEntireRow: true, rowDragManaged: false });
        await asyncSetTimeout(0);

        const locked = await dragCell(api, '2', '6');
        expect(locked.enter).toBe(0);
        expect(locked.ends).toHaveLength(0);

        const unlocked = await dragCell(api, '1', '6');
        expect(unlocked.enter).toBe(1);
        expect(unlocked.ends).toHaveLength(1);
        expect(rowOrder(api)).toEqual(['1', '2', '3', '4', '5', '6']);
    });

    describe('colDef.rowDrag callback deprecation', () => {
        const callbackWarnings = (warn: ReturnType<typeof vi.spyOn>) =>
            warn.mock.calls.filter((args: unknown[]) => args.join(' ').includes('colDef.rowDrag callback'));

        test('warns once for several callback columns', async () => {
            suppressRowDragDeprecation();
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const api = createGrid({
                isRowDraggable: undefined,
                columnDefs: [
                    { field: 'name', rowDrag: () => true },
                    { field: 'id', rowDrag: () => true },
                ],
            });
            await asyncSetTimeout(0);
            api.redrawRows();
            await asyncSetTimeout(0);

            expect(callbackWarnings(warn)).toHaveLength(1);
        });

        test('rowDrag true never warns', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            createGrid({});
            await asyncSetTimeout(0);

            expect(callbackWarnings(warn)).toHaveLength(0);
        });
    });
});
