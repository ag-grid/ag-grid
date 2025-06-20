import type { GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowDragModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { type IFile, getData } from './data';

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
            valueFormatter: (params: ValueFormatterParams) => (params.value ? params.value + ' MB' : ''),
            width: 140,
            aggFunc: 'sum',
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
    canDropOnRow: (params) => {
        if (!params.newParent) {
            return true; // Not changing parent, allow drop
        }
        if (params.newParent?.data?.type === 'folder') {
            return true; // Allow dropping on folders
        }
        return false; // Prevent dropping on anything else
    },
};

const eGridDiv = document.getElementById('myGrid');
let gridApi: GridApi<IFile>;
gridApi = createGrid(eGridDiv!, gridOptions) as GridApi<IFile>;
