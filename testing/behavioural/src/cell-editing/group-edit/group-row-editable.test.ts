import { userEvent } from '@testing-library/user-event';

import type { GridOptions, ValueParserParams } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager } from '../../test-utils';
import type {
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
                },
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
        expect(groupColumn.getColDef().groupRowEditable).toBe(groupRowEditable);
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
                },
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
                },
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
        expect(groupColumn.getColDef().groupRowEditable).toBe(groupRowEditable);

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

    test('double-clicking editable group cell starts editing instead of toggling expansion', async () => {
        if (editMode !== 'ui') {
            return; // dblclick only relevant for UI mode
        }

        const api = await gridsManager.createGridAndWait('group-dblclick-edit', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                },
            ],
            autoGroupColumnDef: {
                editable: true,
                groupRowEditable: true,
                cellEditorParams: { useFormatter: true },
            },
            rowData: [
                { id: 'a-1', category: 'A', amount: 10 },
                { id: 'a-2', category: 'A', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        await asyncSetTimeout(1);

        const groupRowNode = api.getDisplayedRowAtIndex(0);
        expect(groupRowNode?.group).toBe(true);
        expect(groupRowNode?.expanded).toBe(true);

        // Double-click the amount cell — should start editing, NOT collapse
        const rowElement = gridDiv.querySelector<HTMLElement>(`[row-id="${groupRowNode!.id}"]`)!;
        const amountCell = rowElement.querySelector<HTMLElement>('[col-id="amount"]')!;
        expect(amountCell).toBeTruthy();

        await userEvent.dblClick(amountCell);
        await asyncSetTimeout(1);

        expect(groupRowNode?.expanded).toBe(true);
        expect(api.getEditingCells()).toHaveLength(1);
    });

    test('double-clicking auto group column cell with groupRowEditable starts editing instead of toggling expansion', async () => {
        if (editMode !== 'ui') {
            return;
        }

        const api = await gridsManager.createGridAndWait('group-dblclick-autogroup', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', editable: true, groupRowEditable: true },
            ],
            autoGroupColumnDef: {
                editable: true,
                groupRowEditable: true,
                cellEditorParams: { useFormatter: true },
            },
            rowData: [
                { id: 'a-1', category: 'A', amount: 10 },
                { id: 'a-2', category: 'A', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        await asyncSetTimeout(1);

        const groupRowNode = api.getDisplayedRowAtIndex(0);
        expect(groupRowNode?.group).toBe(true);
        expect(groupRowNode?.expanded).toBe(true);

        // Double-click the auto group column cell — the groupCellRenderer dblclick handler
        // should NOT toggle expansion when the cell is editable
        const rowElement = gridDiv.querySelector<HTMLElement>(`[row-id="${groupRowNode!.id}"]`)!;
        const autoGroupCell = rowElement.querySelector<HTMLElement>('[col-id="ag-Grid-AutoColumn"]')!;
        expect(autoGroupCell).toBeTruthy();

        await userEvent.dblClick(autoGroupCell);
        await asyncSetTimeout(1);

        expect(groupRowNode?.expanded).toBe(true);
        expect(api.getEditingCells()).toHaveLength(1);
    });

    test('double-clicking non-editable auto group column cell toggles expansion normally', async () => {
        if (editMode !== 'ui') {
            return;
        }

        const api = await gridsManager.createGridAndWait('group-dblclick-collapse', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum' },
            ],
            rowData: [
                { id: 'a-1', category: 'A', amount: 10 },
                { id: 'a-2', category: 'A', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        await asyncSetTimeout(1);

        const groupRowNode = api.getDisplayedRowAtIndex(0);
        expect(groupRowNode?.group).toBe(true);
        expect(groupRowNode?.expanded).toBe(true);

        const rowElement = gridDiv.querySelector<HTMLElement>(`[row-id="${groupRowNode!.id}"]`)!;
        const autoGroupCell = rowElement.querySelector<HTMLElement>('[col-id="ag-Grid-AutoColumn"]')!;
        expect(autoGroupCell).toBeTruthy();

        // Double-click on non-editable group cell should collapse
        await userEvent.dblClick(autoGroupCell);
        await asyncSetTimeout(1);

        expect(groupRowNode?.expanded).toBe(false);
        expect(api.getEditingCells()).toHaveLength(0);
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
                },
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

describe('editability based on distribution configuration', () => {
    const ROW_DATA = [
        { id: 'a-1', category: 'A', amount: 10 },
        { id: 'a-2', category: 'A', amount: 20 },
    ];

    test.each([
        // --- Suppressed (not editable) ---
        { name: 'distribution: false', aggFunc: 'sum', setter: { distribution: false }, expected: false },
        { name: 'distribution: null', aggFunc: 'sum', setter: { distribution: null }, expected: false },
        {
            name: 'per-aggFunc record { sum: false }',
            aggFunc: 'sum',
            setter: { distribution: { sum: false, avg: 'uniform' } },
            expected: false,
        },
        {
            name: 'per-aggFunc options { sum: { distribution: false } }',
            aggFunc: 'sum',
            setter: { distribution: { sum: { distribution: false } } },
            expected: false,
        },
        {
            name: 'per-aggFunc count with distribution: undefined inherits disabled-by-default',
            aggFunc: 'count',
            setter: { distribution: { count: { distribution: undefined, precision: 0 } } },
            expected: false,
        },
        {
            name: 'per-aggFunc min without distribution key inherits disabled-by-default',
            aggFunc: 'min',
            setter: { distribution: { min: { precision: 0 } } },
            expected: false,
        },
        { name: 'implicit count (no groupRowValueSetter)', aggFunc: 'count', expected: false },
        { name: 'implicit min (no groupRowValueSetter)', aggFunc: 'min', expected: false },
        { name: 'implicit max (no groupRowValueSetter)', aggFunc: 'max', expected: false },
        { name: 'implicit first (no groupRowValueSetter)', aggFunc: 'first', expected: false },
        { name: 'implicit last (no groupRowValueSetter)', aggFunc: 'last', expected: false },
        {
            name: 'groupRowValueSetter: true (count) → same as default',
            aggFunc: 'count',
            setter: true,
            expected: false,
        },
        { name: 'groupRowValueSetter: true (min) → same as default', aggFunc: 'min', setter: true, expected: false },
        { name: 'groupRowValueSetter: true (max) → same as default', aggFunc: 'max', setter: true, expected: false },
        {
            name: 'groupRowValueSetter: true (first) → same as default',
            aggFunc: 'first',
            setter: true,
            expected: false,
        },
        { name: 'groupRowValueSetter: true (last) → same as default', aggFunc: 'last', setter: true, expected: false },
        {
            name: 'count with top-level distribution: true → same as default',
            aggFunc: 'count',
            setter: { distribution: true },
            expected: false,
        },
        {
            name: 'count with top-level distribution: "uniform" still disabled',
            aggFunc: 'count',
            setter: { distribution: 'uniform' },
            expected: false,
        },
        {
            name: 'min with top-level distribution: "percentage" still disabled',
            aggFunc: 'min',
            setter: { distribution: 'percentage' },
            expected: false,
        },
        {
            name: 'max with top-level distribution: "increment" still disabled',
            aggFunc: 'max',
            setter: { distribution: 'increment' },
            expected: false,
        },
        {
            name: 'implicit custom string aggFunc',
            aggFunc: 'myAgg',
            expected: false,
            extra: {
                aggFuncs: { myAgg: (params: any) => params.values.reduce((a: number, b: number) => a + b, 0) },
            },
        },
        {
            name: 'implicit function aggFunc',
            aggFunc: ((params: any) => params.values.reduce((a: number, b: number) => a + b, 0)) as any,
            expected: false,
        },

        // --- Editable ---
        {
            name: 'per-aggFunc record { sum: "percentage" }',
            aggFunc: 'sum',
            setter: { distribution: { sum: 'percentage', avg: false } },
            expected: true,
        },
        {
            name: 'per-aggFunc record missing matching aggFunc entry',
            aggFunc: 'sum',
            setter: { distribution: { avg: false } },
            expected: true,
        },
        { name: 'groupRowValueSetter: true (sum)', aggFunc: 'sum', setter: true, expected: true },
        { name: 'distribution: "uniform"', aggFunc: 'sum', setter: { distribution: 'uniform' }, expected: true },
        {
            name: 'per-aggFunc count with distribution: "overwrite" explicitly enabled',
            aggFunc: 'count',
            setter: { distribution: { count: { distribution: 'overwrite', precision: 0 } } },
            expected: true,
        },
        {
            name: 'per-aggFunc sum with distribution: undefined (sum not disabled by default)',
            aggFunc: 'sum',
            setter: { distribution: { sum: { distribution: undefined, precision: 0 } } },
            expected: true,
        },
        { name: 'groupRowValueSetter as function', aggFunc: 'sum', setter: () => false, expected: true },
        {
            name: 'min with top-level distribution: "overwrite" → editable',
            aggFunc: 'min',
            setter: { distribution: 'overwrite' },
            expected: true,
        },
        {
            name: 'per-aggFunc max with overwrite → editable',
            aggFunc: 'max',
            setter: { distribution: { max: 'overwrite' } },
            expected: true,
        },
        {
            name: 'per-aggFunc first with true → editable',
            aggFunc: 'first',
            setter: { distribution: { first: true } },
            expected: true,
        },
        {
            name: 'per-aggFunc last with { distribution: "overwrite" } → editable',
            aggFunc: 'last',
            setter: { distribution: { last: { distribution: 'overwrite' } } },
            expected: true,
        },
        { name: 'implicit sum (no groupRowValueSetter)', aggFunc: 'sum', expected: true },
        { name: 'implicit avg (no groupRowValueSetter)', aggFunc: 'avg', expected: true },
    ])('$name → editable=$expected', async ({ aggFunc, setter, expected, extra }: any) => {
        const api = await gridsManager.createGridAndWait('editability-test', {
            ...extra,
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                {
                    field: 'amount',
                    aggFunc,
                    editable: true,
                    groupRowEditable: true,
                    ...(setter !== undefined ? { groupRowValueSetter: setter } : {}),
                },
            ],
            rowData: ROW_DATA,
            groupDefaultExpanded: -1,
            getRowId: (params: any) => params.data.id,
        });

        const groupRowNode = api.getDisplayedRowAtIndex(0);
        expect(groupRowNode?.group).toBe(true);
        expect(api.getColumn('amount')!.isCellEditable(groupRowNode!)).toBe(expected);
    });

    test('leaf rows remain editable when group distribution is suppressed', async () => {
        const api = await gridsManager.createGridAndWait('leaf-editable-check', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: { distribution: false },
                },
            ],
            rowData: ROW_DATA,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `leaf rows remain editable when group distribution is suppressed setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum editable
            `);
        await new GridRows(api, `leaf rows remain editable when group distribution is suppressed setup`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" amount:30
            · ├── LEAF id:a-1 category:"A" amount:10
            · └── LEAF id:a-2 category:"A" amount:20
        `);

        const column = api.getColumn('amount')!;
        const groupRowNode = api.getDisplayedRowAtIndex(0)!;
        expect(column.isCellEditable(groupRowNode)).toBe(false);
        expect(column.isCellEditable(api.getRowNode('a-1')!)).toBe(true);
        await new GridRows(api, `leaf rows remain editable when group distribution is suppressed final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" amount:30
                · ├── LEAF id:a-1 category:"A" amount:10
                · └── LEAF id:a-2 category:"A" amount:20
            `
        );
    });
});

describe('suppressDoubleClickExpand with groupRowEditable', () => {
    test('double-click does not expand/collapse when suppressDoubleClickExpand is true', async () => {
        const api = gridsManager.createGrid('suppress-dblclick-expand', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: { suppressDoubleClickExpand: true },
                },
                { field: 'category', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                },
            ],
            rowData: [
                { id: '1', category: 'A', amount: 10 },
                { id: '2', category: 'A', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `double-click does not expand/collapse when suppressDoubleClickExpand is true setup`)
            .checkColumns(`
                CENTER
                ├── group "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum editable
            `);
        await new GridRows(api, `double-click does not expand/collapse when suppressDoubleClickExpand is true setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-category-A amount:30
                · ├── LEAF id:1 category:"A" amount:10
                · └── LEAF id:2 category:"A" amount:20
            `);
        await asyncSetTimeout(0);

        const groupNode = api.getDisplayedRowAtIndex(0)!;
        expect(groupNode.group).toBe(true);
        expect(groupNode.expanded).toBe(true);

        // Double-click the group cell — should NOT collapse when suppressDoubleClickExpand is true
        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const groupCell = gridDiv.querySelector<HTMLElement>(`[row-id="${groupNode.id}"] [col-id="group"]`);
        expect(groupCell).not.toBeNull();

        await userEvent.dblClick(groupCell!);
        await asyncSetTimeout(0);

        // Node should still be expanded — suppressDoubleClickExpand prevents collapse
        expect(groupNode.expanded).toBe(true);
        await new GridRows(
            api,
            `double-click does not expand/collapse when suppressDoubleClickExpand is true final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-category-A amount:30
            · ├── LEAF id:1 category:"A" amount:10
            · └── LEAF id:2 category:"A" amount:20
        `);
    });
});

describe('groupRowValueSetter on columns without field or valueSetter', () => {
    test('column with valueGetter and groupRowValueSetter (no field/valueSetter) allows group editing', async () => {
        const groupRowValueSetterCalls: any[] = [];

        const api = gridsManager.createGrid('no-field-groupRowValueSetter', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', editable: true },
                {
                    colId: 'computed',
                    headerName: 'Computed',
                    valueGetter: ({ data }) => (data ? data.amount * 2 : null),
                    aggFunc: 'sum',
                    editable: false,
                    groupRowEditable: true,
                    groupRowValueSetter: (params) => {
                        groupRowValueSetterCalls.push(params);
                        const value = Number(params.newValue);
                        if (!Number.isFinite(value)) {
                            return false;
                        }
                        let changed = false;
                        for (const child of params.aggregatedChildren) {
                            if (child.setDataValue('amount', value, 'data')) {
                                changed = true;
                            }
                        }
                        return changed;
                    },
                },
            ],
            rowData: [
                { id: '1', category: 'A', amount: 10 },
                { id: '2', category: 'A', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(
            api,
            `column with valueGetter and groupRowValueSetter (no field/valueSetter) allows gr setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── amount "Amount" width:200 aggFunc:sum editable
            └── computed "Computed" width:200 aggFunc:sum
        `);
        await new GridRows(
            api,
            `column with valueGetter and groupRowValueSetter (no field/valueSetter) allows gr setup`
        ).check(`
            ROOT id:ROOT_NODE_ID computed:null
            └─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" amount:30 computed:60
            · ├── LEAF id:1 category:"A" amount:10 computed:20
            · └── LEAF id:2 category:"A" amount:20 computed:40
        `);
        await asyncSetTimeout(0);

        const groupNode = api.getDisplayedRowAtIndex(0)!;
        expect(groupNode.group).toBe(true);

        // Edit the computed column on the group row via UI
        await editCell(api, groupNode, 'computed', '50');

        // groupRowValueSetter should have been called
        expect(groupRowValueSetterCalls).toHaveLength(1);
        expect(groupRowValueSetterCalls[0].newValue).toBe('50');

        // Children should have been updated
        const child1 = api.getRowNode('1')!;
        const child2 = api.getRowNode('2')!;
        expect(child1.data.amount).toBe(50);
        expect(child2.data.amount).toBe(50);
        await new GridRows(
            api,
            `column with valueGetter and groupRowValueSetter (no field/valueSetter) allows gr final state`
        ).check(`
            ROOT id:ROOT_NODE_ID computed:null
            └─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" amount:100 computed:200
            · ├── LEAF id:1 category:"A" amount:50 computed:100
            · └── LEAF id:2 category:"A" amount:50 computed:100
        `);
    });

    test('column with valueGetter, valueSetter, and groupRowValueSetter allows group editing', async () => {
        const valueSetterCalls: any[] = [];
        const groupRowValueSetterCalls: any[] = [];

        const api = gridsManager.createGrid('valueSetter-groupRowValueSetter', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'amount', editable: true },
                {
                    colId: 'computed',
                    headerName: 'Computed',
                    valueGetter: ({ data }) => (data ? data.amount * 2 : null),
                    valueSetter: (params) => {
                        valueSetterCalls.push(params);
                        return true;
                    },
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: (params) => {
                        groupRowValueSetterCalls.push(params);
                        const value = Number(params.newValue);
                        if (!Number.isFinite(value)) {
                            return false;
                        }
                        let changed = false;
                        for (const child of params.aggregatedChildren) {
                            if (child.setDataValue('amount', value, 'data')) {
                                changed = true;
                            }
                        }
                        return changed;
                    },
                },
            ],
            rowData: [
                { id: '1', category: 'A', amount: 10 },
                { id: '2', category: 'A', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(
            api,
            `column with valueGetter, valueSetter, and groupRowValueSetter allows group editi setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── amount "Amount" width:200 editable
            └── computed "Computed" width:200 aggFunc:sum editable
        `);
        await new GridRows(
            api,
            `column with valueGetter, valueSetter, and groupRowValueSetter allows group editi setup`
        ).check(`
            ROOT id:ROOT_NODE_ID computed:null
            └─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" computed:60
            · ├── LEAF id:1 category:"A" amount:10 computed:20
            · └── LEAF id:2 category:"A" amount:20 computed:40
        `);
        await asyncSetTimeout(0);

        const groupNode = api.getDisplayedRowAtIndex(0)!;
        expect(groupNode.group).toBe(true);

        // Edit the computed column on the group row
        await editCell(api, groupNode, 'computed', '50');

        // groupRowValueSetter should have been called, not valueSetter (group row)
        expect(groupRowValueSetterCalls).toHaveLength(1);

        // Children should have been updated
        const child1 = api.getRowNode('1')!;
        const child2 = api.getRowNode('2')!;
        expect(child1.data.amount).toBe(50);
        expect(child2.data.amount).toBe(50);

        // Now edit a leaf row — should use valueSetter
        valueSetterCalls.length = 0;
        groupRowValueSetterCalls.length = 0;
        await editCell(api, child1, 'computed', '99');

        expect(valueSetterCalls).toHaveLength(1);
        expect(groupRowValueSetterCalls).toHaveLength(0);
        await new GridRows(
            api,
            `column with valueGetter, valueSetter, and groupRowValueSetter allows group editi final state`
        ).check(`
            ROOT id:ROOT_NODE_ID computed:null
            └─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" computed:200
            · ├── LEAF id:1 category:"A" amount:50 computed:100
            · └── LEAF id:2 category:"A" amount:50 computed:100
        `);
    });

    test('group row with null data does not call valueSetter, only groupRowValueSetter', async () => {
        const valueSetterCalls: any[] = [];
        const groupRowValueSetterCalls: any[] = [];

        const api = gridsManager.createGrid('null-data-group', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    valueSetter: (params) => {
                        valueSetterCalls.push(params);
                        if (params.data && params.colDef.field) {
                            (params.data as Record<string, any>)[params.colDef.field] = params.newValue;
                        }
                        return true;
                    },
                    groupRowEditable: true,
                    groupRowValueSetter: (params) => {
                        groupRowValueSetterCalls.push(params);
                        const value = Number(params.newValue);
                        if (!Number.isFinite(value)) {
                            return false;
                        }
                        let changed = false;
                        for (const child of params.aggregatedChildren) {
                            if (child.setDataValue(params.column, value, 'data')) {
                                changed = true;
                            }
                        }
                        return changed;
                    },
                },
            ],
            rowData: [
                { id: '1', category: 'A', amount: 10 },
                { id: '2', category: 'A', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `group row with null data does not call valueSetter, only groupRowValueSetter setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum editable
            `);
        await new GridRows(api, `group row with null data does not call valueSetter, only groupRowValueSetter setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" amount:30
                · ├── LEAF id:1 category:"A" amount:10
                · └── LEAF id:2 category:"A" amount:20
            `);
        await asyncSetTimeout(0);

        const groupNode = api.getDisplayedRowAtIndex(0)!;
        expect(groupNode.group).toBe(true);
        expect(groupNode.data).toBeUndefined();

        // Edit the group row
        await editCell(api, groupNode, 'amount', '50');

        // groupRowValueSetter called, valueSetter NOT called for the group row
        expect(groupRowValueSetterCalls).toHaveLength(1);
        const groupValueSetterCallNodeIds = valueSetterCalls
            .filter((c: any) => c.node?.group)
            .map((c: any) => c.node.id);
        expect(groupValueSetterCallNodeIds).toHaveLength(0);

        // Children should have been updated
        const child1 = api.getRowNode('1')!;
        const child2 = api.getRowNode('2')!;
        expect(child1.data.amount).toBe(50);
        expect(child2.data.amount).toBe(50);
        await new GridRows(
            api,
            `group row with null data does not call valueSetter, only groupRowValueSetter final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A" amount:100
            · ├── LEAF id:1 category:"A" amount:50
            · └── LEAF id:2 category:"A" amount:50
        `);
    });
});
