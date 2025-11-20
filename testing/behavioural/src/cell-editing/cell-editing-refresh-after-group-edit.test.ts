import { userEvent } from '@testing-library/user-event';

import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { BatchEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';

describe('cell editing with refreshAfterGroupEdit', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, BatchEditModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('editing a row group column moves the row into the matching group', async () => {
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [{ field: 'group', rowGroup: true, editable: true }, { field: 'value' }],
            rowData: [
                { id: '1', group: 'A', value: 'A1' },
                { id: '2', group: 'A', value: 'A2' },
                { id: '3', group: 'B', value: 'B1' },
            ],
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: 1,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('cell-edit-refresh-group', gridOptions);

        const snapshot = () => {
            const order: string[] = [];
            api.forEachNodeAfterFilterAndSort((node) => {
                order.push(node.group ? `GROUP:${node.key}` : `ROW:${node.id}`);
            });
            return order;
        };

        expect(snapshot()).toEqual(['GROUP:A', 'ROW:1', 'ROW:2', 'GROUP:B', 'ROW:3']);

        const rowNode = api.getRowNode('2');
        expect(rowNode).toBeDefined();
        rowNode!.setDataValue('group', 'B');

        await asyncSetTimeout(2);

        // Note - we are following _leafs order after the refresh
        expect(snapshot()).toEqual(['GROUP:A', 'ROW:1', 'GROUP:B', 'ROW:2', 'ROW:3']);

        expect(api.getRowNode('2')?.parent?.key).toBe('B');
        expect(api.getRowNode('1')?.parent?.key).toBe('A');
    });

    test('batch editing grouped column refreshes model once', async () => {
        const modelUpdatedEvents: any[] = [];
        const batchStoppedEvents: any[] = [];
        const gridOptions: GridOptions = {
            animateRows: true,
            columnDefs: [{ field: 'group', rowGroup: true, editable: true }, { field: 'value' }],
            rowData: [
                { id: '1', group: 'A', value: 'A1' },
                { id: '2', group: 'A', value: 'A2' },
                { id: '3', group: 'B', value: 'B1' },
            ],
            refreshAfterGroupEdit: true,
            groupDefaultExpanded: 1,
            getRowId: (params) => params.data.id,
            onBatchEditingStopped: (event) => {
                batchStoppedEvents.push(event);
            },
            onModelUpdated: (event) => {
                modelUpdatedEvents.push(event);
            },
        };

        const api = gridsManager.createGrid('cell-edit-refresh-group-batch', gridOptions);

        await asyncSetTimeout(0);

        modelUpdatedEvents.length = 0;
        batchStoppedEvents.length = 0;

        const initialRows = new GridRows(api, 'initial', {
            checkDom: true,
            columns: ['value'],
            nodeDataProps: ['group'],
        });
        await initialRows.check(`
            ROOT id:ROOT_NODE_ID data.group:""
            ├─┬ LEAF_GROUP id:row-group-group-A data.group:""
            │ ├── LEAF id:1 value:"A1" data.group:"A"
            │ └── LEAF id:2 value:"A2" data.group:"A"
            └─┬ LEAF_GROUP id:row-group-group-B data.group:""
            · └── LEAF id:3 value:"B1" data.group:"B"
        `);

        api.startBatchEdit();
        expect(api.isBatchEditing()).toBe(true);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const editGroupCell = async (rowId: string, value: string) => {
            const cell = gridDiv.querySelector<HTMLElement>(`[row-id="${rowId}"] [col-id="group"]`);
            expect(cell).not.toBeNull();

            await userEvent.dblClick(cell!);
            const input = await waitForInput(gridDiv, cell!);
            await userEvent.clear(input);
            await userEvent.type(input, `${value}{Enter}`);
            await asyncSetTimeout(0);
        };

        await editGroupCell('2', 'B');
        await editGroupCell('3', 'A');

        expect(modelUpdatedEvents).toHaveLength(0);

        api.commitBatchEdit();
        expect(api.isBatchEditing()).toBe(false);

        for (let i = 0; i < 10 && batchStoppedEvents.length === 0; i += 1) {
            await asyncSetTimeout(5);
        }

        for (let i = 0; i < 10 && modelUpdatedEvents.length === 0; i += 1) {
            await asyncSetTimeout(5);
        }

        expect(api.getRowNode('2')?.data.group).toBe('B');
        expect(api.getRowNode('3')?.data.group).toBe('A');

        expect(batchStoppedEvents).toHaveLength(1);
        expect(modelUpdatedEvents).toHaveLength(1);

        const finalRows = new GridRows(api, 'after commit', {
            checkDom: true,
            columns: ['value'],
            nodeDataProps: ['group'],
        });
        await finalRows.check(`
            ROOT id:ROOT_NODE_ID data.group:""
            ├─┬ LEAF_GROUP id:row-group-group-A data.group:""
            │ ├── LEAF id:1 value:"A1" data.group:"A"
            │ └── LEAF id:3 value:"B1" data.group:"A"
            └─┬ LEAF_GROUP id:row-group-group-B data.group:""
            · └── LEAF id:2 value:"A2" data.group:"B"
        `);

        expect(api.getRowNode('2')?.parent?.key).toBe('B');
        expect(api.getRowNode('3')?.parent?.key).toBe('A');
    });
});
