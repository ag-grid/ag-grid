import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type { GridOptions, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    TextEditorModule,
    UndoRedoEditModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule, FormulaModule } from 'ag-grid-enterprise';

import {
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clipboardUtils,
    initPointerEventPolyfill,
    waitForEvent,
} from '../test-utils';

/**
 * Interactive formula workflows: clipboard copy/paste with ref shifting, fill
 * handle expansion, and batch editing. Each path invokes formula shifting or
 * cache invalidation from a different entry point than direct editing, so the
 * cache rewrite needs to stay correct across all of them.
 */
describe('ag-grid formulas interactive workflows', () => {
    const gridRowsOpts = { useFormatter: false } as const;

    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            FormulaModule,
            TextEditorModule,
            UndoRedoEditModule,
            CellSelectionModule,
            ClipboardModule,
            BatchEditModule,
        ] as Module[],
    });

    beforeAll(() => {
        initPointerEventPolyfill();
        setupAgTestIds();
        clipboardUtils.init();
    });

    beforeEach(() => {
        clipboardUtils.init();
    });

    afterEach(() => {
        gridsManager.reset();
        clipboardUtils.reset();
    });

    function createGrid(id: string, opts: Partial<GridOptions>) {
        const options: GridOptions = {
            defaultColDef: { allowFormula: true, editable: true },
            getRowId: (params) => params.data?.id,
            ...opts,
        };
        return gridsManager.createGridAndWait(id, options);
    }

    // ------------------------------------------------------------------
    // Clipboard copy/paste of formula cells.
    // ------------------------------------------------------------------

    test('pasting a raw formula string evaluates in the destination row', async () => {
        const api = await createGrid('fx-clipboard-paste', {
            cellSelection: true,
            rowData: [
                { id: 'r1', a: 2, b: 3, out: null },
                { id: 'r2', a: 5, b: 7, out: null },
            ],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'out' }],
        });

        await new GridRows(api, 'before paste', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:2 b:3 out:null
            └── LEAF id:r2 row-number:"2" a:5 b:7 out:null
        `);

        // Seed the clipboard with a formula string referencing r2 and paste
        // into r2's `out` cell - pasteFromClipboard should accept it, the
        // formula service should parse and cache it, and the value should
        // come out as the computed sum.
        clipboardUtils.setText('=REF(COLUMN("a"),ROW("r2"))+REF(COLUMN("b"),ROW("r2"))');
        api.setFocusedCell(1, 'out');
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;
        await asyncSetTimeout(5);

        const r2 = api.getRowNode('r2')!;
        expect(api.getCellValue({ rowNode: r2, colKey: 'out', useFormatter: false })).toBe(12);

        // r1 is untouched.
        const r1 = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode: r1, colKey: 'out', useFormatter: false })).toBeNull();
    });

    // ------------------------------------------------------------------
    // Fill handle dragged downward from a formula cell.
    // ------------------------------------------------------------------

    test('fill handle drag down replicates a formula with row-shifted refs', async () => {
        const api = await createGrid('fx-fill-handle', {
            cellSelection: { handle: { mode: 'fill' } },
            rowData: [
                { id: 'r1', a: 1, b: 10, total: '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))' },
                { id: 'r2', a: 2, b: 20, total: null },
                { id: 'r3', a: 3, b: 30, total: null },
                { id: 'r4', a: 4, b: 40, total: null },
            ],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'total' }],
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        await new GridRows(api, 'before fill', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:10 total:11
            ├── LEAF id:r2 row-number:"2" a:2 b:20 total:null
            ├── LEAF id:r3 row-number:"3" a:3 b:30 total:null
            └── LEAF id:r4 row-number:"4" a:4 b:40 total:null
        `);

        api.setFocusedCell(0, 'total');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['total'] });
        await asyncSetTimeout(1);

        const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());
        const fillEnd = waitForEvent('fillEnd', api);
        await userEvent.dblClick(fillHandle);
        await fillEnd;
        await asyncSetTimeout(5);

        // Each filled row must evaluate its own row's a+b, not r1's values.
        await new GridRows(api, 'after fill down', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:1 b:10 total:11
            ├── LEAF id:r2 row-number:"2" a:2 b:20 total:22
            ├── LEAF id:r3 row-number:"3" a:3 b:30 total:33
            └── LEAF id:r4 row-number:"4" a:4 b:40 total:44
        `);
    });

    // ------------------------------------------------------------------
    // Batch editing.
    // ------------------------------------------------------------------

    test('batch-edit commit persists formula edits and their computed values', async () => {
        const api = await createGrid('fx-batch-commit', {
            cellSelection: true,
            rowData: [
                { id: 'r1', a: 2, b: 3, out: '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))' },
                { id: 'r2', a: 5, b: 7, out: '=REF(COLUMN("a"),ROW("r2"))+REF(COLUMN("b"),ROW("r2"))' },
            ],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'out' }],
        });

        await new GridRows(api, 'initial', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:2 b:3 out:5
            └── LEAF id:r2 row-number:"2" a:5 b:7 out:12
        `);

        api.startBatchEdit();
        expect(api.isBatchEditing()).toBe(true);

        // Stage pending edits against two different formula cells.
        api.getRowNode('r1')!.setDataValue('out', '=REF(COLUMN("a"),ROW("r1"))*REF(COLUMN("b"),ROW("r1"))');
        api.getRowNode('r2')!.setDataValue('a', 10);
        await asyncSetTimeout(1);

        api.commitBatchEdit();
        expect(api.isBatchEditing()).toBe(false);
        await asyncSetTimeout(5);

        await new GridRows(api, 'after commit', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" a:2 b:3 out:6
            └── LEAF id:r2 row-number:"2" a:10 b:7 out:17
        `);
    });

    test('batch-edit cancel rolls back pending formula edits and their computed values', async () => {
        const api = await createGrid('fx-batch-cancel', {
            cellSelection: true,
            rowData: [{ id: 'r1', a: 2, b: 3, out: '=REF(COLUMN("a"),ROW("r1"))+REF(COLUMN("b"),ROW("r1"))' }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'out' }],
        });

        await new GridRows(api, 'initial', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:2 b:3 out:5
        `);

        api.startBatchEdit();
        api.getRowNode('r1')!.setDataValue('out', '=REF(COLUMN("a"),ROW("r1"))*REF(COLUMN("b"),ROW("r1"))*100');
        api.getRowNode('r1')!.setDataValue('a', 99);
        await asyncSetTimeout(1);

        api.cancelBatchEdit();
        await asyncSetTimeout(5);

        // Cancel reverts both the formula string and the input cell - the
        // cache must recompute to the original value, not leave stale state.
        await new GridRows(api, 'after cancel', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 row-number:"1" a:2 b:3 out:5
        `);
    });
});
