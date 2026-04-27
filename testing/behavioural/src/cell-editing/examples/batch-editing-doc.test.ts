import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type { GridOptions, ValueGetterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateEditorModule,
    NumberEditorModule,
    PinnedRowModule,
    ScrollApiModule,
    SelectEditorModule,
    TextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    BatchEditModule,
    CellSelectionModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    CustomEditorModule,
    RenderApiModule,
    RowGroupingModule,
} from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

interface MedalRow {
    id: string;
    athlete: string;
    age: number;
    country: string;
    date: string;
    sport: string;
    gold: number;
    silver: number;
    bronze: number;
    total?: number;
}

describe('Batch editing documentation examples', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            ClientSideRowModelModule,
            DateEditorModule,
            NumberEditorModule,
            TextEditorModule,
            SelectEditorModule,
            PinnedRowModule,
            ScrollApiModule,
            BatchEditModule,
            CellSelectionModule,
            ColumnsToolPanelModule,
            ColumnMenuModule,
            ContextMenuModule,
            CustomEditorModule,
            RenderApiModule,
            RowGroupingModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.clearAllMocks();
    });

    test('batch editing API doc example preserves batch states and totals', async () => {
        const rowData: MedalRow[] = [
            {
                id: '0',
                athlete: 'Ali',
                age: 24,
                country: 'Ireland',
                date: '2024-01-01',
                sport: 'Rowing',
                gold: 1,
                silver: 2,
                bronze: 3,
            },
            {
                id: '1',
                athlete: 'Bob',
                age: 26,
                country: 'Spain',
                date: '2024-01-02',
                sport: 'Cycling',
                gold: 2,
                silver: 1,
                bronze: 0,
            },
        ];

        const api = await gridsManager.createGridAndWait('batchEditingExample', {
            columnDefs: [
                { field: 'athlete', minWidth: 120 },
                { field: 'age', aggFunc: 'avg' },
                { field: 'country' },
                { field: 'date' },
                { field: 'sport', minWidth: 120 },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze', minWidth: 100 },
                {
                    field: 'total',
                    aggFunc: 'sum',
                    valueGetter: (params: ValueGetterParams<MedalRow>) => {
                        const { node, data, api: gridApi } = params;
                        const overlay = node ? gridApi!.getEditRowValues(node) : undefined;
                        const merged = Object.assign({}, data, overlay);
                        return (merged.gold ?? 0) + (merged.silver ?? 0) + (merged.bronze ?? 0);
                    },
                    editable: false,
                },
            ],
            rowData,
            getRowId: (params) => params.data.id,
            animateRows: false,
            grandTotalRow: 'bottom',
            defaultColDef: {
                editable: true,
                flex: 1,
            },
        } satisfies GridOptions<MedalRow>);

        const gridElement = getGridElement(api)! as HTMLElement;
        const getCell = async (rowId: string, colId: keyof Pick<MedalRow, 'gold' | 'silver' | 'bronze' | 'total'>) => {
            api.ensureColumnVisible(colId);
            await asyncSetTimeout(0);
            return getByTestId(gridElement, agTestIdFor.cell(rowId, colId));
        };
        const goldCell = (rowId: string = '0') => getCell(rowId, 'gold');
        const silverCell = (rowId: string = '0') => getCell(rowId, 'silver');
        const totalCell = (rowId: string = '0') => getCell(rowId, 'total');
        const bronzeCell = (rowId: string = '0') => getCell(rowId, 'bronze');
        const bobOriginal = { ...rowData[1] };
        const aliceGoldCell = await goldCell();
        const aliceSilverCell = await silverCell();
        const aliceTotalCell = await totalCell();

        await new GridRows(api, 'batch editing initial').check(`
            ROOT id:ROOT_NODE_ID age:{"count":2,"value":25} total:9
            ├── LEAF id:0 athlete:"Ali" age:24 country:"Ireland" date:"2024-01-01" sport:"Rowing" gold:1 silver:2 bronze:3 total:6
            ├── LEAF id:1 athlete:"Bob" age:26 country:"Spain" date:"2024-01-02" sport:"Cycling" gold:2 silver:1 bronze:0 total:3
            └─ footer id:rowGroupFooter_ROOT_NODE_ID age:{"count":2,"value":25} total:9
        `);

        expect(aliceTotalCell).toHaveTextContent('6');

        const user = userEvent.setup();

        api.startBatchEdit();
        expect(api.isBatchEditing()).toBe(true);

        await user.dblClick(aliceGoldCell);
        await user.keyboard('100{Enter}');
        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(aliceGoldCell).toHaveTextContent('100');
        expect(aliceGoldCell).toHaveClass('ag-cell-batch-edit');
        expect(aliceTotalCell).toHaveTextContent('105');
        expect(aliceTotalCell).not.toHaveClass('ag-cell-batch-edit');
        expect(api.isBatchEditing()).toBe(true);

        await new GridRows(api, 'batch pending gold=100 before commit').check(`
            ROOT id:ROOT_NODE_ID age:{"count":2,"value":25} total:9
            ├── LEAF ⏳ id:0 athlete:"Ali" age:24 country:"Ireland" date:"2024-01-01" sport:"Rowing" gold:⏳100 1 silver:2 bronze:3 total:105
            ├── LEAF id:1 athlete:"Bob" age:26 country:"Spain" date:"2024-01-02" sport:"Cycling" gold:2 silver:1 bronze:0 total:3
            └─ footer id:rowGroupFooter_ROOT_NODE_ID age:{"count":2,"value":25} total:9
        `);

        api.commitBatchEdit();
        expect(api.isBatchEditing()).toBe(false);
        expect(aliceGoldCell).not.toHaveClass('ag-cell-batch-edit');
        await new GridRows(api, 'after first commit').check(`
            ROOT id:ROOT_NODE_ID age:{"count":2,"value":25} total:108
            ├── LEAF id:0 athlete:"Ali" age:24 country:"Ireland" date:"2024-01-01" sport:"Rowing" gold:100 silver:2 bronze:3 total:105
            ├── LEAF id:1 athlete:"Bob" age:26 country:"Spain" date:"2024-01-02" sport:"Cycling" gold:2 silver:1 bronze:0 total:3
            └─ footer id:rowGroupFooter_ROOT_NODE_ID age:{"count":2,"value":25} total:108
        `);

        await user.dblClick(aliceGoldCell);
        await user.keyboard('50{Enter}');
        expect(api.isBatchEditing()).toBe(false);
        expect(aliceGoldCell).toHaveTextContent('50');
        expect(aliceGoldCell).not.toHaveClass('ag-cell-batch-edit');
        expect(aliceTotalCell).toHaveTextContent('55');

        api.startBatchEdit();
        expect(api.isBatchEditing()).toBe(true);

        await user.dblClick(aliceGoldCell);
        await user.keyboard('120{Enter}');
        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(aliceGoldCell).toHaveTextContent('120');
        expect(aliceGoldCell).toHaveClass('ag-cell-batch-edit');
        expect(aliceTotalCell).toHaveTextContent('125');

        await user.keyboard('{Tab}');
        expect(api.isBatchEditing()).toBe(true);
        const editorsAfterTab = api.getCellEditorInstances();
        expect(editorsAfterTab).toHaveLength(1);
        const silverEditorInput = aliceSilverCell.querySelector('input') as HTMLInputElement | null;
        expect(silverEditorInput).toBeTruthy();
        expect(silverEditorInput?.valueAsNumber).toBe(2);

        await user.keyboard('{Enter}');
        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(aliceGoldCell).toHaveClass('ag-cell-batch-edit');
        expect(aliceSilverCell).not.toHaveClass('ag-cell-batch-edit');
        expect(api.isBatchEditing()).toBe(true);

        api.commitBatchEdit();
        expect(api.isBatchEditing()).toBe(false);
        expect(aliceGoldCell).not.toHaveClass('ag-cell-batch-edit');
        expect(aliceGoldCell).toHaveTextContent('120');
        expect(aliceTotalCell).toHaveTextContent('125');

        api.setFocusedCell(1, 'gold');
        api.startBatchEdit();
        expect(api.isBatchEditing()).toBe(true);

        const bobGoldCell = await goldCell('1');
        const bobBronzeCell = await bronzeCell('1');
        await user.dblClick(bobGoldCell);
        await user.keyboard('100{Enter}');
        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(bobBronzeCell).toHaveTextContent('0');
        expect(bobGoldCell).toHaveClass('ag-cell-batch-edit');
        expect(aliceTotalCell).toHaveTextContent('125');

        api.commitBatchEdit();
        expect(api.isBatchEditing()).toBe(false);
        expect(api.getEditingCells()).toHaveLength(0);
        expect(bobGoldCell).not.toHaveClass('ag-cell-batch-edit');
        expect(bobGoldCell).toHaveTextContent('100');

        api.applyTransaction({ update: [{ ...bobOriginal }] });
        expect(bobGoldCell).toHaveTextContent(String(bobOriginal.gold));

        await new GridRows(api, 'after all batch scenarios').check(`
            ROOT id:ROOT_NODE_ID age:{"count":2,"value":25} total:128
            ├── LEAF id:0 athlete:"Ali" age:24 country:"Ireland" date:"2024-01-01" sport:"Rowing" gold:120 silver:2 bronze:3 total:125
            ├── LEAF id:1 athlete:"Bob" age:26 country:"Spain" date:"2024-01-02" sport:"Cycling" gold:2 silver:1 bronze:0 total:3
            └─ footer id:rowGroupFooter_ROOT_NODE_ID age:{"count":2,"value":25} total:128
        `);
    });

    test('batch editing preserves values when navigating between cells', async () => {
        const api = await gridsManager.createGridAndWait('batchNavigation', {
            columnDefs: [
                { field: 'a', cellEditor: 'agTextCellEditor' },
                { field: 'b', cellEditor: 'agTextCellEditor' },
                { field: 'c', cellEditor: 'agTextCellEditor' },
            ],
            rowData: [
                { id: '0', a: 'a0', b: 'b0', c: 'c0' },
                { id: '1', a: 'a1', b: 'b1', c: 'c1' },
            ],
            getRowId: (params) => params.data.id,
            defaultColDef: { editable: true, flex: 1 },
        });

        await asyncSetTimeout(1);
        const gridElement = getGridElement(api)! as HTMLElement;
        const getCell = (rowId: string, colId: string) => getByTestId(gridElement, agTestIdFor.cell(rowId, colId));
        const user = userEvent.setup();

        api.startBatchEdit();

        // Edit cell a0
        const cellA0 = getCell('0', 'a');
        await user.dblClick(cellA0);
        await user.keyboard('edited-a0');
        expect(cellA0.querySelector('input')?.value).toBe('edited-a0');

        // Tab to next cell - value should be preserved
        await user.keyboard('{Tab}');
        await asyncSetTimeout(1);

        expect(cellA0).toHaveTextContent('edited-a0');
        expect(cellA0).toHaveClass('ag-cell-batch-edit');

        // Edit cell b0
        const cellB0 = getCell('0', 'b');
        expect(cellB0.querySelector('input')).toBeTruthy();
        await user.keyboard('edited-b0');
        await asyncSetTimeout(1);

        // Tab to next cell
        await user.keyboard('{Tab}');
        await asyncSetTimeout(1);

        expect(cellA0).toHaveTextContent('edited-a0');
        expect(cellB0).toHaveTextContent('edited-b0');
        expect(cellA0).toHaveClass('ag-cell-batch-edit');
        expect(cellB0).toHaveClass('ag-cell-batch-edit');

        // Edit cell c0
        const cellC0 = getCell('0', 'c');
        expect(cellC0.querySelector('input')).toBeTruthy();
        await user.keyboard('edited-c0');
        await asyncSetTimeout(1);

        // Press Enter to close editor
        await user.keyboard('{Enter}');
        await asyncSetTimeout(1);

        expect(cellA0).toHaveTextContent('edited-a0');
        expect(cellB0).toHaveTextContent('edited-b0');
        expect(cellC0).toHaveTextContent('edited-c0');
        expect(cellA0).toHaveClass('ag-cell-batch-edit');
        expect(cellB0).toHaveClass('ag-cell-batch-edit');
        expect(cellC0).toHaveClass('ag-cell-batch-edit');

        await new GridRows(api, 'three cells batch pending before commit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:0 a:⏳"edited-a0" "a0" b:⏳"edited-b0" "b0" c:⏳"edited-c0" "c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);

        // Data should still be original until commit
        const rowNode = api.getRowNode('0')!;
        expect(rowNode.data.a).toBe('a0');
        expect(rowNode.data.b).toBe('b0');
        expect(rowNode.data.c).toBe('c0');

        // Commit should apply all pending values
        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(rowNode.data.a).toBe('edited-a0');
        expect(rowNode.data.b).toBe('edited-b0');
        expect(rowNode.data.c).toBe('edited-c0');
        expect(cellA0).not.toHaveClass('ag-cell-batch-edit');
        expect(cellB0).not.toHaveClass('ag-cell-batch-edit');
        expect(cellC0).not.toHaveClass('ag-cell-batch-edit');
    });
});
