import { userEvent } from '@testing-library/user-event';

import type { ColDef, GridApi, GridOptions, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';
import { expect } from '../test-utils/matchers';

const gridsManager = new TestGridsManager({
    modules: [ClientSideRowModelModule, RowGroupingModule, TreeDataModule],
});

const GROUP_COL_ID = 'group';

type EditableCallback = Exclude<NonNullable<ColDef['editable']>, boolean>;
type GroupRowEditableCallback = Exclude<NonNullable<ColDef['groupRowEditable']>, boolean>;
type ValueSetterCallback = Extract<NonNullable<ColDef['valueSetter']>, (...args: any[]) => any>;

afterEach(() => {
    gridsManager.reset();
});

async function editCell(api: GridApi, rowNode: IRowNode, colId: string, newValue: string) {
    const gridDiv = TestGridsManager.getHTMLElement(api);
    expect(gridDiv).not.toBeNull();

    const rowId = rowNode.id;
    expect(rowId).toBeDefined();

    const rowIndex = rowNode.rowIndex;
    expect(rowIndex).not.toBeNull();

    let cell = gridDiv!.querySelector<HTMLElement>(`[row-id="${rowId}"] [col-id="${colId}"]`);
    if (!cell && rowIndex != null) {
        const rowElement = gridDiv!.querySelector<HTMLElement>(`.ag-row[aria-rowindex="${rowIndex + 1}"]`);
        cell = rowElement?.querySelector<HTMLElement>(`[col-id="${colId}"]`) ?? null;
    }
    expect(cell).not.toBeNull();

    await userEvent.click(cell!);

    api.setFocusedCell(rowIndex!, colId);
    api.startEditingCell({ rowIndex: rowIndex!, rowPinned: rowNode.rowPinned, colKey: colId });

    const input = await waitForInput(gridDiv!, cell ?? gridDiv!);
    await userEvent.clear(input);
    await userEvent.type(input, `${newValue}{Enter}`);
    await asyncSetTimeout(0);

    return cell!;
}

function findRowNode(api: GridApi, predicate: (rowNode: IRowNode) => boolean | undefined) {
    let match: IRowNode | undefined;
    api.forEachNode((rowNode) => {
        if (!match && predicate(rowNode)) {
            match = rowNode;
        }
    });

    return match;
}

describe('groupRowEditable behaviour', () => {
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
            return true;
        };

        const gridOptions: GridOptions = {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            enableGroupEdit: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: GROUP_COL_ID,
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

        groupRowEditableCalls.length = 0;
        editableCalls.length = 0;
        valueSetterCalls.length = 0;
        const groupColumn = api.getDisplayedCenterColumns()[0]!;
        expect(groupColumn.getColDef().groupRowEditable).toBe(groupRowEditable);
        expect(groupColumn.isCellEditable(groupRowNode!)).toBe(true);
        const groupColId = groupColumn.getColId();
        await editCell(api, groupRowNode!, groupColId, 'Edited Group');

        expect(groupRowEditableCalls.length).toBeGreaterThan(0);
        expect(editableCalls.length).toBe(0);
        expect(valueSetterCalls.length).toBe(1);
        expect(committedValues.get(groupRowNode!.id!)).toBe('Edited Group');

        const leafRowNode = api.getRowNode('a-1');
        expect(leafRowNode).toBeDefined();

        groupRowEditableCalls.length = 0;
        editableCalls.length = 0;
        valueSetterCalls.length = 0;
        await editCell(api, leafRowNode!, groupColId, 'Edited Leaf');

        const groupRowEditableCallIds = groupRowEditableCalls.map(([params]) => params?.node?.id);
        expect(groupRowEditableCallIds).not.toContain(leafRowNode!.id);
        expect(editableCalls.length).toBeGreaterThan(0);
        expect(valueSetterCalls.length).toBe(1);
        expect(committedValues.get('a-1')).toBe('Edited Leaf');
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
            return true;
        };

        const api = await gridsManager.createGridAndWait('tree-data-filler-groupRowEditable', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            enableGroupEdit: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: GROUP_COL_ID,
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

        const fillerRowNode = findRowNode(api, (node) => node.group && !node.data);
        expect(fillerRowNode).toBeDefined();

        const groupColumn = api.getDisplayedCenterColumns()[0]!;
        expect(groupColumn.getColDef().groupRowEditable).toBe(groupRowEditable);
        const originalLabel = fillerRowNode!.data?.label;

        groupRowEditableCalls.length = 0;
        editableCalls.length = 0;
        valueSetterCalls.length = 0;
        await editCell(api, fillerRowNode!, GROUP_COL_ID, 'Edited Filler');

        expect(groupRowEditableCalls.length).toBeGreaterThan(0);
        expect(editableCalls.length).toBe(0);
        expect(valueSetterCalls.length).toBeGreaterThan(0);
        expect(fillerRowNode!.data?.label).toBe(originalLabel);
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
        const valueSetterCalls: Parameters<ValueSetterCallback>[] = [];
        const valueSetter: ValueSetterCallback = (params) => {
            valueSetterCalls.push([params]);
            if (params.data) {
                params.data.label = params.newValue;
            }
            return true;
        };

        const api = await gridsManager.createGridAndWait('tree-data-groupRowEditable', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            enableGroupEdit: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: GROUP_COL_ID,
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
        await editCell(api, earthRowNode!, GROUP_COL_ID, 'Edited Earth');

        expect(groupRowEditableCalls.length).toBeGreaterThan(0);
        expect(editableCalls.length).toBe(0);
        expect(valueSetterCalls.length).toBe(1);
        expect(rowData[0].label).toBe('Edited Earth');
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
        const valueSetterCalls: Parameters<ValueSetterCallback>[] = [];
        const valueSetter: ValueSetterCallback = (params) => {
            valueSetterCalls.push([params]);
            if (params.data) {
                params.data.label = params.newValue;
            }
            return true;
        };

        const api = await gridsManager.createGridAndWait('tree-data-groupRowEditable-fallback', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            enableGroupEdit: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: GROUP_COL_ID,
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
        await editCell(api, earthRowNode!, GROUP_COL_ID, 'Edited Earth');

        expect(editableCalls.length).toBeGreaterThan(0);
        expect(valueSetterCalls.length).toBe(1);
        expect(rowData[0].label).toBe('Edited Earth');
    });
});
