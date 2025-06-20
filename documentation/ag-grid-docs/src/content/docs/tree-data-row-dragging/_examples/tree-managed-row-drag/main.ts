import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowDragModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import type { Task } from './data';
import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TreeDataModule,
    RowDragModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

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
    treeDataParentIdField: 'parentId',
    groupDefaultExpanded: -1,
    rowDragManaged: true,
    rowDragInsertDelay: 500,
    suppressMoveWhenRowDragging: true,
};

const eGridDiv = document.getElementById('myGrid');
let gridApi: GridApi<Task>;
gridApi = createGrid(eGridDiv!, gridOptions) as GridApi<Task>;
