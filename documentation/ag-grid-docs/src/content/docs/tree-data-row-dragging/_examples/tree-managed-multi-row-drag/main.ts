import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowDragModule,
    RowSelectionModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import type { Task } from './data';
import { getData } from './data';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, TreeDataModule, RowDragModule, RowSelectionModule]);

const gridOptions: GridOptions<Task> = {
    columnDefs: [{ field: 'assignee' }],

    autoGroupColumnDef: {
        headerName: 'Task',
        field: 'title',
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
    rowDragMultiRow: true,
    rowSelection: {
        mode: 'multiRow',
    },
    suppressMoveWhenRowDragging: true,
};

const eGridDiv = document.getElementById('myGrid');
let gridApi: GridApi<Task>;
gridApi = createGrid(eGridDiv!, gridOptions) as GridApi<Task>;
