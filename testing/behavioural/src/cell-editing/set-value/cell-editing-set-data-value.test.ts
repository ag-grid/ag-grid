import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';

import { EditEventTracker, GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../../test-utils';

describe('Cell Editing: setDataValue sources', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test.each(['rangeSvc', 'cellClear', 'redo', 'undo'] as const)(
        'setDataValue source %s only updates once',
        async (source) => {
            let valueSetterCalls = 0;
            const valueSetterTargets: string[] = [];
            const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
                valueSetterCalls += 1;
                valueSetterTargets.push(data.id);
                data.field = newValue;
                return true;
            };

            const api = await gridMgr.createGridAndWait(`cellEditingSetDataValue-${source}`, {
                columnDefs: [
                    {
                        field: 'field',
                        editable: true,
                        valueSetter,
                    },
                ],
                rowData: [{ id: 'ROW_0', field: 'Initial Value' }],
                getRowId: (params) => params.data.id,
            });
            const eventTracker = new EditEventTracker(api);

            const beforeRows = new GridRows(api, `before ${source} setDataValue`);
            await beforeRows.check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 field:"Initial Value"
            `);

            const rowNode = api.getDisplayedRowAtIndex(0);
            rowNode?.setDataValue('field', `${source}-value`, source);
            await asyncSetTimeout(0);

            const afterRows = new GridRows(api, `after ${source} setDataValue`);
            await afterRows.check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 field:"${source}-value"
            `);

            expect(eventTracker.counts).toEqual({
                cellEditingStarted: 0,
                cellEditingStopped: source === 'cellClear' ? 1 : 0,
                cellValueChanged: 1,
                rowValueChanged: 0,
                cellEditRequest: 0,
                bulkEditingStarted: 0,
                bulkEditingStopped: 0,
            });

            expect(valueSetterTargets).toEqual(['ROW_0']);
            expect(valueSetterCalls).toBe(1);
        }
    );

    test('setDataValue without source updates once', async () => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
            valueSetterCalls += 1;
            valueSetterTargets.push(data.id);
            data.field = newValue;
            return true;
        };

        const api = await gridMgr.createGridAndWait('cellEditingSetDataValue-default', {
            columnDefs: [
                {
                    field: 'field',
                    editable: true,
                    valueSetter,
                },
            ],
            rowData: [{ id: 'ROW_0', field: 'Initial Value' }],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const beforeRows = new GridRows(api, 'before default setDataValue');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Initial Value"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0);
        rowNode?.setDataValue('field', 'default-value');
        await asyncSetTimeout(0);

        const afterRows = new GridRows(api, 'after default setDataValue');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"default-value"
        `);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
        });

        expect(api.getDisplayedRowAtIndex(0)?.data?.field).toBe('default-value');
        expect(valueSetterTargets).toEqual(['ROW_0']);
        expect(valueSetterCalls).toBe(1);
    });

    test('setDataValue paste source updates once when not editing', async () => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
            valueSetterCalls += 1;
            valueSetterTargets.push(data.id);
            data.field = newValue;
            return true;
        };

        const api = await gridMgr.createGridAndWait('cellEditingSetDataValue-paste', {
            columnDefs: [
                {
                    field: 'field',
                    editable: true,
                    valueSetter,
                },
            ],
            rowData: [{ id: 'ROW_0', field: 'Initial Value' }],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const beforeRows = new GridRows(api, 'before paste setDataValue');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Initial Value"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0);
        rowNode?.setDataValue('field', 'paste-value', 'paste');
        await asyncSetTimeout(0);

        const afterRows = new GridRows(api, 'after paste setDataValue');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"paste-value"
        `);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
        });

        expect(api.getDisplayedRowAtIndex(0)?.data?.field).toBe('paste-value');
        expect(valueSetterTargets).toEqual(['ROW_0']);
        expect(valueSetterCalls).toBe(1);
    });

    test('readOnlyEdit setDataValue fires cellEditRequest and does not update', async () => {
        let valueSetterCalls = 0;
        const editRequests: string[] = [];
        const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
            valueSetterCalls += 1;
            data.field = newValue;
            return true;
        };

        const api = await gridMgr.createGridAndWait('cellEditingSetDataValue-readOnly', {
            readOnlyEdit: true,
            columnDefs: [
                {
                    field: 'field',
                    editable: true,
                    valueSetter,
                },
            ],
            rowData: [{ id: 'ROW_0', field: 'Initial Value' }],
            getRowId: (params) => params.data.id,
            onCellEditRequest: (event) => {
                editRequests.push(`${event.node?.id ?? 'unknown'}:${event.colDef.field}:${event.newValue}`);
            },
        });
        const eventTracker = new EditEventTracker(api);

        const beforeRows = new GridRows(api, 'before readOnly setDataValue');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Initial Value"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0);
        rowNode?.setDataValue('field', 'readOnly-value', 'ui');
        await asyncSetTimeout(0);

        const afterRows = new GridRows(api, 'after readOnly setDataValue');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Initial Value"
        `);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 0,
            rowValueChanged: 0,
            cellEditRequest: 1,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
        });

        expect(api.getDisplayedRowAtIndex(0)?.data?.field).toBe('Initial Value');
        expect(valueSetterCalls).toBe(0);
        expect(editRequests).toEqual(['ROW_0:field:readOnly-value']);
    });

    test('setDataValue during edit commits and stops editing', async () => {
        let valueSetterCalls = 0;
        const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
            valueSetterCalls += 1;
            data.field = newValue;
            return true;
        };

        const api = await gridMgr.createGridAndWait('cellEditingSetDataValue-editing', {
            columnDefs: [
                {
                    field: 'field',
                    editable: true,
                    valueSetter,
                },
            ],
            rowData: [{ id: 'ROW_0', field: 'Initial Value' }],
            getRowId: (params) => params.data.id,
        });

        const beforeRows = new GridRows(api, 'before editing setDataValue');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Initial Value"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'field'));
        await userEvent.click(cell);
        api.startEditingCell({ rowIndex: 0, colKey: 'field' });
        const input = await waitForInput(gridDiv, cell);
        await userEvent.clear(input);
        await userEvent.type(input, 'Editor Value');

        const rowNode = api.getDisplayedRowAtIndex(0);
        rowNode?.setDataValue('field', 'Committed Value', 'ui');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after editing setDataValue ui').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Editor Value"
        `);

        rowNode?.setDataValue('field', 'Committed Value', 'api');
        await asyncSetTimeout(0);

        await new GridRows(api, 'after editing setDataValue api').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 field:"Committed Value"
        `);

        expect(valueSetterCalls).toBe(2);
    });
});
