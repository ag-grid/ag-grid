import type { GridApi, GridOptions, IRowNode, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowDragModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { getData } from './data';
import type { IFile } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TreeDataModule,
    RowDragModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const gridOptions: GridOptions<IFile> = {
    columnDefs: [
        {
            field: 'type',
            headerName: 'Type',
            width: 90,
        },
        {
            field: 'dateModified',
            headerName: 'Modified',
            width: 130,
        },
        {
            field: 'size',
            aggFunc: 'sum',
            width: 140,
            valueFormatter: (params: ValueFormatterParams<IFile, number>) =>
                params.value ? params.value.toFixed(1) + ' MB' : '',
        },
    ],
    autoGroupColumnDef: {
        headerName: 'Task',
        field: 'name',
        rowDrag: true,
        flex: 2,
        minWidth: 200,
    },
    rowData: getData(),
    getRowId: (params) => params.data.id,
    treeData: true,
    treeDataChildrenField: 'children',
    groupDefaultExpanded: -1,
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    isRowValidDropPosition: (params) => {
        let { newParent, rows } = params;

        if (isReadonlyFolder(newParent) || isInsideReadonlyFolder(newParent)) {
            return { rows: null }; // Prevent dropping into a readonly folder
        }

        if (newParent) {
            // Prevent moving a readonly folder into another folder
            rows = rows.filter((row) => !isReadonlyFolder(row));
        }

        // Filter out anything that is inside a readonly folder, it cannot be moved
        rows = rows.filter((row) => !isInsideReadonlyFolder(row));

        if (newParent && newParent.data && newParent.data.type !== 'folder') {
            // Block changing parents on anything that is not of type 'folder'
            return { newParent: null };
        }

        return { rows };
    },
};

/** Returns true if the row is a readonly folder, false if it is a file or a normal folder */
function isReadonlyFolder(row: IRowNode<IFile> | null) {
    return !!row && row.data?.type === 'readonly-folder';
}

/** Returns true if the row is a file or folder inside a readonly folder */
function isInsideReadonlyFolder(row: IRowNode<IFile> | null): boolean {
    if (!row || !row.parent) {
        return false; // Root level
    }
    if (isReadonlyFolder(row.parent)) {
        return true;
    }
    return isInsideReadonlyFolder(row.parent);
}

const eGridDiv = document.getElementById('myGrid');
let gridApi: GridApi<IFile>;
gridApi = createGrid(eGridDiv!, gridOptions) as GridApi<IFile>;
