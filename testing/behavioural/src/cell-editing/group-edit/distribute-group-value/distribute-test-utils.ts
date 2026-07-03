import type { ColDef, GridApi, GroupRowValueSetterOptions, IRowNode } from 'ag-grid-community';
import { distributeGroupValue } from 'ag-grid-enterprise';

import { GridRows, asyncSetTimeout } from '../../../test-utils';
import { createGroupRowData as createRowData, gridsManager } from '../group-edit-test-utils';

export { EDIT_MODES, asyncSetTimeout, editCell, gridsManager, performEdit } from '../group-edit-test-utils';
export { GridRows, GridColumns } from '../../../test-utils';
export { distributeGroupValue } from 'ag-grid-enterprise';
export { createGroupRowData as createRowData } from '../group-edit-test-utils';

/**
 * Used with `.each` to test both:
 * - custom function: `groupRowValueSetter: (params) => distributeGroupValue(params, options)`
 * - options object: `groupRowValueSetter: options`
 */
export const SETTER_MODES: [string, (opts: GroupRowValueSetterOptions) => Pick<ColDef, 'groupRowValueSetter'>][] = [
    ['function', (opts) => ({ groupRowValueSetter: (params) => distributeGroupValue(params, opts) })],
    ['options', (opts) => ({ groupRowValueSetter: opts })],
];

/** Starts editing a group row cell via the API and returns a during-edit GridRows instance. */
export async function startEditAndSnapshot(api: GridApi, node: IRowNode, colId: string, label: string) {
    api.setFocusedCell(node.rowIndex!, colId);
    api.startEditingCell({ rowIndex: node.rowIndex!, colKey: colId });
    await asyncSetTimeout(0);
    return new GridRows(api, label);
}

export function createGrid(id: string, extraColProps?: ColDef) {
    return gridsManager.createGridAndWait(id, {
        defaultColDef: { cellEditor: 'agTextCellEditor' },
        undoRedoCellEditing: true,
        groupDisplayType: 'custom',
        columnDefs: [
            { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
            { field: 'region', rowGroup: true, hide: true },
            { field: 'country', rowGroup: true, hide: true },
            {
                colId: 'amount',
                field: 'amount',
                aggFunc: 'sum',
                editable: true,
                groupRowEditable: true,
                ...extraColProps,
            },
        ],
        rowData: createRowData(),
        groupDefaultExpanded: -1,
        getRowId: (params) => params.data?.id,
    });
}

/** Creates a simple grid with custom row data and column props. */
export function createSimpleGrid(
    id: string,
    rowData: any[],
    extraColProps?: ColDef,
    extraColumnDefs?: ColDef[],
    extraGridOptions?: Record<string, any>
) {
    return gridsManager.createGridAndWait(id, {
        defaultColDef: { cellEditor: 'agTextCellEditor' },
        groupDisplayType: 'custom',
        columnDefs: [
            { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
            { field: 'region', rowGroup: true, hide: true },
            { field: 'country', rowGroup: true, hide: true },
            {
                colId: 'amount',
                field: 'amount',
                aggFunc: 'sum',
                editable: true,
                groupRowEditable: true,
                ...extraColProps,
            },
            ...(extraColumnDefs ?? []),
        ],
        rowData,
        groupDefaultExpanded: -1,
        getRowId: (params) => params.data?.id,
        ...extraGridOptions,
    });
}
