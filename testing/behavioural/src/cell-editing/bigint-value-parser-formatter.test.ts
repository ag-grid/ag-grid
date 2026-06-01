import { userEvent } from '@testing-library/user-event';

import { ClientSideRowModelModule, TextEditorModule, getGridElement } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager, waitForEvent, waitForInput } from '../test-utils';

describe('BigInt value parser and formatter', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextEditorModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('parses bigint editor input', async () => {
        const api = gridMgr.createGrid('bigint-parser', {
            columnDefs: [{ field: 'value', cellDataType: 'bigint', editable: true }],
            rowData: [{ id: 'r1', value: 10n }],
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(api, `parses bigint editor input setup`).checkColumns(`
            CENTER
            └── value "Value" width:200 editable
        `);
        await new GridRows(api, `parses bigint editor input setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 value:"10n"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = gridDiv.querySelector<HTMLElement>('[row-index="0"] [col-id="value"]')!;

        const editingStarted = waitForEvent('cellEditingStarted', api);
        api.startEditingCell({ rowIndex: 0, colKey: 'value' });
        await editingStarted;

        const input = await waitForInput(gridDiv, cell);
        const user = userEvent.setup();
        await user.clear(input);
        await user.type(input, '500n');

        const editingStopped = waitForEvent('cellEditingStopped', api);
        api.stopEditing();
        await editingStopped;

        const rowNode = api.getRowNode('r1')!;
        expect(rowNode.data.value).toBe(500n);
        await new GridRows(api, `parses bigint editor input final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 value:"500n"
        `);
    });

    test('uses valueFormatter for bigint display', async () => {
        const api = gridMgr.createGrid('bigint-formatter', {
            columnDefs: [
                {
                    field: 'value',
                    cellDataType: 'bigint',
                    valueFormatter: (params) => (params.value == null ? '' : `formatted-${params.value}`),
                },
            ],
            rowData: [{ id: 'r1', value: 12n }],
            getRowId: (params) => params.data?.id,
        });

        await new GridRows(api, 'bigint formatted').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 value:"formatted-12"
        `);
    });
});
