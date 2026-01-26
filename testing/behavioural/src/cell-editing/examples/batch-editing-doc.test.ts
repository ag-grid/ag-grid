import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import type { GridOptions, ValueGetterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberEditorModule,
    PinnedRowModule,
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
            NumberEditorModule,
            TextEditorModule,
            SelectEditorModule,
            PinnedRowModule,
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

    test('batch editing preserves pending values when navigating between cells (keepEdits)', async () => {
        // This test verifies that when navigating between cells in batch mode (Tab/Enter),
        // pending values are preserved and not lost. This tests the keepEdits logic in editService.
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
        ];

        const api = await gridsManager.createGridAndWait('keepEditsTest', {
            columnDefs: [
                { field: 'athlete' },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                {
                    field: 'total',
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
            defaultColDef: {
                editable: true,
                flex: 1,
            },
        } satisfies GridOptions<MedalRow>);

        const gridElement = getGridElement(api)! as HTMLElement;
        const getCell = async (colId: keyof MedalRow) => {
            api.ensureColumnVisible(colId);
            await asyncSetTimeout(0);
            return getByTestId(gridElement, agTestIdFor.cell('0', colId));
        };

        const user = userEvent.setup();

        // Start batch editing
        api.startBatchEdit();
        expect(api.isBatchEditing()).toBe(true);

        // Edit gold cell: 1 -> 100
        const goldCell = await getCell('gold');
        await user.dblClick(goldCell);
        await user.keyboard('100');
        expect(goldCell.querySelector('input')?.value).toBe('100');

        // Tab to silver cell - this triggers mid-batch stop with keepEdits=true
        await user.keyboard('{Tab}');

        // CRITICAL: Gold cell should still show the pending value (100), not the original (1)
        // This verifies keepEdits preserves the pending value in the model
        expect(goldCell).toHaveTextContent('100');
        expect(goldCell).toHaveClass('ag-cell-batch-edit');

        // Silver cell should now be editing
        const silverCell = await getCell('silver');
        expect(api.getCellEditorInstances()).toHaveLength(1);
        expect(silverCell.querySelector('input')).toBeTruthy();

        // Edit silver cell: 2 -> 200
        await user.keyboard('200');
        expect(silverCell.querySelector('input')?.value).toBe('200');

        // Tab to bronze cell
        await user.keyboard('{Tab}');

        // Both gold AND silver should still show their pending values
        expect(goldCell).toHaveTextContent('100');
        expect(goldCell).toHaveClass('ag-cell-batch-edit');
        expect(silverCell).toHaveTextContent('200');
        expect(silverCell).toHaveClass('ag-cell-batch-edit');

        // Total should reflect all pending values (100 + 200 + 3 = 303)
        const totalCell = await getCell('total');
        expect(totalCell).toHaveTextContent('303');

        // Edit bronze cell: 3 -> 300
        const bronzeCell = await getCell('bronze');
        await user.keyboard('300');
        await user.keyboard('{Enter}');

        // All three cells should show pending values
        expect(goldCell).toHaveTextContent('100');
        expect(silverCell).toHaveTextContent('200');
        expect(bronzeCell).toHaveTextContent('300');

        // Total should be 100 + 200 + 300 = 600
        expect(totalCell).toHaveTextContent('600');

        // Verify getEditRowValues returns all pending values
        const rowNode = api.getRowNode('0')!;
        const editValues = api.getEditRowValues(rowNode);
        expect(editValues).toEqual(expect.objectContaining({ gold: 100, silver: 200, bronze: 300 }));

        // Commit the batch
        api.commitBatchEdit();

        // Verify data is committed
        expect(rowNode.data).toEqual(expect.objectContaining({ gold: 100, silver: 200, bronze: 300 }));
    });

    test('api.stopEditing() in batch mode preserves pending values (keepEdits)', async () => {
        // This test verifies that calling api.stopEditing() programmatically during batch editing
        // stops the current editor but preserves the pending value in the model (keepEdits=true).
        // This is different from commitBatchEdit/cancelBatchEdit which use forceStop/forceCancel.
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
        ];

        const api = await gridsManager.createGridAndWait('keepEditsApiTest', {
            columnDefs: [
                { field: 'athlete' },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                {
                    field: 'total',
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
            defaultColDef: {
                editable: true,
                flex: 1,
            },
        } satisfies GridOptions<MedalRow>);

        const gridElement = getGridElement(api)! as HTMLElement;
        const getCell = async (colId: keyof MedalRow) => {
            api.ensureColumnVisible(colId);
            await asyncSetTimeout(0);
            return getByTestId(gridElement, agTestIdFor.cell('0', colId));
        };

        const user = userEvent.setup();

        // Start batch editing
        api.startBatchEdit();
        expect(api.isBatchEditing()).toBe(true);

        // Edit gold cell: 1 -> 100
        const goldCell = await getCell('gold');
        await user.dblClick(goldCell);
        await user.keyboard('100');
        expect(goldCell.querySelector('input')?.value).toBe('100');

        // Call api.stopEditing() - this should stop the editor but KEEP the pending value
        // This is the keepEdits=true scenario: batch mode + source='api' + no forceStop/forceCancel
        api.stopEditing();

        // Editor should be closed
        expect(api.getCellEditorInstances()).toHaveLength(0);

        // CRITICAL: The pending value should still be preserved in the model
        // and displayed in the cell (this is what keepEdits=true does)
        expect(goldCell).toHaveTextContent('100');
        expect(goldCell).toHaveClass('ag-cell-batch-edit');

        // Batch editing should still be active
        expect(api.isBatchEditing()).toBe(true);

        // getEditRowValues should return the pending value
        const rowNode = api.getRowNode('0')!;
        const editValues = api.getEditRowValues(rowNode);
        expect(editValues).toEqual(expect.objectContaining({ gold: 100 }));

        // Total should reflect the pending value
        const totalCell = await getCell('total');
        expect(totalCell).toHaveTextContent('105'); // 100 + 2 + 3

        // Edit another cell to verify batch continues normally
        const silverCell = await getCell('silver');
        await user.dblClick(silverCell);
        await user.keyboard('200');
        api.stopEditing();

        // Both pending values should be preserved
        expect(goldCell).toHaveTextContent('100');
        expect(silverCell).toHaveTextContent('200');
        expect(totalCell).toHaveTextContent('303'); // 100 + 200 + 3

        // Commit the batch
        api.commitBatchEdit();

        // Verify data is committed
        expect(rowNode.data).toEqual(expect.objectContaining({ gold: 100, silver: 200 }));
    });

    test('api.stopEditing(true) in batch mode cancels current edit but preserves other pending values', async () => {
        // This test verifies that calling api.stopEditing(true) (cancel=true) during batch editing:
        // 1. Cancels the CURRENT editor (reverts that cell to its source value)
        // 2. Preserves OTHER pending values that were already committed to the model
        // This is the expected behavior: cancel applies to the current editor, not the whole batch.
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
        ];

        const api = await gridsManager.createGridAndWait('cancelCurrentEditTest', {
            columnDefs: [
                { field: 'athlete' },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                {
                    field: 'total',
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
            defaultColDef: {
                editable: true,
                flex: 1,
            },
        } satisfies GridOptions<MedalRow>);

        const gridElement = getGridElement(api)! as HTMLElement;
        const getCell = async (colId: keyof MedalRow) => {
            api.ensureColumnVisible(colId);
            await asyncSetTimeout(0);
            return getByTestId(gridElement, agTestIdFor.cell('0', colId));
        };

        const user = userEvent.setup();

        // Start batch editing
        api.startBatchEdit();
        expect(api.isBatchEditing()).toBe(true);

        // Edit gold cell: 1 -> 100, then stop (commit to pending)
        const goldCell = await getCell('gold');
        await user.dblClick(goldCell);
        await user.keyboard('100');
        api.stopEditing(); // This commits gold=100 to pending

        // Verify gold is pending
        expect(goldCell).toHaveTextContent('100');
        expect(goldCell).toHaveClass('ag-cell-batch-edit');

        // Now edit silver cell: 2 -> 200
        const silverCell = await getCell('silver');
        await user.dblClick(silverCell);
        await user.keyboard('200');
        expect(silverCell.querySelector('input')?.value).toBe('200');

        // Call api.stopEditing(true) to CANCEL the current silver edit
        // This should revert silver but keep gold's pending value
        api.stopEditing(true);

        // Editor should be closed
        expect(api.getCellEditorInstances()).toHaveLength(0);

        // Gold should STILL have its pending value (100)
        expect(goldCell).toHaveTextContent('100');
        expect(goldCell).toHaveClass('ag-cell-batch-edit');

        // Silver should be reverted to original value (2) - no pending class
        expect(silverCell).toHaveTextContent('2');
        expect(silverCell).not.toHaveClass('ag-cell-batch-edit');

        // Batch editing should still be active
        expect(api.isBatchEditing()).toBe(true);

        // getEditRowValues should return only gold's pending value
        // Note: getEditRowValues returns merged data (original + pending), so silver will be 2 (original)
        const rowNode = api.getRowNode('0')!;
        const editValues = api.getEditRowValues(rowNode);
        expect(editValues).toEqual(expect.objectContaining({ gold: 100, silver: 2 })); // silver is original, not pending
        // Verify silver doesn't have pending class (it was cancelled)
        expect(silverCell).not.toHaveClass('ag-cell-batch-edit');

        // Total should reflect gold=100 + silver=2 (original) + bronze=3 = 105
        const totalCell = await getCell('total');
        expect(totalCell).toHaveTextContent('105');

        // Now edit bronze: 3 -> 300, stop normally
        const bronzeCell = await getCell('bronze');
        await user.dblClick(bronzeCell);
        await user.keyboard('300');
        api.stopEditing(); // Commit bronze=300 to pending

        // Verify: gold=100 (pending), silver=2 (original), bronze=300 (pending)
        expect(goldCell).toHaveTextContent('100');
        expect(goldCell).toHaveClass('ag-cell-batch-edit');
        expect(silverCell).toHaveTextContent('2');
        expect(silverCell).not.toHaveClass('ag-cell-batch-edit');
        expect(bronzeCell).toHaveTextContent('300');
        expect(bronzeCell).toHaveClass('ag-cell-batch-edit');

        // Total = 100 + 2 + 300 = 402
        expect(totalCell).toHaveTextContent('402');

        // Commit the batch
        api.commitBatchEdit();

        // Verify data: gold and bronze committed, silver unchanged
        expect(rowNode.data).toEqual(expect.objectContaining({ gold: 100, silver: 2, bronze: 300 }));
    });
});
