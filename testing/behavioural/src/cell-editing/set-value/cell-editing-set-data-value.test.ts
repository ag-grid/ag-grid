import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { RenderApiModule, TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';

import {
    EditEventTracker,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    waitForInput,
} from '../../test-utils';

describe('Cell Editing: setDataValue', () => {
    const gridMgr = new TestGridsManager({
        modules: [RenderApiModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    describe('basic behavior', () => {
        test.each(['paste', 'rangeSvc', 'cellClear', 'undo', 'redo'] as const)(
            "'%s' source updates data once with correct events",
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

                // Verify data access methods
                expect(rowNode?.data?.field).toBe(`${source}-value`);
                expect(rowNode?.getDataValue('field')).toBe(`${source}-value`);
                expect(api.getCellValue({ rowNode: rowNode!, colKey: 'field' })).toBe(`${source}-value`);
                expect(api.getCellValue({ rowNode: rowNode!, colKey: 'field', from: 'data' })).toBe(`${source}-value`);

                expect(eventTracker.counts).toEqual({
                    cellEditingStarted: 0,
                    cellEditingStopped: 0,
                    cellValueChanged: 1,
                    rowValueChanged: 0,
                    cellEditRequest: 0,
                    bulkEditingStarted: 0,
                    bulkEditingStopped: 0,
                    batchEditingStarted: 0,
                    batchEditingStopped: 0,
                });

                expect(valueSetterTargets).toEqual(['ROW_0']);
                expect(valueSetterCalls).toBe(1);

                await new GridColumns(api, 'columns').checkColumns(`
                    CENTER
                    └── field "Field" width:200 editable
                `);
            }
        );

        test.each([undefined, 'ui', 'api', 'edit', 'data', 'batch'] as const)(
            "'%s' source updates data directly",
            async (source) => {
                let valueSetterCalls = 0;
                const valueSetterTargets: string[] = [];
                const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
                    valueSetterCalls += 1;
                    valueSetterTargets.push(data.id);
                    data.field = newValue;
                    return true;
                };

                const api = await gridMgr.createGridAndWait(`cellEditingSetDataValue-${source ?? 'default'}`, {
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

                const beforeRows = new GridRows(api, `before ${source ?? 'default'} setDataValue`);
                await beforeRows.check(`
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:ROW_0 field:"Initial Value"
                `);

                const rowNode = api.getDisplayedRowAtIndex(0);
                rowNode?.setDataValue('field', `${source ?? 'default'}-value`, source);
                await asyncSetTimeout(0);

                const afterRows = new GridRows(api, `after ${source ?? 'default'} setDataValue`);
                await afterRows.check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 field:"${source ?? 'default'}-value"
            `);

                // Verify data access methods
                expect(rowNode?.data?.field).toBe(`${source ?? 'default'}-value`);
                expect(rowNode?.getDataValue('field')).toBe(`${source ?? 'default'}-value`);
                expect(api.getCellValue({ rowNode: rowNode!, colKey: 'field' })).toBe(`${source ?? 'default'}-value`);
                expect(api.getCellValue({ rowNode: rowNode!, colKey: 'field', from: 'data' })).toBe(
                    `${source ?? 'default'}-value`
                );

                expect(eventTracker.counts).toEqual({
                    cellEditingStarted: 0,
                    cellEditingStopped: 0,
                    cellValueChanged: 1,
                    rowValueChanged: 0,
                    cellEditRequest: 0,
                    bulkEditingStarted: 0,
                    bulkEditingStopped: 0,
                    batchEditingStarted: 0,
                    batchEditingStopped: 0,
                });
                expect(valueSetterTargets).toEqual(['ROW_0']);
                expect(valueSetterCalls).toBe(1);

                await new GridColumns(api, 'columns').checkColumns(`
                    CENTER
                    └── field "Field" width:200 editable
                `);
            }
        );
    });

    describe('readOnlyEdit mode', () => {
        test('setDataValue fires cellEditRequest and does not update', async () => {
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
                batchEditingStarted: 0,
                batchEditingStopped: 0,
            });

            // Verify data access methods - all should return original value
            expect(rowNode?.data?.field).toBe('Initial Value');
            expect(rowNode?.getDataValue('field')).toBe('Initial Value');
            expect(api.getCellValue({ rowNode: rowNode!, colKey: 'field' })).toBe('Initial Value');
            expect(api.getCellValue({ rowNode: rowNode!, colKey: 'field', from: 'data' })).toBe('Initial Value');

            expect(valueSetterCalls).toBe(0);
            expect(editRequests).toEqual(['ROW_0:field:readOnly-value']);
        });
    });

    describe('during active editing', () => {
        test('setDataValue commits and stops editing', async () => {
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
            await asyncSetTimeout(5);
            const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'field'));
            await userEvent.click(cell);
            await asyncSetTimeout(3);
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

            // Verify data access methods after final commit
            expect(rowNode?.data?.field).toBe('Committed Value');
            expect(rowNode?.getDataValue('field')).toBe('Committed Value');
            expect(api.getCellValue({ rowNode: rowNode!, colKey: 'field' })).toBe('Committed Value');
            expect(api.getCellValue({ rowNode: rowNode!, colKey: 'field', from: 'data' })).toBe('Committed Value');

            expect(valueSetterCalls).toBe(2);
        });

        test.each(['data', 'batch'] as const)(
            "'%s' writes directly to data even when editor is open",
            async (source) => {
                let valueSetterCalls = 0;
                const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
                    valueSetterCalls += 1;
                    data.field = newValue;
                    return true;
                };

                const api = await gridMgr.createGridAndWait(`cellEditingSetDataValue-${source}-editing`, {
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

                const gridDiv = getGridElement(api)! as HTMLElement;
                await asyncSetTimeout(5);
                const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'field'));
                await userEvent.click(cell);
                await asyncSetTimeout(3);
                api.startEditingCell({ rowIndex: 0, colKey: 'field' });
                const input = await waitForInput(gridDiv, cell);
                await userEvent.clear(input);
                await userEvent.type(input, 'Editor Value');

                const rowNode = api.getDisplayedRowAtIndex(0)!;
                rowNode.setDataValue('field', 'Direct Value', source);
                await asyncSetTimeout(0);

                // 'data' and 'batch' (when not in batch mode) bypass the editor and write directly to data
                expect(rowNode.data.field).toBe('Direct Value');
                expect(rowNode.getDataValue('field')).toBe('Direct Value');
                expect(api.getCellValue({ rowNode, colKey: 'field', from: 'data' })).toBe('Direct Value');

                expect(valueSetterCalls).toBe(1);
            }
        );
    });
});
