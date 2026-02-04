import type { GridOptions, ValueParserParams } from 'ag-grid-community';

import { expect } from '../../test-utils/matchers';
import type {
    ColDefInternal,
    EditableCallback,
    GroupRowEditableCallback,
    GroupRowValueSetterCallback,
    ValueParserCallback,
    ValueSetterCallback,
} from './group-edit-test-utils';
import {
    EDIT_MODES,
    asyncSetTimeout,
    callsForRowNode,
    editCell,
    getGroupColumnDisplayValue,
    gridsManager,
} from './group-edit-test-utils';

afterEach(() => {
    gridsManager.reset();
});

describe.each(EDIT_MODES)('groupRowEditable behaviour (%s)', (editMode) => {
    test('row grouping group rows only invoke groupRowEditable', async () => {
        const groupRowEditableCalls: Parameters<GroupRowEditableCallback>[] = [];
        const groupRowEditable: GroupRowEditableCallback = (...args) => {
            groupRowEditableCalls.push(args);
            return true;
        };
        const editableCalls: Parameters<EditableCallback>[] = [];
        const editable: EditableCallback = (...args) => {
            editableCalls.push(args);
            return true;
        };
        const committedValues = new Map<string, string>();
        const valueSetterCalls: Parameters<ValueSetterCallback>[] = [];
        const valueSetter: ValueSetterCallback = (params) => {
            valueSetterCalls.push([params]);
            if (params.node?.id) {
                committedValues.set(params.node.id, params.newValue);
            }
            if (params.data && params.colDef.field) {
                (params.data as Record<string, any>)[params.colDef.field] = params.newValue;
            } else if (params.node?.groupData) {
                params.node.groupData.group = params.newValue;
            }
            return true;
        };

        const gridOptions: GridOptions = {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            undoRedoCellEditing: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    field: 'label',
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: {
                        suppressCount: true,
                    },
                    editable,
                    groupRowEditable,
                    valueSetter,
                } as ColDefInternal,
                { field: 'category', rowGroup: true, hide: true },
            ],
            rowData: [
                { id: 'a-1', category: 'A', label: 'A1' },
                { id: 'a-2', category: 'A', label: 'A2' },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = await gridsManager.createGridAndWait('row-group-groupRowEditable', gridOptions);

        const groupRowNode = api.getDisplayedRowAtIndex(0);
        expect(groupRowNode).toBeDefined();
        expect(groupRowNode!.group).toBe(true);
        expect(groupRowNode!.data).toBeUndefined();
        const originalGroupValue = getGroupColumnDisplayValue(groupRowNode!);

        groupRowEditableCalls.length = 0;
        editableCalls.length = 0;
        valueSetterCalls.length = 0;
        const groupColumn = api.getDisplayedCenterColumns()[0]!;
        expect((groupColumn.getColDef() as ColDefInternal).groupRowEditable).toBe(groupRowEditable);
        expect(groupColumn.isCellEditable(groupRowNode!)).toBe(true);
        const groupColId = groupColumn.getColId();
        if (editMode === 'ui') {
            await editCell(api, groupRowNode!, groupColId, 'Edited Group');
        } else {
            groupRowNode!.setDataValue(groupColId, 'Edited Group', 'ui');
            await asyncSetTimeout(0);
        }
        expect(groupRowNode!.data).toBeUndefined();

        const groupRowEditableCallsForGroup = callsForRowNode(groupRowEditableCalls, groupRowNode!.id);
        const editableCallsForGroup = callsForRowNode(editableCalls, groupRowNode!.id);
        if (editMode === 'ui') {
            expect(groupRowEditableCallsForGroup.length).toBeGreaterThan(0);
        }
        expect(editableCallsForGroup.length).toBe(0);

        if (editMode === 'ui') {
            api.undoCellEditing();
            await asyncSetTimeout(0);
            expect(getGroupColumnDisplayValue(groupRowNode!)).toBe(originalGroupValue);
            expect(groupRowNode!.data).toBeUndefined();
            expect(committedValues.get(groupRowNode!.id!)).toBe(originalGroupValue);
        }

        const leafRowNode = api.getRowNode('a-1');
        expect(leafRowNode).toBeDefined();
        const originalLeafLabel = leafRowNode!.data!.label;

        groupRowEditableCalls.length = 0;
        editableCalls.length = 0;
        valueSetterCalls.length = 0;
        if (editMode === 'ui') {
            await editCell(api, leafRowNode!, groupColId, 'Edited Leaf');
        } else {
            leafRowNode!.setDataValue(groupColId, 'Edited Leaf', 'ui');
            await asyncSetTimeout(0);
        }
        expect(leafRowNode!.data!.label).toBe('Edited Leaf');

        const groupRowEditableCallsForLeaf = callsForRowNode(groupRowEditableCalls, leafRowNode!.id);
        expect(groupRowEditableCallsForLeaf.length).toBe(0);
        const editableCallsForLeaf = callsForRowNode(editableCalls, leafRowNode!.id);
        if (editMode === 'ui') {
            expect(editableCallsForLeaf.length).toBeGreaterThan(0);
        }
        const valueSetterCallsForLeaf = callsForRowNode(valueSetterCalls, leafRowNode!.id);
        expect(valueSetterCallsForLeaf.length).toBeGreaterThan(0);
        expect(committedValues.get('a-1')).toBe('Edited Leaf');
        if (editMode === 'ui') {
            api.undoCellEditing();
            await asyncSetTimeout(0);
            expect(leafRowNode!.data!.label).toBe(originalLeafLabel);
            expect(committedValues.get('a-1')).toBe(originalLeafLabel);
        }
    });

    test('group row edits run valueParser before valueSetter', async () => {
        const parserCalls: ValueParserParams<any, any, any>[] = [];
        const parserOutputs: string[] = [];
        const valueParser: ValueParserCallback = (params) => {
            parserCalls.push(params);
            const parsed = String(params.newValue ?? '')
                .trim()
                .toUpperCase();
            parserOutputs.push(parsed);
            return parsed;
        };
        const valueSetterValues: string[] = [];
        const valueSetter: ValueSetterCallback = (params) => {
            if (typeof params.newValue === 'string') {
                valueSetterValues.push(params.newValue);
            }
            if (params.data && params.colDef.field) {
                (params.data as Record<string, any>)[params.colDef.field] = params.newValue;
            } else if (params.node?.groupData) {
                params.node.groupData.group = params.newValue as string;
            }
            return true;
        };

        const gridOptions: GridOptions = {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            undoRedoCellEditing: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    field: 'label',
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: {
                        suppressCount: true,
                    },
                    editable: true,
                    groupRowEditable: true,
                    valueParser,
                    valueSetter,
                } as ColDefInternal,
                { field: 'category', rowGroup: true, hide: true },
            ],
            rowData: [
                { id: 'a-1', category: 'A', label: 'A1' },
                { id: 'a-2', category: 'A', label: 'A2' },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        };

        const api = await gridsManager.createGridAndWait('row-group-valueParser', gridOptions);

        const groupRowNode = api.getDisplayedRowAtIndex(0);
        expect(groupRowNode).toBeDefined();
        const groupColumn = api.getDisplayedCenterColumns()[0]!;
        const groupColId = groupColumn.getColId();
        const rawInput = '   parsed group   ';
        const expectedParsed = 'PARSED GROUP';

        parserCalls.length = 0;
        parserOutputs.length = 0;
        valueSetterValues.length = 0;

        if (editMode === 'ui') {
            await editCell(api, groupRowNode!, groupColId, rawInput);
            expect(parserCalls.length).toBeGreaterThan(0);
            expect(parserOutputs[parserOutputs.length - 1]).toBe(expectedParsed);
        } else {
            groupRowNode!.setDataValue(groupColId, rawInput, 'ui');
            await asyncSetTimeout(0);
            expect(parserCalls.length).toBe(0);
        }
    });

    test('tree data filler rows only invoke groupRowEditable', async () => {
        const editableCalls: Parameters<EditableCallback>[] = [];
        const editable: EditableCallback = (...args) => {
            editableCalls.push(args);
            return true;
        };
        const groupRowEditableCalls: Parameters<GroupRowEditableCallback>[] = [];
        const groupRowEditable: GroupRowEditableCallback = (...args) => {
            groupRowEditableCalls.push(args);
            return true;
        };
        const valueSetterCalls: Parameters<ValueSetterCallback>[] = [];
        const valueSetter: ValueSetterCallback = (params) => {
            valueSetterCalls.push([params]);
            if (!params.data && params.node?.groupData) {
                params.node.groupData.group = params.newValue;
            }
            return true;
        };

        const api = await gridsManager.createGridAndWait('tree-data-filler-groupRowEditable', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            undoRedoCellEditing: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    field: 'label',
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: {
                        suppressCount: true,
                    },
                    editable,
                    groupRowEditable,
                    valueSetter,
                } as ColDefInternal,
            ],
            treeData: true,
            rowData: [{ id: 'mars', path: ['Solar System', 'Mars'], label: 'Mars' }],
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const fillerRowNode = api.getRowNode('row-group-0-Solar System');
        expect(fillerRowNode).toBeDefined();
        expect(fillerRowNode!.group).toBe(true);
        expect(fillerRowNode!.data).toBeUndefined();
        const originalFillerValue = getGroupColumnDisplayValue(fillerRowNode!);

        const groupColumn = api.getDisplayedCenterColumns()[0]!;
        expect((groupColumn.getColDef() as ColDefInternal).groupRowEditable).toBe(groupRowEditable);

        groupRowEditableCalls.length = 0;
        editableCalls.length = 0;
        valueSetterCalls.length = 0;
        if (editMode === 'ui') {
            await editCell(api, fillerRowNode!, 'group', 'Edited Filler');
        } else {
            fillerRowNode!.setDataValue('group', 'Edited Filler', 'ui');
            await asyncSetTimeout(0);
        }
        expect(fillerRowNode!.data).toBeUndefined();

        const groupRowEditableCallsForFiller = callsForRowNode(groupRowEditableCalls, fillerRowNode!.id);
        const editableCallsForFiller = callsForRowNode(editableCalls, fillerRowNode!.id);
        if (editMode === 'ui') {
            expect(groupRowEditableCallsForFiller.length).toBeGreaterThan(0);
        }
        expect(editableCallsForFiller.length).toBe(0);

        if (editMode === 'ui') {
            api.undoCellEditing();
            await asyncSetTimeout(0);
            expect(getGroupColumnDisplayValue(fillerRowNode!)).toBe(originalFillerValue);
            expect(fillerRowNode!.data).toBeUndefined();
        }
    });

    test('tree data group rows with data prefer groupRowEditable when defined', async () => {
        const editableCalls: Parameters<EditableCallback>[] = [];
        const editable: EditableCallback = (...args) => {
            editableCalls.push(args);
            return true;
        };
        const groupRowEditableCalls: Parameters<GroupRowEditableCallback>[] = [];
        const groupRowEditable: GroupRowEditableCallback = (...args) => {
            groupRowEditableCalls.push(args);
            return true;
        };
        const rowData = [
            { id: 'earth', path: ['Earth'], label: 'Earth label' },
            { id: 'moon', path: ['Earth', 'Moon'], label: 'Moon label' },
        ];
        const originalEarthLabel = rowData[0].label;
        const valueSetterCalls: Parameters<ValueSetterCallback>[] = [];
        const valueSetter: ValueSetterCallback = (params) => {
            valueSetterCalls.push([params]);
            if (params.data) {
                (params.data as { label?: string }).label = params.newValue;
            }
            return true;
        };

        const api = await gridsManager.createGridAndWait('tree-data-groupRowEditable', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            undoRedoCellEditing: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    field: 'label',
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: {
                        suppressCount: true,
                    },
                    editable,
                    groupRowEditable,
                    valueSetter,
                } as ColDefInternal,
            ],
            treeData: true,
            rowData,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const earthRowNode = api.getRowNode('earth');
        expect(earthRowNode).toBeDefined();

        groupRowEditableCalls.length = 0;
        editableCalls.length = 0;
        valueSetterCalls.length = 0;
        if (editMode === 'ui') {
            await editCell(api, earthRowNode!, 'group', 'Edited Earth');
        } else {
            earthRowNode!.setDataValue('group', 'Edited Earth', 'ui');
            await asyncSetTimeout(0);
        }

        const groupRowEditableCallsForEarth = callsForRowNode(groupRowEditableCalls, earthRowNode!.id);
        const editableCallsForEarth = callsForRowNode(editableCalls, earthRowNode!.id);
        if (editMode === 'ui') {
            expect(groupRowEditableCallsForEarth.length).toBeGreaterThan(0);
        }
        expect(editableCallsForEarth.length).toBe(0);
        const valueSetterCallsForEarth = callsForRowNode(valueSetterCalls, earthRowNode!.id);
        expect(valueSetterCallsForEarth.length).toBeGreaterThan(0);
        expect(rowData[0].label).toBe('Edited Earth');

        if (editMode === 'ui') {
            api.undoCellEditing();
            await asyncSetTimeout(0);
            expect(rowData[0].label).toBe(originalEarthLabel);
        }
    });

    test('tree data group rows with data fall back to editable when groupRowEditable missing', async () => {
        const editableCalls: Parameters<EditableCallback>[] = [];
        const editable: EditableCallback = (...args) => {
            editableCalls.push(args);
            return true;
        };
        const rowData = [
            { id: 'earth', path: ['Earth'], label: 'Earth label' },
            { id: 'moon', path: ['Earth', 'Moon'], label: 'Moon label' },
        ];
        const originalEarthLabel = rowData[0].label;
        const valueSetterCalls: Parameters<ValueSetterCallback>[] = [];
        const valueSetter: ValueSetterCallback = (params) => {
            valueSetterCalls.push([params]);
            if (params.data) {
                (params.data as { label?: string }).label = params.newValue;
            }
            return true;
        };

        const api = await gridsManager.createGridAndWait('tree-data-groupRowEditable-fallback', {
            enableGroupEdit: true,
            undoRedoCellEditing: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    field: 'label',
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: {
                        suppressCount: true,
                    },
                    editable,
                    valueSetter,
                },
            ],
            treeData: true,
            rowData,
            getDataPath: (data) => data.path,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const earthRowNode = api.getRowNode('earth');
        expect(earthRowNode).toBeDefined();

        editableCalls.length = 0;
        valueSetterCalls.length = 0;
        if (editMode === 'ui') {
            await editCell(api, earthRowNode!, 'group', 'Edited Earth');
        } else {
            earthRowNode!.setDataValue('group', 'Edited Earth', 'ui');
            await asyncSetTimeout(0);
        }

        const editableCallsForEarth = callsForRowNode(editableCalls, earthRowNode!.id);
        if (editMode === 'ui') {
            expect(editableCallsForEarth.length).toBeGreaterThan(0);
        }
        const valueSetterCallsForEarth = callsForRowNode(valueSetterCalls, earthRowNode!.id);
        expect(valueSetterCallsForEarth.length).toBeGreaterThan(0);
        expect(rowData[0].label).toBe('Edited Earth');

        if (editMode === 'ui') {
            api.undoCellEditing();
            await asyncSetTimeout(0);
            expect(rowData[0].label).toBe(originalEarthLabel);
        }
    });

    test('groupRowValueSetter fires even when groupRowEditable is false', async () => {
        let invocationCount = 0;
        const valueSetter: ValueSetterCallback = (params) => {
            if (params.node?.group) {
                const groupData = params.node.groupData ?? {};
                groupData.group = params.newValue;
                params.node.groupData = groupData;
            }
            return true;
        };
        const groupRowValueSetter: GroupRowValueSetterCallback = () => {
            invocationCount += 1;
        };

        const api = await gridsManager.createGridAndWait('group-row-set-value-without-editable', {
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    cellRenderer: 'agGroupCellRenderer',
                    editable: false,
                    groupRowEditable: false,
                    valueSetter,
                    groupRowValueSetter,
                } as ColDefInternal,
                { field: 'category', rowGroup: true, hide: true },
            ],
            rowData: [
                { id: 'a-1', category: 'A', label: 'A1' },
                { id: 'a-2', category: 'A', label: 'A2' },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });

        const groupRowNode = api.getDisplayedRowAtIndex(0);
        expect(groupRowNode?.group).toBe(true);
        const targetColumn = api.getColumns()?.find((col) => col.getColId() === 'group');
        expect(targetColumn).toBeDefined();

        groupRowNode!.setDataValue(targetColumn!, 'Edited Group', 'ui');
        await asyncSetTimeout(0);

        expect(invocationCount).toBe(1);
    });
});
