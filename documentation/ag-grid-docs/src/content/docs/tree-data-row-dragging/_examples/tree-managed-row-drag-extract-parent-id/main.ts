import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
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
    ClientSideRowModelApiModule,
    TreeDataModule,
    RowDragModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const exportData = (api: GridApi<Task>) => {
    const exported: Task[] = [];
    api.forEachLeafNode((node) => {
        exported.push({ ...node.data!, parentId: node.parent?.data?.id });
    });
    return exported;
};

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
    onRowDragEnd: (event) => {
        const exportedData = exportData(event.api);
        const json = JSON.stringify(exportedData, null, 2);
        document.getElementById('exported-data-content')!.textContent = json;
    },
};

const eGridDiv = document.getElementById('myGrid');
let gridApi: GridApi<Task>;
gridApi = createGrid(eGridDiv!, gridOptions) as GridApi<Task>;
